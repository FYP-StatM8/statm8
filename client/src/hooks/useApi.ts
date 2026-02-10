import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  api, 
  CSVFile, 
  GenerateEDARequest, 
  StreamCodeBlockResponse,
  AnalyzePlotsRequest,
  StreamPlotAnalysisResponse,
  ExportRequest
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useUploadAndAnalyze() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, uid }: { file: File; uid: string }) =>
      api.uploadAndAnalyzeFile(file, uid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userCSVs"] });
      toast({
        title: "File uploaded successfully",
        description: `Analyzed ${data.total_rows} rows and ${data.total_columns} columns`,
      });
    },
    onError: (error: Error | { message?: string }) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : error.message || "Failed to upload and analyze file",
        variant: "destructive",
      });
    },
  });
}

export function useGenerateEDA() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: GenerateEDARequest) => api.generateEDA(request),
    onError: (error: Error | { message?: string }) => {
      toast({
        title: "EDA generation failed",
        description: error instanceof Error ? error.message : error.message || "Failed to generate EDA",
        variant: "destructive",
      });
    },
  });
}

export function useGenerateEDAStream() {
  const { toast } = useToast();

  return {
    generate: (
      request: GenerateEDARequest,
      onChunk: (data: StreamCodeBlockResponse) => void,
      onComplete?: () => void
    ) => {
      return api.generateEDAStream(
        request,
        onChunk,
        (error) => {
          toast({
            title: "EDA generation failed",
            description: error.message || "Failed to generate EDA",
            variant: "destructive",
          });
        },
        () => {
          onComplete?.();
          toast({
            title: "EDA generation complete",
            description: "All code blocks have been executed successfully",
          });
        }
      );
    },
  };
}

export function useAnalyzePlotsStream() {
  const { toast } = useToast();

  return {
    generate: (
      request: AnalyzePlotsRequest,
      onChunk: (data: StreamPlotAnalysisResponse) => void,
      onComplete?: () => void
    ) => {
      return api.analyzePlotsStream(
        request,
        onChunk,
        (error) => {
          toast({
            title: "Plot analysis failed",
            description: error.message || "Failed to analyze plots",
            variant: "destructive",
          });
        },
        () => {
          onComplete?.();
        }
      );
    },
  };
}

export function useGenerateExport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ExportRequest) => api.generateExport(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["csvExports"] });
      toast({
        title: "Export generated successfully",
        description: `Your ${data.format.toUpperCase()} export is ready`,
      });
    },
    onError: (error: Error | { message?: string }) => {
      toast({
        title: "Export generation failed",
        description: error instanceof Error ? error.message : error.message || "Failed to generate export",
        variant: "destructive",
      });
    },
  });
}

export function useUserCSVs(uid: string | null) {
  return useQuery({
    queryKey: ["userCSVs", uid],
    queryFn: () => (uid ? api.getUserCSVs(uid) : Promise.resolve({ csvs: [] })),
    enabled: !!uid,
  });
}

export function useCSVComments(csvId: string | null) {
  return useQuery({
    queryKey: ["csvComments", csvId],
    queryFn: () =>
      csvId ? api.getCSVComments(csvId) : Promise.resolve({ comments: [] }),
    enabled: !!csvId,
  });
}

export function useCSVVLMSummaries(uid: string | null, csvId: string | null) {
  return useQuery({
    queryKey: ["csvVLMSummaries", uid, csvId],
    queryFn: () =>
      csvId ? api.getCSVVLMAnalyses(csvId, uid || undefined) : Promise.resolve({ vlm_analyses: [], count: 0 }),
    enabled: !!csvId,
  });
}

export function useCSVExports(uid: string | null, csvId: string | null) {
  return useQuery({
    queryKey: ["csvExports", uid, csvId],
    queryFn: () =>
      csvId ? api.getCSVExports(csvId, uid || undefined) : Promise.resolve({ exports: [] }),
    enabled: !!csvId,
  });
}

export function useExportStatus(csvId: string | null, uid: string | null) {
  return useQuery({
    queryKey: ["exportStatus", csvId, uid],
    queryFn: () =>
      csvId ? api.getExportStatus(csvId, uid || undefined) : Promise.resolve({
        csv_id: "",
        csv_name: "",
        has_summary: false,
        has_plots: false,
        plot_count: 0,
        has_vlm_analysis: false,
        can_export: false,
      }),
    enabled: !!csvId,
  });
}

export function useCommentAssets(commentId: string | null) {
  return useQuery({
    queryKey: ["commentAssets", commentId],
    queryFn: () =>
      commentId
        ? api.getCommentAssets(commentId)
        : Promise.resolve({ assets: [] }),
    enabled: !!commentId,
  });
}

export function useListPlots(outputDir: string | null) {
  return useQuery({
    queryKey: ["plots", outputDir],
    queryFn: () =>
      outputDir ? api.listPlots(outputDir) : Promise.resolve({ plots: [], total_plots: 0, output_dir: "" }),
    enabled: !!outputDir,
  });
}