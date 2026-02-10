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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Loader2, 
  FileText,
  Download
} from "lucide-react";
import { useCSVVLMSummaries, useGenerateExport } from "@/hooks/useApi";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface ExportDialogProps {
  csv_id: string;
  uid: string;
  setIsExportDialogOpen: (open: boolean) => void;
  onExportComplete?: () => void;
}

const ExportDialog = ({ 
  csv_id, 
  uid,
  setIsExportDialogOpen,
  onExportComplete 
}: ExportDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const generateExport = useGenerateExport();
  
  const { data: vlmSummariesData, isLoading: isLoadingVLMSummaries } = useCSVVLMSummaries(uid, csv_id);
  
  const [selectedVLMAnalysisId, setSelectedVLMAnalysisId] = useState<string>("no_vlm");
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includePlots, setIncludePlots] = useState(true);
  const [includeCode, setIncludeCode] = useState(false);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<"pdf" | "markdown" | "latex">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const vlmSummaries = vlmSummariesData?.vlm_analyses || [];

  const handleGenerateExport = async () => {
    if (!csv_id || !user?.uid) {
      toast({
        title: "Missing information",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateExport.mutateAsync({
        uid: user.uid,
        csv_id: csv_id,
        vlm_analysis_id: selectedVLMAnalysisId === "no_vlm" ? undefined : selectedVLMAnalysisId,
        include_summary: includeSummary,
        include_plots: includePlots,
        include_code: includeCode,
        title: title || undefined,
        format: format,
      });

      toast({
        title: "Export Generated Successfully",
        description: `Your ${format.toUpperCase()} export is ready to download`,
      });

      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Export generation error:", errorMessage);
      toast({
        title: "Export generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Report Export
        </DialogTitle>
        <DialogDescription>
          Configure and generate a downloadable report in your preferred format
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
        <div className="space-y-6 pb-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Enter custom report title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default title
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as "pdf" | "markdown" | "latex")}
              disabled={isGenerating}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="format-pdf" />
                <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
                  PDF - Best for sharing and viewing
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="format-markdown" />
                <Label htmlFor="format-markdown" className="font-normal cursor-pointer">
                  Markdown - Editable format with images (ZIP)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="latex" id="format-latex" />
                <Label htmlFor="format-latex" className="font-normal cursor-pointer">
                  LaTeX - Academic/publication format (ZIP)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* VLM Analysis Selection */}
          <div className="space-y-2">
            <Label htmlFor="vlm-select">VLM Analysis (Optional)</Label>
            <Select 
              value={selectedVLMAnalysisId} 
              onValueChange={setSelectedVLMAnalysisId}
              disabled={isGenerating || isLoadingVLMSummaries}
            >
              <SelectTrigger id="vlm-select">
                <SelectValue placeholder="Select VLM analysis (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_vlm">No VLM analysis</SelectItem>
                {isLoadingVLMSummaries ? (
                  <SelectItem value="loading" disabled>Loading VLM analyses...</SelectItem>
                ) : vlmSummaries.length > 0 ? (
                  vlmSummaries.map((analysis) => (
                    <SelectItem key={analysis._id} value={analysis._id}>
                      {analysis.summary?.substring(0, 50) || "VLM Analysis"}
                      {analysis.summary && analysis.summary.length > 50 ? "..." : ""}
                      {" "}({new Date(analysis.created_at).toLocaleDateString()})
                    </SelectItem>
                  ))
                ) : null}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isLoadingVLMSummaries 
                ? "Loading VLM analyses..." 
                : vlmSummaries.length > 0 
                  ? `${vlmSummaries.length} VLM analysis available`
                  : "No VLM analyses available"
              }
            </p>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                    disabled={isGenerating}
                  />
                  <Label 
                    htmlFor="include-summary" 
                    className="font-normal cursor-pointer"
                  >
                    Dataset Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-plots"
                    checked={includePlots}
                    onCheckedChange={(checked) => setIncludePlots(checked as boolean)}
                    disabled={isGenerating}
                  />
                  <Label 
                    htmlFor="include-plots" 
                    className="font-normal cursor-pointer"
                  >
                    Plots and Visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-code"
                    checked={includeCode}
                    onCheckedChange={(checked) => setIncludeCode(checked as boolean)}
                    disabled={isGenerating}
                  />
                  <Label 
                    htmlFor="include-code" 
                    className="font-normal cursor-pointer"
                  >
                    Code Blocks
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setIsExportDialogOpen(false);
          }}
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          variant="hero"
          onClick={handleGenerateExport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Export
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

export default ExportDialog;