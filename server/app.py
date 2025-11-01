from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder
import json
import io
import base64
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from groq import Groq
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report
from sklearn.cluster import KMeans
from scipy import stats
from logging import getLogger, DEBUG
import warnings
warnings.filterwarnings('ignore')

# Load environment variables
load_dotenv()
logger = getLogger(__name__)
logger.setLevel(DEBUG)

app = FastAPI(
    title="StatM8 Data Analytics API",
    version="1.0.0",
    description="""
    ## StatM8 Data Analytics API
    
    A comprehensive data analytics API that provides statistical analysis, machine learning, and data visualization capabilities.
    
    ### Features:
    * **File Upload**: Support for CSV, Excel, and JSON files
    * **Basic Analysis**: Descriptive statistics, data types, missing values analysis
    * **Correlation Analysis**: Correlation matrices with visualizations
    * **Data Visualization**: Automatic chart generation (histograms, scatter plots, box plots)
    * **Machine Learning**: Classification and regression analysis with feature importance
    * **Clustering**: K-means clustering analysis
    * **AI Query**: Natural language queries about your data using AI
    
    ### Usage Flow:
    1. Upload your data file using `/upload`
    2. Get basic insights with `/analyze/basic`
    3. Explore correlations with `/analyze/correlation`
    4. Generate visualizations with `/visualize`
    5. Perform ML analysis with `/analyze/ml`
    6. Ask questions about your data with `/query`
    """,
    contact={
        "name": "StatM8 Team",
        "email": "contact@statm8.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:8082"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq
print(os.getenv("GROQ_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class DataAnalyzer:
    def __init__(self):
        self.df = None
        self.analysis_results = {}
    
    def load_data(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Load data from uploaded file"""
        try:
            file_extension = filename.split('.')[-1].lower()
            
            if file_extension == 'csv':
                self.df = pd.read_csv(io.BytesIO(file_content))
            elif file_extension in ['xlsx', 'xls']:
                self.df = pd.read_excel(io.BytesIO(file_content))
            elif file_extension == 'json':
                self.df = pd.read_json(io.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            return {
                "success": True,
                "message": f"Successfully loaded data with {len(self.df)} rows and {len(self.df.columns)} columns",
                "shape": self.df.shape,
                "columns": list(self.df.columns),
                "data_types": self.df.dtypes.astype(str).to_dict()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error loading file: {str(e)}")
    
    def basic_analysis(self) -> Dict[str, Any]:
        """Perform basic statistical analysis"""

        if self.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        logger.debug(f"Numeric columns: {numeric_cols}")
        logger.debug(f"Categorical columns: {categorical_cols}")
        
        # Convert NumPy types to Python native types for JSON serialization
        missing_values = self.df.isnull().sum().to_dict()
        missing_values = {k: int(v) for k, v in missing_values.items()}
        
        memory_usage = int(self.df.memory_usage(deep=True).sum())
        
        # Convert descriptive stats to native Python types
        descriptive_stats = {}
        if len(numeric_cols) > 0:
            desc_df = self.df.describe()
            for col in desc_df.columns:
                descriptive_stats[col] = {
                    stat: float(value) if pd.notna(value) else None 
                    for stat, value in desc_df[col].items()
                }
        
        # Convert data preview to native Python types
        data_preview = []
        for record in self.df.head().to_dict('records'):
            converted_record = {}
            for k, v in record.items():
                if pd.isna(v):
                    converted_record[k] = None
                elif isinstance(v, (np.integer, np.int64, np.int32)):
                    converted_record[k] = int(v)
                elif isinstance(v, (np.floating, np.float64, np.float32)):
                    converted_record[k] = float(v)
                else:
                    converted_record[k] = v
            data_preview.append(converted_record)
        
        analysis = {
            "basic_info": {
                "shape": list(self.df.shape),
                "columns": list(self.df.columns),
                "numeric_columns": list(numeric_cols),
                "categorical_columns": list(categorical_cols),
                "missing_values": missing_values,
                "memory_usage": memory_usage
            },
            "descriptive_stats": descriptive_stats,
            "data_preview": data_preview
        }
        
        return analysis
    
    def correlation_analysis(self) -> Dict[str, Any]:
        """Perform correlation analysis"""
        if self.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            return {"message": "Need at least 2 numeric columns for correlation analysis"}
        
        correlation_matrix = self.df[numeric_cols].corr()
        
        # Create correlation heatmap
        plt.figure(figsize=(10, 8))
        sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
        plt.title('Correlation Matrix')
        
        # Convert plot to base64 string
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', dpi=150)
        buffer.seek(0)
        plot_data = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        # Convert correlation matrix to native Python types
        correlation_dict = {}
        for col in correlation_matrix.columns:
            correlation_dict[col] = {
                row: float(correlation_matrix.loc[row, col]) if pd.notna(correlation_matrix.loc[row, col]) else None
                for row in correlation_matrix.index
            }
        
        return {
            "correlation_matrix": correlation_dict,
            "heatmap": plot_data,
            "strong_correlations": self._find_strong_correlations(correlation_matrix)
        }
    
    def _find_strong_correlations(self, corr_matrix, threshold=0.7):
        """Find strong correlations"""
        strong_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > threshold:
                    strong_corr.append({
                        "var1": str(corr_matrix.columns[i]),
                        "var2": str(corr_matrix.columns[j]),
                        "correlation": float(round(corr_val, 3))
                    })
        return strong_corr
    
    def generate_visualizations(self, chart_type: str = "auto") -> Dict[str, Any]:
        """Generate various visualizations"""
        if self.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        
        plots = {}
        
        if chart_type == "auto" or chart_type == "distribution":
            # Distribution plots for numeric columns
            for col in numeric_cols[:3]:  # Limit to first 3 columns
                fig = px.histogram(self.df, x=col, title=f'Distribution of {col}')
                plots[f"distribution_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
        
        if chart_type == "auto" or chart_type == "scatter" and len(numeric_cols) >= 2:
            # Scatter plot for first two numeric columns
            fig = px.scatter(self.df, x=numeric_cols[0], y=numeric_cols[1], 
                           title=f'{numeric_cols[0]} vs {numeric_cols[1]}')
            plots["scatter"] = json.dumps(fig, cls=PlotlyJSONEncoder)
        
        if chart_type == "auto" or chart_type == "box" and len(categorical_cols) > 0 and len(numeric_cols) > 0:
            # Box plot
            fig = px.box(self.df, x=categorical_cols[0], y=numeric_cols[0],
                        title=f'{numeric_cols[0]} by {categorical_cols[0]}')
            plots["box"] = json.dumps(fig, cls=PlotlyJSONEncoder)
        
        return {"visualizations": plots}
    
    def perform_ml_analysis(self, target_column: str, task_type: str = "auto") -> Dict[str, Any]:
        """Perform machine learning analysis"""
        if self.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        if target_column not in self.df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found")
        
        # Prepare data
        X = self.df.drop(columns=[target_column])
        y = self.df[target_column]
        
        # Handle categorical variables
        for col in X.select_dtypes(include=['object']).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
        
        # Determine task type
        if task_type == "auto":
            if y.dtype == 'object' or len(y.unique()) < 10:
                task_type = "classification"
            else:
                task_type = "regression"
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        results = {"task_type": task_type}
        
        if task_type == "classification":
            # Handle target encoding for classification
            if y.dtype == 'object':
                le_target = LabelEncoder()
                y_train = le_target.fit_transform(y_train)
                y_test = le_target.transform(y_test)
            
            # Random Forest Classifier
            rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
            rf_model.fit(X_train, y_train)
            rf_pred = rf_model.predict(X_test)
            
            results["random_forest"] = {
                "accuracy": accuracy_score(y_test, rf_pred),
                "feature_importance": dict(zip(X.columns, rf_model.feature_importances_))
            }
            
        else:  # regression
            # Linear Regression
            lr_model = LinearRegression()
            lr_model.fit(X_train, y_train)
            lr_pred = lr_model.predict(X_test)
            
            # Random Forest Regressor
            rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
            rf_model.fit(X_train, y_train)
            rf_pred = rf_model.predict(X_test)
            
            results["linear_regression"] = {
                "mse": mean_squared_error(y_test, lr_pred),
                "r2_score": lr_model.score(X_test, y_test)
            }
            
            results["random_forest"] = {
                "mse": mean_squared_error(y_test, rf_pred),
                "r2_score": rf_model.score(X_test, y_test),
                "feature_importance": dict(zip(X.columns, rf_model.feature_importances_))
            }
        
        return results
    
    def clustering_analysis(self, n_clusters: int = 3) -> Dict[str, Any]:
        """Perform clustering analysis"""
        if self.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 numeric columns for clustering")
        
        # Prepare data
        X = self.df[numeric_cols].fillna(self.df[numeric_cols].mean())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Add cluster labels to dataframe
        df_clustered = self.df.copy()
        df_clustered['cluster'] = clusters
        
        # Create cluster visualization
        if len(numeric_cols) >= 2:
            fig = px.scatter(df_clustered, x=numeric_cols[0], y=numeric_cols[1], 
                           color='cluster', title='Cluster Analysis')
            cluster_plot = json.dumps(fig, cls=PlotlyJSONEncoder)
        else:
            cluster_plot = None
        
        return {
            "n_clusters": n_clusters,
            "cluster_centers": kmeans.cluster_centers_.tolist(),
            "inertia": kmeans.inertia_,
            "cluster_sizes": pd.Series(clusters).value_counts().to_dict(),
            "visualization": cluster_plot
        }

# Initialize analyzer
analyzer = DataAnalyzer()

@app.get("/", tags=["General"])
async def root():
    """
    ## API Health Check
    
    Returns basic information about the API status and version.
    """
    return {"message": "StatM8 Data Analytics API", "version": "1.0.0"}

@app.post("/upload", tags=["Data Management"])
async def upload_file(file: UploadFile = File(...)):
    """
    ## Upload Data File
    
    Upload a data file to the server for analysis.
    
    **Supported formats:**
    - CSV (.csv)
    - Excel (.xlsx, .xls)
    - JSON (.json)
    
    **Returns:**
    - Success status
    - Dataset shape (rows, columns)
    - Column names and data types
    - Basic file information
    
    **Example Response:**
    ```json
    {
        "success": true,
        "message": "Successfully loaded data with 150 rows and 5 columns",
        "shape": [150, 5],
        "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"],
        "data_types": {"sepal_length": "float64", "species": "object"}
    }
    ```
    """
    try:
        content = await file.read()
        result = analyzer.load_data(content, file.filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/analyze/basic", tags=["Data Analysis"])
async def basic_analysis():
    """
    ## Basic Statistical Analysis
    
    Perform comprehensive basic analysis on the uploaded dataset.
    
    **Prerequisites:** Data must be uploaded first using `/upload`
    
    **Returns:**
    - **basic_info**: Dataset shape, column names, data types, missing values, memory usage
    - **descriptive_stats**: Statistical summary for numeric columns (mean, std, min, max, quartiles)
    - **data_preview**: First 5 rows of the dataset
    
    **Example Response:**
    ```json
    {
        "basic_info": {
            "shape": [150, 5],
            "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"],
            "numeric_columns": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
            "categorical_columns": ["species"],
            "missing_values": {"sepal_length": 0, "species": 0},
            "memory_usage": 6800
        },
        "descriptive_stats": {
            "sepal_length": {"mean": 5.84, "std": 0.83, "min": 4.3, "max": 7.9}
        },
        "data_preview": [
            {"sepal_length": 5.1, "sepal_width": 3.5, "species": "setosa"}
        ]
    }
    ```
    """
    try:
        result = analyzer.basic_analysis()
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/analyze/correlation")
async def correlation_analysis():
    """Get correlation analysis"""
    try:
        result = analyzer.correlation_analysis()
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/visualize")
async def generate_visualizations(chart_type: str = "auto"):
    """Generate data visualizations"""
    try:
        result = analyzer.generate_visualizations(chart_type)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/ml")
async def ml_analysis(target_column: str = Form(...), task_type: str = Form("auto")):
    """Perform machine learning analysis"""
    try:
        result = analyzer.perform_ml_analysis(target_column, task_type)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/clustering")
async def clustering_analysis(n_clusters: int = Form(3)):
    """Perform clustering analysis"""
    try:
        result = analyzer.clustering_analysis(n_clusters)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/query")
async def ai_query(query: str = Form(...), context: str = Form("general")):
    """Process natural language queries about the data using AI"""
    try:
        if analyzer.df is None:
            raise HTTPException(status_code=400, detail="No data loaded. Please upload a file first.")
        
        # Get basic info about the dataset
        basic_info = analyzer.basic_analysis()
        
        # Prepare context for AI
        data_context = f"""
        Dataset Information:
        - Shape: {basic_info['basic_info']['shape']}
        - Columns: {', '.join(basic_info['basic_info']['columns'])}
        - Numeric columns: {', '.join(basic_info['basic_info']['numeric_columns'])}
        - Categorical columns: {', '.join(basic_info['basic_info']['categorical_columns'])}
        - Missing values: {basic_info['basic_info']['missing_values']}
        
        Sample data (first few rows):
        {analyzer.df.head().to_string()}
        
        Descriptive statistics:
        {analyzer.df.describe().to_string() if len(basic_info['basic_info']['numeric_columns']) > 0 else 'No numeric columns for statistics'}
        """
        
        # Create AI prompt
        prompt = f"""
        You are a data analyst AI assistant. Based on the following dataset information and user query, provide insights and analysis.
        
        {data_context}
        
        User Query: {query}
        Context: {context}
        
        Please provide:
        1. Direct answer to the user's query
        2. Relevant insights from the data
        3. Suggestions for further analysis
        4. Any patterns or anomalies you notice
        
        Be specific and reference actual data values when possible.
        """
        
        # Call Groq API (you'll need to set up your API key)
        if groq_client.api_key:
            try:
                response = groq_client.chat.completions.create(
                    model="openai/gpt-oss-20b",  # or "mixtral-8x7b-32768" for better performance
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    temperature=0.7
                )
                ai_response = response.choices[0].message.content
            except Exception as e:
                ai_response = f"AI analysis unavailable: {str(e)}. Please set up your Groq API key."
        else:
            ai_response = "AI analysis unavailable. Please set up your Groq API key in the .env file."
        
        return JSONResponse(content={
            "query": query,
            "context": context,
            "ai_response": ai_response,
            "data_summary": basic_info['basic_info']
        })
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/data/sample")
async def get_data_sample(rows: int = 10):
    """Get a sample of the loaded data"""
    try:
        if analyzer.df is None:
            raise HTTPException(status_code=400, detail="No data loaded")
        
        sample_data = analyzer.df.head(rows).to_dict('records')
        return JSONResponse(content={
            "sample_data": sample_data,
            "total_rows": len(analyzer.df),
            "columns": list(analyzer.df.columns)
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)