import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye, Plus, Calendar, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useUserCSVs, useCSVComments, useCommentAssets, useCSVVLMSummaries, useCSVExports } from "@/hooks/useApi";
import { CSVFile, Comment, CommentAsset, VLMAnalysis } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ReportSummary from "@/components/ReportSummary";
import ReportComments from "@/components/ReportComments";
import ReportVLMSummaries from "@/components/ReportVLMSummaries";
import ReportExports from "@/components/ReportExports";

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCSV, setSelectedCSV] = useState<CSVFile | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedVLMAnalysis, setSelectedVLMAnalysis] = useState<VLMAnalysis | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const { data: csvsData, isLoading: isLoadingCSVs, error: csvsError } = useUserCSVs(user?.uid || null);
  const { data: commentsData, isLoading: isLoadingComments } = useCSVComments(selectedCSV?._id || null);
  const { data: vlmSummariesData, isLoading: isLoadingVLMSummary } = useCSVVLMSummaries(user?.uid || null, selectedCSV?._id || null);
  const { data: exportsData, isLoading: isLoadingExports } = useCSVExports(user?.uid || null, selectedCSV?._id || null);
  const { data: assetsData, isLoading: isLoadingAssets } = useCommentAssets(selectedComment?._id || null);

  const [csvs, setCsvs] = useState<Array<CSVFile>>([]);

  // Sort CSVs by creation date
  useEffect(() => {
    if (csvsData?.csvs) {
      const sortedCSVs: Array<CSVFile> = [...csvsData.csvs];
      sortedCSVs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
      setCsvs(sortedCSVs);
    }
  }, [csvsData]);

  // Handle URL params - open dialog if csvId is in URL
  useEffect(() => {
    const csvId = searchParams.get('csvId');
    const tab = searchParams.get('tab');
    
    if (csvId && csvs.length > 0) {
      const csv = csvs.find(c => c._id === csvId);
      if (csv) {
        setSelectedCSV(csv);
        setIsDetailDialogOpen(true);
        if (tab) {
          setActiveTab(tab);
        }
      }
    }
  }, [searchParams, csvs]);

  const handleRefetchComments = async () => {
    if (selectedCSV?._id) {
      await queryClient.invalidateQueries({ 
        queryKey: ["csvComments", selectedCSV._id],
        refetchType: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["csvComments", selectedCSV._id] 
      });
    }
  };

  const handleRefetchVLMSummaries = async () => {
    if (selectedCSV?._id && user?.uid) {
      await queryClient.invalidateQueries({ 
        queryKey: ["csvVLMSummaries", user.uid, selectedCSV._id],
        refetchType: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["csvVLMSummaries", user.uid, selectedCSV._id] 
      });
    }
  };

  const handleRefetchExports = async () => {
    if (selectedCSV?._id && user?.uid) {
      await queryClient.invalidateQueries({ 
        queryKey: ["csvExports", user.uid, selectedCSV._id],
        refetchType: 'active'
      });
      await queryClient.refetchQueries({ 
        queryKey: ["csvExports", user.uid, selectedCSV._id] 
      });
    }
  };

  const handleViewReport = (csv: CSVFile) => {
    setSelectedCSV(csv);
    setIsDetailDialogOpen(true);
    setActiveTab("summary");
    // Update URL with csvId and tab
    setSearchParams({ csvId: csv._id, tab: "summary" });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Update URL with new tab
    if (selectedCSV) {
      setSearchParams({ csvId: selectedCSV._id, tab: newTab });
    }
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedCSV(null);
    setActiveTab("summary");
    // Remove params from URL
    setSearchParams({});
  };

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
  };

  const handleViewVLMAnalysis = (analysis: VLMAnalysis) => {
    setSelectedVLMAnalysis(analysis);
  };

  const handleDownload = async (csv_url: string, csv_name: string) => {
    try {
      const response = await fetch(csv_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = csv_name.endsWith('.csv')
        ? csv_name
        : `${csv_name}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const parseJSONResponse = (jsonResponse: string) => {
    try {
      return JSON.parse(jsonResponse);
    } catch {
      return null;
    }
  };

  if (csvsError) {
    return (
      <div className="min-h-screen bg-background">
        <AuthNavigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-destructive">Error loading reports. Please try again later.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavigation />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              My Reports
            </h1>
            <p className="text-muted-foreground">
              View and manage all your generated reports
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            className="gap-2"
            onClick={() => navigate("/home")}
          >
            <Plus className="h-5 w-5" />
            New Report
          </Button>
        </div>

        {isLoadingCSVs ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : csvs.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by uploading and analyzing a dataset
                </p>
                <Button variant="hero" onClick={() => navigate("/home")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {csvs.map((csv) => {
                const summary = parseJSONResponse(csv.json_response);
                const date = csv.created_at ? format(new Date(csv.created_at), "MMM dd, yyyy") : "Unknown date";

                return (
                  <Card
                    key={csv._id}
                    className="hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer"
                    onClick={() => handleViewReport(csv)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {date}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{csv.csv_name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {summary?.ai_summary || "No summary available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {summary && (
                          <div className="flex gap-2 flex-wrap text-xs">
                            <Badge variant="outline">
                              {summary.total_rows?.toLocaleString() || 0} rows
                            </Badge>
                            <Badge variant="outline">
                              {summary.total_columns || 0} columns
                            </Badge>
                            <Badge variant="outline">
                              {summary.file_type?.toUpperCase() || "CSV"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(csv);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDownload(csv.csv_url, csv.csv_name) 
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Report Details Dialog with Tabs */}
            <Dialog open={isDetailDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedCSV?.csv_name || "Report Details"}</DialogTitle>
                  <DialogDescription>
                    View dataset analysis and generated EDA reports
                  </DialogDescription>
                </DialogHeader>
                {selectedCSV && (
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                      <TabsTrigger value="vlm_summary">VLM Summary</TabsTrigger>
                      <TabsTrigger value="exports">Exports</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary">
                      <ReportSummary selectedCSV={selectedCSV} />
                    </TabsContent>
                    
                    <TabsContent value="comments">
                      <ReportComments 
                        csvId={selectedCSV._id}
                        isLoadingComments={isLoadingComments}
                        comments={commentsData?.comments}
                        onViewAssets={handleViewComment}
                        onRefetch={handleRefetchComments}
                      />
                    </TabsContent>
                    
                    <TabsContent value="vlm_summary">
                      <ReportVLMSummaries 
                        csvId={selectedCSV._id}
                        uid={user?.uid || ""}
                        isLoadingVLMSummary={isLoadingVLMSummary}
                        vlmSummaries={vlmSummariesData?.vlm_analyses}
                        onViewAnalysis={handleViewVLMAnalysis}
                        onRefetch={handleRefetchVLMSummaries}
                      />
                    </TabsContent>
                    
                    <TabsContent value="exports">
                      <ReportExports 
                        csvId={selectedCSV._id}
                        uid={user?.uid || ""}
                        isLoadingExports={isLoadingExports}
                        exports={exportsData?.exports}
                        onRefetch={handleRefetchExports}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>

            {/* Comment Assets Dialog */}
            {selectedComment && (
              <Dialog open={!!selectedComment} onOpenChange={() => setSelectedComment(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Comment Assets</DialogTitle>
                    <DialogDescription>
                      Generated code blocks and visualizations for this comment
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[600px] pr-4">
                    {isLoadingAssets ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <Card key={i}>
                            <CardHeader>
                              <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                              <Skeleton className="h-40 w-full" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : assetsData?.assets && assetsData.assets.length > 0 ? (
                      <div className="space-y-4">
                        {assetsData.assets.map((asset: CommentAsset) => (
                          <Card key={asset._id}>
                            <CardHeader>
                              <CardTitle className="text-sm">Generated Code Block</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {asset.code && (
                                <div>
                                  <Label className="text-xs mb-2 block">Code</Label>
                                  <ScrollArea className="h-48 border rounded-lg p-4 bg-muted">
                                    <pre className="text-xs whitespace-pre-wrap">{asset.code}</pre>
                                  </ScrollArea>
                                </div>
                              )}
                              {asset.image_urls && asset.image_urls.length > 0 && (
                                <div>
                                  <Label className="text-xs mb-2 block">
                                    Generated Visualizations ({asset.image_urls.length})
                                  </Label>
                                  <div className="grid grid-cols-2 gap-4">
                                    {asset.image_urls.map((url, idx) => (
                                      <div key={idx} className="border rounded-lg overflow-hidden">
                                        <img
                                          src={url}
                                          alt={`Visualization ${idx + 1}`}
                                          className="w-full h-auto"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="text-center py-8">
                        <CardContent>
                          <p className="text-muted-foreground">No assets available for this comment</p>
                        </CardContent>
                      </Card>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}

            {/* VLM Analysis Dialog */}
            {selectedVLMAnalysis && (
              <Dialog open={!!selectedVLMAnalysis} onOpenChange={() => setSelectedVLMAnalysis(null)}>
                <DialogContent className="max-w-6xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>VLM Analysis Details</DialogTitle>
                    <DialogDescription>
                      Vision Language Model analysis of generated plots
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                    <div className="space-y-6 pb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Overall Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedVLMAnalysis.summary || "No summary available"}
                          </p>
                        </CardContent>
                      </Card>

                      {selectedVLMAnalysis.plot_analyses && 
                       selectedVLMAnalysis.plot_analyses.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Plot Analyses</h3>
                          {selectedVLMAnalysis.plot_analyses.map((plotAnalysis, idx) => (
                            <Card key={idx}>
                              <CardHeader>
                                <CardTitle className="text-sm">
                                  {plotAnalysis.plot_filename}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {plotAnalysis.plot_url && (
                                  <div className="border rounded-lg overflow-hidden">
                                    <img
                                      src={plotAnalysis.plot_url}
                                      alt={plotAnalysis.plot_filename}
                                      className="w-full h-auto max-h-96 object-contain bg-white"
                                    />
                                  </div>
                                )}
                                <div className="bg-muted p-4 rounded-lg">
                                  <Label className="text-xs mb-2 block font-semibold">Analysis</Label>
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {plotAnalysis.analysis}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyReports;