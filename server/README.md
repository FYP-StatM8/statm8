# StatM8 Data Analytics API Server

A powerful FastAPI-based data analytics API that uses AI to provide comprehensive data analysis, visualization, and machine learning capabilities.

## Features

### 🔍 Data Analysis
- **Basic Statistical Analysis**: Descriptive statistics, data types, missing values
- **Correlation Analysis**: Correlation matrices with heatmaps and strong correlation detection
- **Distribution Analysis**: Histograms, box plots, and distribution visualizations
- **Outlier Detection**: IQR and Z-score based outlier identification

### 🤖 Machine Learning
- **Automatic Task Detection**: Automatically determines if the problem is classification or regression
- **Multiple Algorithms**: Linear Regression, Random Forest (both regression and classification)
- **Feature Importance**: Identifies the most important features for predictions
- **Model Evaluation**: Provides accuracy, MSE, R² scores, and more

### 📊 Advanced Visualizations
- **Interactive Charts**: Plotly-based interactive visualizations
- **Correlation Networks**: Network graphs showing variable relationships
- **Time Series Analysis**: Trend analysis with moving averages
- **Scatter Plot Matrices**: Multi-dimensional data exploration
- **Clustering Visualizations**: K-means clustering with visual representations

### 🧠 AI-Powered Insights
- **Natural Language Queries**: Ask questions about your data in plain English
- **OpenAI Integration**: GPT-powered analysis and insights
- **Contextual Responses**: AI provides specific insights based on your actual data

### 📁 File Support
- **CSV Files**: Comma-separated values
- **Excel Files**: .xlsx and .xls formats
- **JSON Files**: JavaScript Object Notation

## API Endpoints

### Core Endpoints

#### `POST /upload`
Upload and load data files for analysis.
- **Parameters**: `file` (multipart/form-data)
- **Returns**: File loading status and basic info

#### `GET /analyze/basic`
Get comprehensive basic statistical analysis.
- **Returns**: Descriptive statistics, data types, missing values, data preview

#### `GET /analyze/correlation`
Perform correlation analysis with visualizations.
- **Returns**: Correlation matrix, heatmap, strong correlations

#### `GET /visualize?chart_type={type}`
Generate data visualizations.
- **Parameters**: 
  - `chart_type`: "auto", "distribution", "scatter", "box"
- **Returns**: Interactive Plotly visualizations

#### `POST /analyze/ml`
Perform machine learning analysis.
- **Parameters**: 
  - `target_column`: Column to predict
  - `task_type`: "auto", "classification", "regression"
- **Returns**: Model performance metrics and feature importance

#### `POST /analyze/clustering`
Perform K-means clustering analysis.
- **Parameters**: 
  - `n_clusters`: Number of clusters (default: 3)
- **Returns**: Cluster analysis results and visualization

#### `POST /query`
Ask natural language questions about your data.
- **Parameters**: 
  - `query`: Your question about the data
  - `context`: Analysis context (default: "general")
- **Returns**: AI-generated insights and analysis

#### `GET /data/sample?rows={n}`
Get a sample of the loaded data.
- **Parameters**: 
  - `rows`: Number of rows to return (default: 10)
- **Returns**: Sample data and column information

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- OpenAI API key (for AI features)

### Quick Setup
1. **Clone or navigate to the server directory**
2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

### Manual Setup
1. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate  # On Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Create a `.env` file in the server directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the server**:
   ```bash
   # Option 1: Direct Python
   python app.py
   
   # Option 2: Using uvicorn (recommended for development)
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

## Usage Examples

### 1. Upload and Analyze Data
```python
import requests
import json

# Upload a CSV file
with open('your_data.csv', 'rb') as f:
    response = requests.post('http://localhost:8000/upload', files={'file': f})
    print(response.json())

# Get basic analysis
response = requests.get('http://localhost:8000/analyze/basic')
analysis = response.json()
print(f"Dataset shape: {analysis['basic_info']['shape']}")
```

### 2. Generate Visualizations
```python
# Get automatic visualizations
response = requests.get('http://localhost:8000/visualize')
visualizations = response.json()

# Get specific chart type
response = requests.get('http://localhost:8000/visualize?chart_type=distribution')
```

### 3. Perform Machine Learning
```python
# Run ML analysis
data = {
    'target_column': 'price',
    'task_type': 'regression'
}
response = requests.post('http://localhost:8000/analyze/ml', data=data)
ml_results = response.json()
print(f"Model R² score: {ml_results['random_forest']['r2_score']}")
```

### 4. Ask AI Questions
```python
# Query your data with natural language
data = {
    'query': 'What are the main trends in this dataset?',
    'context': 'exploratory'
}
response = requests.post('http://localhost:8000/query', data=data)
ai_insights = response.json()
print(ai_insights['ai_response'])
```

## Data Processing Pipeline

1. **File Upload**: Supports CSV, Excel, and JSON files
2. **Data Validation**: Automatic data type detection and validation
3. **Preprocessing**: Missing value handling, encoding, scaling
4. **Analysis**: Statistical analysis, correlation, distribution analysis
5. **Machine Learning**: Automatic model selection and training
6. **Visualization**: Interactive chart generation
7. **AI Insights**: Natural language processing of results

## Advanced Features

### Correlation Network Analysis
Automatically generates network graphs showing relationships between variables with correlation strength visualization.

### Time Series Analysis
If your data contains date columns, the API can perform time series analysis including:
- Trend identification
- Moving averages
- Seasonal decomposition

### Outlier Detection
Multiple methods for outlier detection:
- Interquartile Range (IQR) method
- Z-score method
- Visual identification through box plots and violin plots

### Clustering Analysis
K-means clustering with:
- Automatic optimal cluster suggestion
- Cluster visualization
- Cluster profiling and interpretation

## Error Handling

The API includes comprehensive error handling:
- File format validation
- Data type checking
- Missing column validation
- Model training error handling
- Clear error messages and status codes

## Performance Considerations

- **File Size**: Optimized for files up to 100MB
- **Memory Usage**: Efficient memory management for large datasets
- **Processing Time**: Asynchronous processing for long-running tasks
- **Caching**: Results caching for repeated analyses

## API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## Security Features

- **CORS Configuration**: Properly configured for Next.js frontend
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Sanitization**: Safe error messages without sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## License

This project is part of the StatM8 application suite.

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review error messages in the response
3. Ensure your data format is supported
4. Verify your OpenAI API key is configured correctly
