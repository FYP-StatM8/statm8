import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Plus, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VLMSummaryDialog from "@/components/VLMSummaryDialog";
import { VLMAnalysis } from "@/lib/api";

interface ReportVLMSummariesProps {
  csvId: string;
  uid: string;
  isLoadingVLMSummary: boolean;
  vlmSummaries: VLMAnalysis[] | undefined;
  onViewAnalysis: (analysis: VLMAnalysis) => void;
  onRefetch: () => void | Promise<void>;
}

const VLMSummaryCard = ({ 
  analysis, 
  onViewAnalysis 
}: { 
  analysis: VLMAnalysis; 
  onViewAnalysis: () => void 
}) => {
  const date = new Date(analysis.created_at + "Z").toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            VLM Analysis {analysis.comment_id ? `(Comment ID: ${analysis.comment_id.slice(0, 8)}...)` : ''}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onViewAnalysis}>
            <Eye className="h-4 w-4 mr-2" />
            View Analysis
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3 w-3" />
          {date}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {analysis.summary || "No summary available"}
        </p>
      </CardContent>
    </Card>
  );
};

const ReportVLMSummaries = ({ 
  csvId, 
  uid,
  isLoadingVLMSummary, 
  vlmSummaries, 
  onViewAnalysis,
  onRefetch
}: ReportVLMSummariesProps) => {
  const [isVLMDialogOpen, setIsVLMDialogOpen] = useState(false);

  const handleDialogClose = async (open: boolean) => {
    setIsVLMDialogOpen(open);
    // Refetch VLM summaries when dialog closes
    if (!open && onRefetch) {
      console.log("VLM Dialog closed, refetching summaries...");
      setTimeout(async () => {
        await onRefetch();
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsVLMDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add VLM Summary
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        {isLoadingVLMSummary ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vlmSummaries && vlmSummaries.length > 0 ? (
          <div className="space-y-4">
            {vlmSummaries.map((analysis) => (
              <VLMSummaryCard
                key={analysis._id}
                analysis={analysis}
                onViewAnalysis={() => onViewAnalysis(analysis)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No VLM summaries yet</p>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <Dialog open={isVLMDialogOpen} onOpenChange={handleDialogClose}>
        <VLMSummaryDialog
          csv_id={csvId}
          uid={uid}
          setIsVLMDialogOpen={setIsVLMDialogOpen}
          onGenerationComplete={() => {
            setIsVLMDialogOpen(false);
            onRefetch();
          }}
        />
      </Dialog>
    </div>
  );
};

export default ReportVLMSummaries;