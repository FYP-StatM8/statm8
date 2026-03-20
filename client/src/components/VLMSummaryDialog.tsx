import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Brain,
  Image as ImageIcon
} from "lucide-react";
import { useAnalyzePlotsStream, useCSVComments } from "@/hooks/useApi";
import { StreamPlotAnalysisResponse } from "@/lib/api";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface VLMSummaryDialogProps {
  csv_id: string;
  uid: string;
  setIsVLMDialogOpen: (open: boolean) => void;
  onGenerationComplete?: () => void;
}

// Helper function to extract readable error message
const getErrorMessage = (error: any): string => {
  console.log("Raw error object:", error);
  
  // If error is a string
  if (typeof error === 'string') {
    return error;
  }
  
  // If error has a message property that's a string
  if (error?.message && typeof error.message === 'string') {
    try {
      // Try to parse message as JSON
      const parsed = JSON.parse(error.message);
      if (parsed.detail) {
        if (Array.isArray(parsed.detail)) {
          return parsed.detail.map((err: any) => {
            const field = err.loc?.slice(1).join(' > ') || 'field';
            return `${field}: ${err.msg}`;
          }).join('; ');
        }
        return typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
      }
      return error.message;
    } catch {
      return error.message;
    }
  }
  
  // If error has detail property directly
  if (error?.detail) {
    if (Array.isArray(error.detail)) {
      return error.detail.map((err: any) => {
        const field = err.loc?.slice(1).join(' > ') || 'field';
        return `${field}: ${err.msg}`;
      }).join('; ');
    }
    return typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
  }
  
  // If error has response.data
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((err: any) => {
          const field = err.loc?.slice(1).join(' > ') || 'field';
          return `${field}: ${err.msg}`;
        }).join('; ');
      }
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
  }
  
  // Default fallback
  return 'An error occurred while generating VLM analysis';
};

const VLMSummaryDialog = ({ 
  csv_id, 
  uid,
  setIsVLMDialogOpen,
  onGenerationComplete 
}: VLMSummaryDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const analyzePlotsStream = useAnalyzePlotsStream();
  const { data: commentsData, isLoading: isLoadingComments } = useCSVComments(csv_id);
  
  const [selectedCommentId, setSelectedCommentId] = useState<string>("no_comment");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResults, setStreamingResults] = useState<StreamPlotAnalysisResponse[]>([]);

  const handleGenerateVLM = async () => {
    if (!csv_id || !user?.uid) {
      toast({
        title: "Missing information",
        description: "Please upload and analyze a file first",
        variant: "destructive",
      });
      return;
    }

    setIsStreaming(true);
    setStreamingResults([]);

    try {
      await analyzePlotsStream.generate(
        {
          uid: user.uid,
          csv_id: csv_id,
          comment_id: selectedCommentId === "no_comment" ? undefined : selectedCommentId,
        },
        (chunk: StreamPlotAnalysisResponse) => {
          setStreamingResults((prev) => {
            const existingIndex = prev.findIndex(
              (r) => r.plot_index === chunk.plot_index && !r.is_summary
            );
            
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = chunk;
              return updated;
            }
            return [...prev, chunk];
          });
        },
        () => {
          setIsStreaming(false);
          toast({
            title: "VLM Analysis Complete",
            description: "All plots have been analyzed successfully",
          });
          
          if (onGenerationComplete) {
            onGenerationComplete();
          }
        }
      );
    } catch (error: any) {
      setIsStreaming(false);
      const errorMessage = getErrorMessage(error);
      console.error("VLM analysis error:", error);
      toast({
        title: "VLM analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const comments = commentsData?.comments || [];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Generate VLM Analysis
        </DialogTitle>
        <DialogDescription>
          Analyze all plots using Vision Language Model. Optionally select a comment to use for guided analysis.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="comment-select">Comment (Optional)</Label>
          <Select 
            value={selectedCommentId} 
            onValueChange={setSelectedCommentId}
            disabled={isStreaming || isLoadingComments}
          >
            <SelectTrigger id="comment-select">
              <SelectValue placeholder="Select a comment (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_comment">No comment (analyze all plots)</SelectItem>
              {isLoadingComments ? (
                <SelectItem value="loading" disabled>Loading comments...</SelectItem>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <SelectItem key={comment._id} value={comment._id}>
                    {comment.comment?.substring(0, 50) || "Empty comment"}
                    {comment.comment && comment.comment.length > 50 ? "..." : ""}
                  </SelectItem>
                ))
              ) : null}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoadingComments 
              ? "Loading comments..." 
              : comments.length > 0 
                ? `${comments.length} comment${comments.length > 1 ? 's' : ''} available`
                : "No comments available - select 'No comment' to analyze all plots"
            }
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsVLMDialogOpen(false);
              setStreamingResults([]);
              setIsStreaming(false);
            }}
            disabled={isStreaming}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleGenerateVLM}
            disabled={isStreaming}
          >
            {isStreaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Plots
              </>
            )}
          </Button>
        </div>

        {streamingResults.length > 0 && (
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            <div className="space-y-4">
              {streamingResults.map((result, idx) => (
                <Card key={`${result.plot_index}-${idx}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {result.is_summary ? (
                          <>
                            <Brain className="h-4 w-4" />
                            Summary
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            Plot {result.plot_index + 1} of {result.total_plots}: {result.plot_filename}
                          </>
                        )}
                      </CardTitle>
                      <Badge
                        variant={
                          result.status === "success"
                            ? "default"
                            : result.status === "error"
                              ? "destructive"
                              : result.status === "analyzing"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {result.status === "success" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {result.status === "error" && (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {result.status === "analyzing" && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {result.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.plot_url && !result.is_summary && (
                      <div>
                        <Label className="text-xs">Plot Preview</Label>
                        <div className="mt-2 border rounded overflow-hidden">
                          <img 
                            src={result.plot_url} 
                            alt={result.plot_filename}
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {result.analysis && (
                      <div>
                        <Label className="text-xs">
                          {result.is_summary ? "Overall Summary" : "Analysis"}
                        </Label>
                        <ScrollArea className="h-32 border rounded p-2 bg-muted mt-1">
                          <pre className="text-xs whitespace-pre-wrap">{result.analysis}</pre>
                        </ScrollArea>
                      </div>
                    )}
                    {result.error && (
                      <div>
                        <Label className="text-xs text-destructive">Error</Label>
                        <ScrollArea className="h-24 border border-destructive rounded p-2 bg-destructive/10 mt-1">
                          <pre className="text-xs text-destructive whitespace-pre-wrap">
                            {result.error}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </DialogContent>
  );
};

export default VLMSummaryDialog;