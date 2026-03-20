const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface DatasetSummaryResponse {
  csv_id?: string;
  file_type: string;
  total_rows: number;
  total_columns: number;
  columns_info: ColumnInfo[];
  sample_rows: Record<string, unknown>[];
  ai_summary: string;
}

export interface ColumnInfo {
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  unique_count: number;
  sample_values: unknown[];
}

export interface GenerateEDARequest {
  comments?: string;
  uid: string;
  csv_id: string;
}

export interface StreamCodeBlockResponse {
  block_id: number;
  description: string;
  code: string;
  status: string;
  output?: string;
  error?: string;
  plots_generated?: string[];
}

export interface CSVFile {
  _id: string;
  uid: string;
  csv_name: string;
  csv_url: string;
  json_response: string;
  created_at: string;
}

export interface Comment {
  _id: string;
  uid: string;
  csv_id: string;
  comment: string;
  created_at: string;
}

export interface CommentAsset {
  _id: string;
  comment_id: string;
  code: string;
  image_urls: string[];
  created_at: string;
}

export interface AnalyzePlotsRequest {
  uid: string;
  csv_id: string;
  comment_id?: string;
}

export interface StreamPlotAnalysisResponse {
  plot_index: number;
  total_plots: number;
  plot_filename: string;
  plot_url: string;
  analysis: string;
  status: string;
  error?: string;
  is_summary: boolean;
}

export interface VLMAnalysis {
  _id: string;
  csv_id: string;
  csv_name: string;
  comment_id?: string;
  summary: string;
  plot_analyses: Array<{
    plot_filename: string;
    plot_url: string;
    analysis: string;
  }>;
  created_at: string;
}

export interface VLMAnalysisResponse {
  source: string;
  csv_id: string;
  csv_name: string;
  analysis: VLMAnalysis | VLMAnalysis[];
}

export interface ExportRequest {
  uid: string;
  csv_id: string;
  vlm_analysis_id?: string;
  include_summary: boolean;
  include_plots: boolean;
  include_code: boolean;
  title?: string;
  format: "pdf" | "markdown" | "latex";
}

// Updated Export interface to match actual API response
export interface Export {
  _id: string;
  uid: string;
  csv_id: string;
  vlm_analysis_id?: string;
  csv_name: string;
  format: string;
  cloudinary_url: string;  // Changed from download_url
  public_id: string;
  file_size_bytes: number;
  sections_included: string[];
  total_plots: number;
  created_at: string;  // Changed from generated_at
}

// Response from generating a new export
export interface ExportResponse {
  csv_id: string;
  csv_name: string;
  file_size_bytes: number;
  sections_included: string[];
  total_plots: number;
  generated_at: string;
  status: string;
  download_url: string;
  export_id: string;
  format: string;
  is_zip: boolean;
}

export interface ExportStatusResponse {
  csv_id: string;
  csv_name: string;
  has_summary: boolean;
  has_plots: boolean;
  plot_count: number;
  has_vlm_analysis: boolean;
  can_export: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    throw new ApiError(
      errorData.detail || errorData.message || "API request failed",
      response.status,
      errorData
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

export const api = {
  async uploadAndAnalyzeFile(file: File, uid: string): Promise<DatasetSummaryResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", uid);

    const response = await fetch(`${API_BASE_URL}/load`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || "Failed to upload and analyze file",
        response.status,
        errorData
      );
    }

    return await response.json();
  },

  async generateEDAStream(
    request: GenerateEDARequest,
    onChunk: (data: StreamCodeBlockResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-eda-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || "Failed to generate EDA",
          response.status,
          errorData
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamCodeBlockResponse;
              onChunk(data);
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  },

  async analyzePlotsStream(
    request: AnalyzePlotsRequest,
    onChunk: (data: StreamPlotAnalysisResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-plots-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || "Failed to analyze plots",
          response.status,
          errorData
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamPlotAnalysisResponse;
              onChunk(data);
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  },

  async generateEDA(request: GenerateEDARequest): Promise<unknown> {
    return fetchApi("/generate-eda", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async listPlots(outputDir: string = "outputs/plots"): Promise<{
    output_dir: string;
    total_plots: number;
    plots: string[];
  }> {
    return fetchApi(`/list-plots?output_dir=${encodeURIComponent(outputDir)}`) as Promise<{
      output_dir: string;
      total_plots: number;
      plots: string[];
    }>;
  },

  async getUserCSVs(uid: string): Promise<{ csvs: CSVFile[] }> {
    return fetchApi(`/storage/csv/user/${uid}`) as Promise<{ csvs: CSVFile[] }>;
  },

  async getCSVComments(csvId: string): Promise<{ comments: Comment[] }> {
    return fetchApi(`/storage/csv/${csvId}/comments`) as Promise<{ comments: Comment[] }>;
  },

  async getCSVVLMAnalyses(csvId: string, uid?: string): Promise<{ vlm_analyses: VLMAnalysis[]; count: number }> {
    const params = new URLSearchParams();
    if (uid) {
      params.append("uid", uid);
    }
    
    const queryString = params.toString();
    const endpoint = `/storage/csv/${csvId}/vlm-analyses${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await fetchApi(endpoint);
      
      if (response && typeof response === 'object') {
        const typedResponse = response as { vlm_analyses: VLMAnalysis[]; count: number; message?: string };
        return {
          vlm_analyses: typedResponse.vlm_analyses || [],
          count: typedResponse.count || 0
        };
      }
      
      return { vlm_analyses: [], count: 0 };
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Error fetching VLM analyses:", error.message);
      }
      return { vlm_analyses: [], count: 0 };
    }
  },

  async getCommentAssets(commentId: string): Promise<{ assets: CommentAsset[] }> {
    return fetchApi(`/storage/csv/comment/${commentId}/assets`) as Promise<{ assets: CommentAsset[] }>;
  },

  async generateExport(request: ExportRequest): Promise<ExportResponse> {
    return fetchApi("/export", {
      method: "POST",
      body: JSON.stringify(request),
    }) as Promise<ExportResponse>;
  },

  async getCSVExports(csvId: string, uid: string, limit: number = 20): Promise<{ 
    csv_id: string;
    uid: string;
    exports: Export[];
    total: number;
  }> {
    if (!uid) {
      return { csv_id: csvId, uid: "", exports: [], total: 0 };
    }

    const params = new URLSearchParams();
    params.append("uid", uid);
    params.append("limit", limit.toString());
    
    const endpoint = `/export/csv/${csvId}?${params.toString()}`;
    
    try {
      const response = await fetchApi(endpoint);
      
      if (response && typeof response === 'object') {
        const typedResponse = response as { 
          csv_id: string;
          uid: string;
          exports: Export[];
          total: number;
        };
        return {
          csv_id: typedResponse.csv_id || csvId,
          uid: typedResponse.uid || uid,
          exports: typedResponse.exports || [],
          total: typedResponse.total || 0
        };
      }
      
      return { csv_id: csvId, uid, exports: [], total: 0 };
    } catch (error) {
      if (error instanceof ApiError) {
        console.log("Error fetching exports:", error.message);
      }
      return { csv_id: csvId, uid, exports: [], total: 0 };
    }
  },

  async getExportStatus(csvId: string, uid?: string): Promise<ExportStatusResponse> {
    const params = new URLSearchParams();
    if (uid) {
      params.append("uid", uid);
    }
    
    const queryString = params.toString();
    const endpoint = `/export/status/${csvId}${queryString ? `?${queryString}` : ''}`;
    
    return fetchApi(endpoint) as Promise<ExportStatusResponse>;
  },
};