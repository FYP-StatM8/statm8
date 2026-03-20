# Frontend Integration Guide

## Quick Setup for Development

### 1. Start the API Server

```bash
cd server
pip install -r requirements.txt
python app.py
```

The server will run on `http://localhost:8000`

### 2. Test the API

Visit http://localhost:8000/docs to see the interactive documentation.

## Integration Methods

### Method 1: Interactive Documentation (Recommended for Testing)

1. **Start your server**
2. **Open Swagger UI**: http://localhost:8000/docs
3. **Try out endpoints** directly in the browser
4. **Copy generated curl commands** for your frontend code

### Method 2: Frontend JavaScript Integration

```javascript
const API_BASE = 'http://localhost:8000';

class StatM8API {
  // Upload file and get basic info
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Get basic analysis
  async getBasicAnalysis() {
    const response = await fetch(`${API_BASE}/analyze/basic`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Get correlation analysis
  async getCorrelationAnalysis() {
    const response = await fetch(`${API_BASE}/analyze/correlation`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Generate visualizations
  async getVisualizations(chartType = 'auto') {
    const response = await fetch(`${API_BASE}/visualize?chart_type=${chartType}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Perform ML analysis
  async performMLAnalysis(targetColumn, taskType = 'auto') {
    const formData = new FormData();
    formData.append('target_column', targetColumn);
    formData.append('task_type', taskType);
    
    const response = await fetch(`${API_BASE}/analyze/ml`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Perform clustering
  async performClustering(nClusters = 3) {
    const formData = new FormData();
    formData.append('n_clusters', nClusters.toString());
    
    const response = await fetch(`${API_BASE}/analyze/clustering`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // AI Query
  async queryAI(query, context = 'general') {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('context', context);
    
    const response = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Get data sample
  async getDataSample(rows = 10) {
    const response = await fetch(`${API_BASE}/data/sample?rows=${rows}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
}

// Usage example
const api = new StatM8API();

// Example workflow
async function analyzeData(file) {
  try {
    // 1. Upload file
    console.log('Uploading file...');
    const uploadResult = await api.uploadFile(file);
    console.log('File uploaded:', uploadResult);
    
    // 2. Get basic analysis
    console.log('Getting basic analysis...');
    const basicAnalysis = await api.getBasicAnalysis();
    console.log('Basic analysis:', basicAnalysis);
    
    // 3. Get visualizations
    console.log('Generating visualizations...');
    const visualizations = await api.getVisualizations();
    console.log('Visualizations:', visualizations);
    
    // 4. If there are numeric columns, get correlations
    if (basicAnalysis.basic_info.numeric_columns.length >= 2) {
      console.log('Getting correlation analysis...');
      const correlations = await api.getCorrelationAnalysis();
      console.log('Correlations:', correlations);
    }
    
    return {
      upload: uploadResult,
      basic: basicAnalysis,
      visualizations: visualizations
    };
    
  } catch (error) {
    console.error('Error analyzing data:', error.message);
    throw error;
  }
}
```

### Method 3: React Hook Example

```jsx
import { useState, useCallback } from 'react';

const useStatM8API = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const api = new StatM8API(); // Use the class from above
  
  const uploadAndAnalyze = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeData(file); // Use function from above
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);
  
  return {
    uploadAndAnalyze,
    loading,
    error,
    api
  };
};

// Component usage
const DataAnalyzer = () => {
  const { uploadAndAnalyze, loading, error } = useStatM8API();
  const [results, setResults] = useState(null);
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const analysisResults = await uploadAndAnalyze(file);
      setResults(analysisResults);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.json"
        disabled={loading}
      />
      
      {loading && <p>Analyzing data...</p>}
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      
      {results && (
        <div>
          <h3>Analysis Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

## Visualization Integration

### Plotly Charts
```javascript
// Render Plotly visualizations
const renderPlotlyChart = (plotlyJsonString, containerId) => {
  const plotData = JSON.parse(plotlyJsonString);
  Plotly.newPlot(containerId, plotData.data, plotData.layout);
};

// Usage
const visualizations = await api.getVisualizations();
renderPlotlyChart(visualizations.visualizations.scatter, 'scatter-chart-div');
```

### Base64 Images
```javascript
// Display base64 encoded images (like correlation heatmaps)
const displayBase64Image = (base64String, imgElement) => {
  imgElement.src = `data:image/png;base64,${base64String}`;
};

// Usage
const correlations = await api.getCorrelationAnalysis();
const imgElement = document.getElementById('heatmap-img');
displayBase64Image(correlations.heatmap, imgElement);
```

## Error Handling Best Practices

```javascript
const handleAPICall = async (apiFunction) => {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error.message.includes('No data loaded')) {
      return { 
        success: false, 
        error: 'Please upload a data file first',
        code: 'NO_DATA'
      };
    } else if (error.message.includes('not found')) {
      return { 
        success: false, 
        error: 'The specified column was not found in your data',
        code: 'COLUMN_NOT_FOUND'
      };
    } else {
      return { 
        success: false, 
        error: error.message,
        code: 'UNKNOWN_ERROR'
      };
    }
  }
};

// Usage
const result = await handleAPICall(() => api.performMLAnalysis('target_column'));
if (result.success) {
  console.log('Success:', result.data);
} else {
  console.error('Error:', result.error);
  // Show user-friendly error message based on result.code
}
```

## Testing Your Integration

1. **Start the API server**: `python server/app.py`
2. **Open browser console** and paste the StatM8API class
3. **Test with sample data**:
   ```javascript
   const api = new StatM8API();
   
   // Create a test file input and select the Iris.csv file
   const fileInput = document.createElement('input');
   fileInput.type = 'file';
   fileInput.onchange = async (e) => {
     const result = await analyzeData(e.target.files[0]);
     console.log(result);
   };
   document.body.appendChild(fileInput);
   fileInput.click();
   ```

## CORS Configuration

The API is already configured to accept requests from:
- `http://localhost:3000` (Next.js default)
- `http://127.0.0.1:3000`

If you need to add more origins, modify the CORS middleware in `server/app.py`.

## Common Issues and Solutions

1. **"No data loaded" error**: Always upload a file before calling analysis endpoints
2. **CORS errors**: Make sure your frontend runs on an allowed origin
3. **File format errors**: Ensure files are in supported formats (CSV, Excel, JSON)
4. **Large file timeouts**: Consider implementing upload progress indicators for large files
5. **Visualization rendering**: Make sure Plotly.js is loaded before rendering charts

## Next Steps

1. Review the full API documentation: `API_DOCUMENTATION.md`
2. Test endpoints using Swagger UI: http://localhost:8000/docs
3. Implement error handling and loading states in your frontend
4. Add file validation before upload
5. Consider implementing data caching for better performance
