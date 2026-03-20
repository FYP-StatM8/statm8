from typing import Dict, List, Any
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')

class DataPreprocessor:
    """Utility class for data preprocessing"""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.imputers = {}
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = "mean") -> pd.DataFrame:
        """Handle missing values in the dataframe"""
        df_processed = df.copy()
        
        # Handle numeric columns
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            if strategy == "mean":
                imputer = SimpleImputer(strategy='mean')
            elif strategy == "median":
                imputer = SimpleImputer(strategy='median')
            else:
                imputer = SimpleImputer(strategy='most_frequent')
            
            df_processed[numeric_cols] = imputer.fit_transform(df_processed[numeric_cols])
            self.imputers['numeric'] = imputer
        
        # Handle categorical columns
        categorical_cols = df_processed.select_dtypes(include=['object']).columns
        if len(categorical_cols) > 0:
            imputer = SimpleImputer(strategy='most_frequent')
            df_processed[categorical_cols] = imputer.fit_transform(df_processed[categorical_cols])
            self.imputers['categorical'] = imputer
        
        return df_processed
    
    def encode_categorical_variables(self, df: pd.DataFrame, method: str = "label") -> pd.DataFrame:
        """Encode categorical variables"""
        df_processed = df.copy()
        categorical_cols = df_processed.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if method == "label":
                encoder = LabelEncoder()
                df_processed[col] = encoder.fit_transform(df_processed[col].astype(str))
                self.encoders[col] = encoder
            elif method == "onehot":
                # One-hot encoding
                dummies = pd.get_dummies(df_processed[col], prefix=col)
                df_processed = df_processed.drop(columns=[col])
                df_processed = pd.concat([df_processed, dummies], axis=1)
        
        return df_processed
    
    def scale_features(self, df: pd.DataFrame, method: str = "standard") -> pd.DataFrame:
        """Scale numerical features"""
        df_processed = df.copy()
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) > 0:
            if method == "standard":
                scaler = StandardScaler()
            else:
                from sklearn.preprocessing import MinMaxScaler
                scaler = MinMaxScaler()
            
            df_processed[numeric_cols] = scaler.fit_transform(df_processed[numeric_cols])
            self.scalers['numeric'] = scaler
        
        return df_processed
    
    def detect_outliers(self, df: pd.DataFrame, method: str = "iqr") -> Dict[str, List]:
        """Detect outliers in the data"""
        outliers = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if method == "iqr":
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outlier_indices = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index.tolist()
                outliers[col] = outlier_indices
            
            elif method == "zscore":
                from scipy import stats
                z_scores = np.abs(stats.zscore(df[col]))
                outlier_indices = df[z_scores > 3].index.tolist()
                outliers[col] = outlier_indices
        
        return outliers
    
    def get_feature_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get comprehensive information about features"""
        info = {
            "total_features": len(df.columns),
            "numeric_features": len(df.select_dtypes(include=[np.number]).columns),
            "categorical_features": len(df.select_dtypes(include=['object']).columns),
            "missing_values_per_column": df.isnull().sum().to_dict(),
            "unique_values_per_column": df.nunique().to_dict(),
            "data_types": df.dtypes.astype(str).to_dict()
        }
        return info
