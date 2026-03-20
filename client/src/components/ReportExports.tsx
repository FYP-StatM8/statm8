import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Plus, Calendar, FileText, Eye, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExportDialog from "@/components/ExportDialog";
import { Export } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useToast } from "@/hooks/use-toast";

interface ReportExportsProps {
  csvId: string;
  uid: string;
  isLoadingExports: boolean;
  exports: Export[] | undefined;
  onRefetch: () => void | Promise<void>;
}

const ExportCard = ({ 
  exportItem, 
  onDownload,
  onView,
  isDownloading
}: { 
  exportItem: Export; 
  onDownload: () => void;
  onView: () => void;
  isDownloading: boolean;
}) => {
  // Convert UTC to IST - handle dates without Z suffix
  let dateStr = exportItem.created_at;
  if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
    dateStr = dateStr + 'Z';
  }
  const utcDate = new Date(dateStr);
  const istDate = toZonedTime(utcDate, 'Asia/Kolkata');
  const dateString = format(istDate, "MMM dd, yyyy 'at' h:mm a");

  const getFormatBadge = (format: string) => {
    const colors = {
      pdf: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      markdown: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      latex: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    };
    return colors[format as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const isZipFormat = exportItem.format === 'markdown' || exportItem.format === 'latex';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                {exportItem.format?.toUpperCase()} Export
              </CardTitle>
              <Badge className={getFormatBadge(exportItem.format || 'pdf')}>
                {exportItem.format?.toUpperCase()}
              </Badge>
              {isZipFormat && (
                <Badge variant="outline">ZIP</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {dateString} IST
            </div>
          </div>
          <div className="flex gap-2">
            {/* Only show View button for PDF format */}
            {exportItem.format === 'pdf' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onView}
                className="gap-2"
                disabled={isDownloading}
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownload}
              className="gap-2"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            {exportItem.sections_included?.map((section, idx) => (
              <Badge key={idx} variant="secondary">
                {section}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {exportItem.total_plots > 0 && (
              <span>{exportItem.total_plots} plot{exportItem.total_plots > 1 ? 's' : ''} included</span>
            )}
            {exportItem.file_size_bytes && (
              <span className="ml-3">
                {(exportItem.file_size_bytes / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportExports = ({ 
  csvId, 
  uid,
  isLoadingExports, 
  exports,
  onRefetch
}: ReportExportsProps) => {
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDialogClose = async (open: boolean) => {
    setIsExportDialogOpen(open);
    // Refetch exports when dialog closes
    if (!open && onRefetch) {
      console.log("Export Dialog closed, refetching exports...");
      setTimeout(async () => {
        await onRefetch();
      }, 500);
    }
  };

  const handleDownload = async (exportId: string, cloudinaryUrl: string, format: string, csvName: string) => {
    setDownloadingId(exportId);
    
    try {
      toast({
        title: "Download started",
        description: "Your file is being downloaded...",
      });

      const response = await fetch(cloudinaryUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Determine file extension based on format
      let extension = 'pdf';
      if (format === 'markdown' || format === 'latex') {
        extension = 'zip';
      }
      
      const filename = `${csvName}_${format}_export.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete",
        description: `${filename} has been downloaded successfully`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (cloudinaryUrl: string) => {
    setPdfViewUrl(cloudinaryUrl);
  };

  const handleClosePdfViewer = () => {
    setPdfViewUrl(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsExportDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Export
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        {isLoadingExports ? (
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
        ) : exports && exports.length > 0 ? (
          <div className="space-y-4">
            {exports.map((exportItem) => (
              <ExportCard
                key={exportItem._id}
                exportItem={exportItem}
                onDownload={() => handleDownload(
                  exportItem._id,
                  exportItem.cloudinary_url, 
                  exportItem.format, 
                  exportItem.csv_name
                )}
                onView={() => handleView(exportItem.cloudinary_url)}
                isDownloading={downloadingId === exportItem._id}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No exports yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                Click "Generate Export" to create your first export
              </p>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <Dialog open={isExportDialogOpen} onOpenChange={handleDialogClose}>
        <ExportDialog
          csv_id={csvId}
          uid={uid}
          setIsExportDialogOpen={setIsExportDialogOpen}
          onExportComplete={() => {
            setIsExportDialogOpen(false);
            onRefetch();
          }}
        />
      </Dialog>

      {/* PDF Viewer Dialog - Only for PDF files */}
      {pdfViewUrl && (
        <Dialog open={!!pdfViewUrl} onOpenChange={handleClosePdfViewer}>
          <DialogContent className="max-w-6xl max-h-[90vh] p-0">
            <DialogHeader className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={handleClosePdfViewer}
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="h-[90vh] w-full">
              <iframe
                src={pdfViewUrl}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ReportExports;