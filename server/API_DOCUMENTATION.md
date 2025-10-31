# StatM8 Data Analytics API Documentation

## Overview

The StatM8 API provides comprehensive data analytics capabilities including statistical analysis, machine learning, data visualization, and AI-powered insights.

**Base URL:** `http://localhost:8000`

## Quick Start

1. **Start the server:**
   ```bash
   cd server
   python app.py
   ```

2. **Access interactive documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## API Endpoints

### 1. Health Check

**GET** `/`

Returns API status and version information.

**Response:**
```json
{
  "message": "StatM8 Data Analytics API",
  "version": "1.0.0"
}
```

### 2. File Upload

**POST** `/upload`

Upload a data file for analysis.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file`: The data file (CSV, Excel, or JSON)

**Supported Formats:**
- `.csv` - Comma-separated values
- `.xlsx`, `.xls` - Excel files
- `.json` - JSON format

**Response:**
```json
{
  "success": true,
  "message": "Successfully loaded data with 150 rows and 5 columns",
  "shape": [150, 5],
  "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"],
  "data_types": {
    "sepal_length": "float64",
    "sepal_width": "float64",
    "petal_length": "float64",
    "petal_width": "float64",
    "species": "object"
  }
}
```

### 3. Basic Analysis

**GET** `/analyze/basic`

Get comprehensive basic statistical analysis.

**Prerequisites:** File must be uploaded first.

**Response:**
```json
{
  "basic_info": {
    "shape": [150, 5],
    "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"],
    "numeric_columns": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
    "categorical_columns": ["species"],
    "missing_values": {
      "sepal_length": 0,
      "sepal_width": 0,
      "petal_length": 0,
      "petal_width": 0,
      "species": 0
    },
    "memory_usage": 6800
  },
  "descriptive_stats": {
    "sepal_length": {
      "count": 150.0,
      "mean": 5.843333333333334,
      "std": 0.8280661279778629,
      "min": 4.3,
      "25%": 5.1,
      "50%": 5.8,
      "75%": 6.4,
      "max": 7.9
    }
  },
  "data_preview": [
    {
      "sepal_length": 5.1,
      "sepal_width": 3.5,
      "petal_length": 1.4,
      "petal_width": 0.2,
      "species": "setosa"
    }
  ]
}
```

### 4. Correlation Analysis

**GET** `/analyze/correlation`

Perform correlation analysis on numeric columns.

**Prerequisites:** File with at least 2 numeric columns must be uploaded.

**Response:**
```json
{
  "correlation_matrix": {
    "sepal_length": {
      "sepal_length": 1.0,
      "sepal_width": -0.117570,
      "petal_length": 0.871754,
      "petal_width": 0.817941
    }
  },
  "heatmap": "base64_encoded_image_string",
  "strong_correlations": [
    {
      "var1": "sepal_length",
      "var2": "petal_length",
      "correlation": 0.872
    }
  ]
}
```

### 5. Data Visualization

**GET** `/visualize`

Generate various data visualizations.

**Query Parameters:**
- `chart_type` (optional): `"auto"`, `"distribution"`, `"scatter"`, `"box"`

**Response:**
```json
{
  "visualizations": {
    "distribution_sepal_length": "plotly_json_string",
    "scatter": "plotly_json_string",
    "box": "plotly_json_string"
  }
}
```

### 6. Machine Learning Analysis

**POST** `/analyze/ml`

Perform machine learning analysis (classification or regression).

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `target_column`: Name of the target column for prediction
- `task_type` (optional): `"auto"`, `"classification"`, `"regression"`

**Response (Classification):**
```json
{
  "task_type": "classification",
  "random_forest": {
    "accuracy": 0.9666666666666667,
    "feature_importance": {
      "sepal_length": 0.1,
      "sepal_width": 0.02,
      "petal_length": 0.42,
      "petal_width": 0.46
    }
  }
}
```

**Response (Regression):**
```json
{
  "task_type": "regression",
  "linear_regression": {
    "mse": 0.123,
    "r2_score": 0.856
  },
  "random_forest": {
    "mse": 0.098,
    "r2_score": 0.892,
    "feature_importance": {
      "feature1": 0.3,
      "feature2": 0.7
    }
  }
}
```

### 7. Clustering Analysis

**POST** `/analyze/clustering`

Perform K-means clustering analysis.

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `n_clusters` (optional): Number of clusters (default: 3)

**Response:**
```json
{
  "n_clusters": 3,
  "cluster_centers": [[1.2, 3.4], [2.1, 4.5], [3.0, 5.2]],
  "inertia": 78.85,
  "cluster_sizes": {
    "0": 50,
    "1": 62,
    "2": 38
  },
  "visualization": "plotly_json_string"
}
```

### 8. AI Query

**POST** `/query`

Ask natural language questions about your data using AI.

**Content-Type:** `application/x-www-form-urlencoded`

**Parameters:**
- `query`: Your question about the data
- `context` (optional): Additional context (default: "general")

**Response:**
```json
{
  "query": "What patterns do you see in the data?",
  "context": "general",
  "ai_response": "Based on the iris dataset analysis, I can see several interesting patterns...",
  "data_summary": {
    "shape": [150, 5],
    "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
  }
}
```

### 9. Data Sample

**GET** `/data/sample`

Get a sample of the loaded data.

**Query Parameters:**
- `rows` (optional): Number of rows to return (default: 10)

**Response:**
```json
{
  "sample_data": [
    {
      "sepal_length": 5.1,
      "sepal_width": 3.5,
      "petal_length": 1.4,
      "petal_width": 0.2,
      "species": "setosa"
    }
  ],
  "total_rows": 150,
  "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters, no data loaded, etc.)
- `422`: Validation Error
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Common Error Messages

- `"No data loaded"`: You need to upload a file first using `/upload`
- `"Target column 'column_name' not found"`: The specified column doesn't exist
- `"Need at least 2 numeric columns for correlation analysis"`: Dataset needs more numeric columns
- `"Unsupported file format: format"`: File format not supported

## Data Types and Formats

### Plotly Visualizations
Visualizations are returned as JSON strings that can be parsed and rendered using plotly.js:

```javascript
const plotData = JSON.parse(response.visualizations.scatter);
Plotly.newPlot('chart-div', plotData.data, plotData.layout);
```

### Base64 Images
Matplotlib plots (like correlation heatmaps) are returned as base64 encoded strings:

```javascript
const imgSrc = `data:image/png;base64,${response.heatmap}`;
```

## Frontend Integration Examples

### JavaScript/TypeScript

```javascript
// Upload file
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// Get basic analysis
const getBasicAnalysis = async () => {
  const response = await fetch('/analyze/basic');
  return response.json();
};

// Perform ML analysis
const performMLAnalysis = async (targetColumn, taskType = 'auto') => {
  const formData = new FormData();
  formData.append('target_column', targetColumn);
  formData.append('task_type', taskType);
  
  const response = await fetch('/analyze/ml', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

### React Example

```jsx
import React, { useState } from 'react';

const DataAnalyzer = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Upload file
      await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      // Get basic analysis
      const response = await fetch('/analyze/basic');
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".csv,.xlsx,.json" />
      {analysisResult && (
        <div>
          <h3>Dataset Info</h3>
          <p>Shape: {analysisResult.basic_info.shape.join(' x ')}</p>
          <p>Columns: {analysisResult.basic_info.columns.join(', ')}</p>
        </div>
      )}
    </div>
  );
};
```

## Development Notes

- The API maintains state for one dataset at a time per server instance
- File uploads replace any previously loaded data
- All numeric operations handle missing values appropriately
- Visualization generation may take a few seconds for large datasets
- AI queries require a valid Groq API key in the environment

## Support

For additional help or questions, refer to:
- Interactive API docs: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc
