import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Eye, Plus, Loader2, Calendar, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useUserCSVs, useCSVComments, useCommentAssets } from "@/hooks/useApi";
import { CSVFile, Comment, CommentAsset } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCSV, setSelectedCSV] = useState<CSVFile | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: csvsData, isLoading: isLoadingCSVs, error: csvsError } = useUserCSVs(user?.uid || null);
  const { data: commentsData, isLoading: isLoadingComments } = useCSVComments(selectedCSV?._id || null);
  const { data: assetsData, isLoading: isLoadingAssets } = useCommentAssets(selectedComment?._id || null);

  const csvs = csvsData?.csvs || [];

  const handleViewReport = (csv: CSVFile) => {
    setSelectedCSV(csv);
    setIsDetailDialogOpen(true);
  };

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
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
                            window.open(csv.csv_url, "_blank");
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

            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{selectedCSV?.csv_name || "Report Details"}</DialogTitle>
                  <DialogDescription>
                    View dataset analysis and generated EDA reports
                  </DialogDescription>
                </DialogHeader>
                {selectedCSV && (
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="space-y-4">
                      <ScrollArea className="h-[500px] pr-4">
                        {(() => {
                          const summary = parseJSONResponse(selectedCSV.json_response);
                          if (!summary) {
                            return <p className="text-muted-foreground">No summary available</p>;
                          }
                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardDescription>Total Rows</CardDescription>
                                    <CardTitle className="text-2xl">{summary.total_rows?.toLocaleString() || 0}</CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardDescription>Total Columns</CardDescription>
                                    <CardTitle className="text-2xl">{summary.total_columns || 0}</CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardDescription>File Type</CardDescription>
                                    <CardTitle className="text-2xl">{summary.file_type?.toUpperCase() || "CSV"}</CardTitle>
                                  </CardHeader>
                                </Card>
                              </div>
                              {summary.ai_summary && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>AI Summary</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{summary.ai_summary}</p>
                                  </CardContent>
                                </Card>
                              )}
                              {summary.columns_info && Array.isArray(summary.columns_info) && summary.columns_info.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Column Information</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {summary.columns_info.map((col: { name?: string; dtype?: string; non_null_count?: number; null_count?: number; unique_count?: number }, idx: number) => (
                                        <div key={idx} className="border rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <Label className="font-semibold">{col.name || `Column ${idx + 1}`}</Label>
                                            <Badge variant="outline">{col.dtype || "unknown"}</Badge>
                                          </div>
                                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                            <span>Non-null: {col.non_null_count?.toLocaleString() || 0}</span>
                                            <span>Null: {col.null_count?.toLocaleString() || 0}</span>
                                            <span>Unique: {col.unique_count?.toLocaleString() || 0}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          );
                        })()}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="comments" className="space-y-4">
                      <ScrollArea className="h-[500px] pr-4">
                        {isLoadingComments ? (
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
                        ) : commentsData?.comments && commentsData.comments.length > 0 ? (
                          <div className="space-y-4">
                            {commentsData.comments.map((comment: Comment) => (
                              <CommentCard
                                key={comment._id}
                                comment={comment}
                                onViewAssets={() => handleViewComment(comment)}
                              />
                            ))}
                          </div>
                        ) : (
                          <Card className="text-center py-8">
                            <CardContent>
                              <p className="text-muted-foreground">No comments yet</p>
                            </CardContent>
                          </Card>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>

            {selectedComment && (
              <Dialog open={!!selectedComment} onOpenChange={() => setSelectedComment(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
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
          </>
        )}
      </main>
    </div>
  );
};

const CommentCard = ({ comment, onViewAssets }: { comment: Comment; onViewAssets: () => void }) => {
  const date = comment.created_at ? format(new Date(comment.created_at), "MMM dd, yyyy HH:mm") : "Unknown date";
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date}
          </div>
          <Button variant="outline" size="sm" onClick={onViewAssets}>
            <Eye className="h-4 w-4 mr-2" />
            View Assets
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{comment.comment || "EMPTY COMMENT"}</p>
      </CardContent>
    </Card>
  );
};

export default MyReports;
