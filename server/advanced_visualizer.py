import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import io
import base64
from typing import Dict, List, Any, Optional
import json
from plotly.utils import PlotlyJSONEncoder

class AdvancedVisualizer:
    """Advanced visualization utilities for data analysis"""
    
    def __init__(self):
        plt.style.use('seaborn-v0_8')
        self.color_palette = px.colors.qualitative.Set1
    
    def create_distribution_analysis(self, df: pd.DataFrame, columns: List[str] = None) -> Dict[str, Any]:
        """Create comprehensive distribution analysis"""
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()[:4]  # Limit to 4 columns
        
        visualizations = {}
        
        for col in columns:
            if col in df.columns:
                # Histogram with KDE
                fig = px.histogram(df, x=col, marginal="box", 
                                 title=f'Distribution of {col}',
                                 nbins=30)
                visualizations[f"distribution_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
                
                # Box plot
                fig_box = px.box(df, y=col, title=f'Box Plot of {col}')
                visualizations[f"boxplot_{col}"] = json.dumps(fig_box, cls=PlotlyJSONEncoder)
        
        return {"visualizations": visualizations}
    
    def create_correlation_network(self, df: pd.DataFrame, threshold: float = 0.5) -> str:
        """Create a network graph of correlations"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) < 2:
            return None
        
        corr_matrix = df[numeric_cols].corr()
        
        # Create network graph
        edges = []
        nodes = list(numeric_cols)
        
        for i in range(len(nodes)):
            for j in range(i+1, len(nodes)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > threshold:
                    edges.append({
                        'source': nodes[i],
                        'target': nodes[j],
                        'weight': abs(corr_val),
                        'correlation': corr_val
                    })
        
        # Create network visualization using plotly
        import networkx as nx
        G = nx.Graph()
        
        for node in nodes:
            G.add_node(node)
        
        for edge in edges:
            G.add_edge(edge['source'], edge['target'], weight=edge['weight'])
        
        pos = nx.spring_layout(G)
        
        # Create edge traces
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
        
        edge_trace = go.Scatter(x=edge_x, y=edge_y,
                               line=dict(width=2, color='gray'),
                               hoverinfo='none',
                               mode='lines')
        
        # Create node traces
        node_x = []
        node_y = []
        node_text = []
        for node in G.nodes():
            x, y = pos[node]
            node_x.append(x)
            node_y.append(y)
            node_text.append(node)
        
        node_trace = go.Scatter(x=node_x, y=node_y,
                               mode='markers+text',
                               hoverinfo='text',
                               text=node_text,
                               textposition="middle center",
                               marker=dict(size=20, color='lightblue'))
        
        fig = go.Figure(data=[edge_trace, node_trace],
                       layout=go.Layout(
                           title='Correlation Network',
                           titlefont_size=16,
                           showlegend=False,
                           hovermode='closest',
                           margin=dict(b=20,l=5,r=5,t=40),
                           annotations=[ dict(
                               text="Correlation Network (|r| > " + str(threshold) + ")",
                               showarrow=False,
                               xref="paper", yref="paper",
                               x=0.005, y=-0.002 ) ],
                           xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                           yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)))
        
        return json.dumps(fig, cls=PlotlyJSONEncoder)
    
    def create_time_series_analysis(self, df: pd.DataFrame, date_col: str, value_cols: List[str]) -> Dict[str, Any]:
        """Create time series analysis visualizations"""
        if date_col not in df.columns:
            return {"error": f"Date column '{date_col}' not found"}
        
        # Convert to datetime
        df_ts = df.copy()
        df_ts[date_col] = pd.to_datetime(df_ts[date_col])
        df_ts = df_ts.sort_values(date_col)
        
        visualizations = {}
        
        for col in value_cols:
            if col in df_ts.columns:
                # Time series plot
                fig = px.line(df_ts, x=date_col, y=col, 
                             title=f'Time Series: {col}')
                visualizations[f"timeseries_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
                
                # Moving average
                df_ts[f'{col}_ma7'] = df_ts[col].rolling(window=7).mean()
                df_ts[f'{col}_ma30'] = df_ts[col].rolling(window=30).mean()
                
                fig_ma = go.Figure()
                fig_ma.add_trace(go.Scatter(x=df_ts[date_col], y=df_ts[col], 
                                          name=col, mode='lines'))
                fig_ma.add_trace(go.Scatter(x=df_ts[date_col], y=df_ts[f'{col}_ma7'], 
                                          name='7-day MA', mode='lines'))
                fig_ma.add_trace(go.Scatter(x=df_ts[date_col], y=df_ts[f'{col}_ma30'], 
                                          name='30-day MA', mode='lines'))
                fig_ma.update_layout(title=f'Time Series with Moving Averages: {col}')
                
                visualizations[f"timeseries_ma_{col}"] = json.dumps(fig_ma, cls=PlotlyJSONEncoder)
        
        return {"visualizations": visualizations}
    
    def create_advanced_scatter_matrix(self, df: pd.DataFrame, columns: List[str] = None) -> str:
        """Create an advanced scatter plot matrix"""
        if columns is None:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            columns = numeric_cols.tolist()[:4]  # Limit to 4 columns for performance
        
        if len(columns) < 2:
            return None
        
        fig = px.scatter_matrix(df, dimensions=columns, 
                               title="Scatter Plot Matrix",
                               labels={col: col for col in columns})
        
        return json.dumps(fig, cls=PlotlyJSONEncoder)
    
    def create_categorical_analysis(self, df: pd.DataFrame, categorical_cols: List[str] = None) -> Dict[str, Any]:
        """Create visualizations for categorical data analysis"""
        if categorical_cols is None:
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()[:3]
        
        visualizations = {}
        
        for col in categorical_cols:
            if col in df.columns:
                # Count plot
                value_counts = df[col].value_counts()
                fig = px.bar(x=value_counts.index, y=value_counts.values,
                            title=f'Count Distribution: {col}',
                            labels={'x': col, 'y': 'Count'})
                visualizations[f"countplot_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
                
                # Pie chart (if not too many categories)
                if len(value_counts) <= 10:
                    fig_pie = px.pie(values=value_counts.values, names=value_counts.index,
                                    title=f'Distribution: {col}')
                    visualizations[f"pieplot_{col}"] = json.dumps(fig_pie, cls=PlotlyJSONEncoder)
        
        return {"visualizations": visualizations}
    
    def create_outlier_visualization(self, df: pd.DataFrame, columns: List[str] = None) -> Dict[str, Any]:
        """Create visualizations to identify outliers"""
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()[:4]
        
        visualizations = {}
        
        for col in columns:
            if col in df.columns:
                # Box plot for outlier detection
                fig = px.box(df, y=col, title=f'Outlier Detection: {col}')
                visualizations[f"outlier_box_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
                
                # Violin plot
                fig_violin = px.violin(df, y=col, title=f'Distribution Shape: {col}')
                visualizations[f"violin_{col}"] = json.dumps(fig_violin, cls=PlotlyJSONEncoder)
        
        return {"visualizations": visualizations}
    
    def create_comparative_analysis(self, df: pd.DataFrame, group_col: str, numeric_cols: List[str]) -> Dict[str, Any]:
        """Create comparative analysis between groups"""
        if group_col not in df.columns:
            return {"error": f"Group column '{group_col}' not found"}
        
        visualizations = {}
        
        for col in numeric_cols:
            if col in df.columns:
                # Group comparison box plot
                fig = px.box(df, x=group_col, y=col, 
                            title=f'{col} by {group_col}')
                visualizations[f"group_comparison_{col}"] = json.dumps(fig, cls=PlotlyJSONEncoder)
                
                # Group comparison violin plot
                fig_violin = px.violin(df, x=group_col, y=col,
                                      title=f'{col} Distribution by {group_col}')
                visualizations[f"group_violin_{col}"] = json.dumps(fig_violin, cls=PlotlyJSONEncoder)
        
        return {"visualizations": visualizations}
