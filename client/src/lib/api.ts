const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
  file_path: string;
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

  async getCommentAssets(commentId: string): Promise<{ assets: CommentAsset[] }> {
    return fetchApi(`/storage/csv/comment/${commentId}/assets`) as Promise<{ assets: CommentAsset[] }>;
  },
};
