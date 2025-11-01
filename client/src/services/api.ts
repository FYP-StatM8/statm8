const API_BASE = 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500,
      };
    }
  }

  // File Operations
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Data Analysis
  async getBasicStats() {
    return this.request('/basic-stats');
  }

  async getCorrelationAnalysis() {
    return this.request('/correlation');
  }

  // Machine Learning
  async trainModel(algorithm: string, target: string) {
    return this.request('/train', {
      method: 'POST',
      body: JSON.stringify({ algorithm, target }),
    });
  }

  async getModelResults() {
    return this.request('/model-results');
  }

  // AI Insights
  async getInsight(query: string, context: string = 'general') {
    return this.request('/insight', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  // Data Visualization
  async getVisualization(type: string, columns?: string[]) {
    const params = new URLSearchParams();
    if (columns) {
      columns.forEach(col => params.append('columns', col));
    }
    return this.request(`/visualize/${type}?${params.toString()}`);
  }
}

export const apiService = new ApiService();
