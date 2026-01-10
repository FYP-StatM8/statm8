import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, CSVFile, GenerateEDARequest, StreamCodeBlockResponse } from "@/lib/api";
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
