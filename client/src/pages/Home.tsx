import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import { useUploadAndAnalyze, useGenerateEDAStream, useUserCSVs } from "@/hooks/useApi";
import { DatasetSummaryResponse, StreamCodeBlockResponse } from "@/lib/api";
import { 
  Upload, 
  FileSpreadsheet, 
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DatasetSummaryResponse | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [streamingBlocks, setStreamingBlocks] = useState<StreamCodeBlockResponse[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const uploadMutation = useUploadAndAnalyze();
  const { data: userCSVs, isLoading: isLoadingCSVs } = useUserCSVs(user?.uid || null);
  const edaStream = useGenerateEDAStream();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights from your data with advanced machine learning algorithms",
      action: "Start Analysis",
      onClick: () => {
        if (analysisResult) {
          setIsGenerateDialogOpen(true);
        } else {
          toast({
            title: "No dataset available",
            description: "Please upload and analyze a dataset first",
            variant: "destructive",
          });
        }
      }
    },
    {
      icon: FileSpreadsheet,
      title: "Data Upload",
      description: "Upload CSV, Excel, or connect to your database for seamless data integration",
      action: "Upload Data",
      onClick: () => setIsUploadDialogOpen(true)
    },
    {
      icon: BarChart3,
      title: "Interactive Visualizations",
      description: "Create beautiful charts and graphs with our intuitive visualization tools",
      action: "Create Chart",
      onClick: () => {
        if (analysisResult) {
          setIsGenerateDialogOpen(true);
        } else {
          toast({
            title: "No dataset available",
            description: "Please upload and analyze a dataset first",
            variant: "destructive",
          });
        }
      }
    },
    {
      icon: Sparkles,
      title: "Automated Reports",
      description: "Generate comprehensive reports automatically with AI-driven insights",
      action: "Generate Report",
      onClick: () => {
        if (analysisResult) {
          setIsGenerateDialogOpen(true);
        } else {
          navigate("/my-reports");
        }
      }
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast trends and make data-driven decisions with predictive models",
      action: "View Predictions",
      onClick: () => {
        if (analysisResult) {
          setIsGenerateDialogOpen(true);
        } else {
          toast({
            title: "No dataset available",
            description: "Please upload and analyze a dataset first",
            variant: "destructive",
          });
        }
      }
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Share reports and insights with your team in real-time",
      action: "Invite Team",
      onClick: () => navigate("/my-reports")
    }
  ];

  const quickActions = [
    { 
      icon: Upload, 
      label: "Upload Dataset", 
      color: "text-blue-500",
      onClick: () => setIsUploadDialogOpen(true)
    },
    { 
      icon: FileSpreadsheet, 
      label: "New Analysis", 
      color: "text-green-500",
      onClick: () => {
        if (analysisResult) {
          setIsGenerateDialogOpen(true);
        } else {
          setIsUploadDialogOpen(true);
        }
      }
    },
    { 
      icon: BarChart3, 
      label: "View Dashboard", 
      color: "text-purple-500",
      onClick: () => navigate("/my-reports")
    },
    { 
      icon: Download, 
      label: "Export Report", 
      color: "text-orange-500",
      onClick: () => navigate("/my-reports")
    }
  ];

  const stats = {
    datasetsAnalyzed: userCSVs?.csvs?.length || 0,
    reportsGenerated: userCSVs?.csvs?.reduce((acc, csv) => {
      try {
        const json = JSON.parse(csv.json_response);
        return acc + 1;
      } catch {
        return acc;
      }
    }, 0) || 0,
    insightsDiscovered: streamingBlocks.filter(b => b.status === "success").length,
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or JSON file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.uid) {
      toast({
        title: "Missing information",
        description: "Please select a file and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        uid: user.uid,
      });
      setAnalysisResult(result);
      setIsUploadDialogOpen(false);
      setIsAnalysisDialogOpen(true);
      toast({
        title: "Upload successful",
        description: `Analyzed ${result.total_rows} rows and ${result.total_columns} columns`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
      console.error("Upload error:", errorMessage);
    }
  };

  const handleGenerateEDA = async () => {
    if (!analysisResult?.csv_id || !user?.uid || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please upload and analyze a file first",
        variant: "destructive",
      });
      return;
    }

    setIsStreaming(true);
    setStreamingBlocks([]);

    const baseFileName = selectedFile.name.replace(/\.(csv|json)$/, '');
    const filePath = `uploads/${baseFileName}.csv`;
    
    try {
      await edaStream.generate(
        {
          file_path: filePath,
          comments: comments || undefined,
          uid: user.uid,
          csv_id: analysisResult.csv_id,
        },
        (chunk: StreamCodeBlockResponse) => {
          setStreamingBlocks((prev) => {
            const existingIndex = prev.findIndex((b) => b.block_id === chunk.block_id);
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
          setIsGenerateDialogOpen(false);
        }
      );
    } catch (error: unknown) {
      setIsStreaming(false);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("EDA generation error:", errorMessage);
      toast({
        title: "EDA generation error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to unlock insights from your data? Choose a feature below to get started.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer hover:scale-105"
                onClick={action.onClick}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                  <Icon className={`h-8 w-8 ${action.color}`} />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Explore Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-[var(--shadow-elegant)] transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" onClick={feature.onClick}>
                      {feature.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">
                {isLoadingCSVs ? <Skeleton className="h-8 w-16" /> : stats.datasetsAnalyzed}
              </CardTitle>
              <CardDescription>Datasets Analyzed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">
                {isLoadingCSVs ? <Skeleton className="h-8 w-16" /> : stats.reportsGenerated}
              </CardTitle>
              <CardDescription>Reports Generated</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">{stats.insightsDiscovered}</CardTitle>
              <CardDescription>Insights Discovered</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Upload Dataset</DialogTitle>
              <DialogDescription>
                Upload a CSV or JSON file to begin analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFile ? selectedFile.name : "Click to select a file or drag and drop"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Select File
                </Button>
              </div>
              
              {selectedFile && (
                <div className="flex gap-2">
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={uploadMutation.isPending}
                    onClick={handleUpload}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Analyze
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Dataset Analysis Results</DialogTitle>
              <DialogDescription>
                Analysis completed for {analysisResult?.file_type.toUpperCase() || "CSV"} file
              </DialogDescription>
            </DialogHeader>
            {analysisResult && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="columns">Columns</TabsTrigger>
                  <TabsTrigger value="sample">Sample Data</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">File Type</Label>
                        <p className="text-lg font-semibold">{analysisResult.file_type.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Rows</Label>
                        <p className="text-lg font-semibold">{analysisResult.total_rows.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Columns</Label>
                        <p className="text-lg font-semibold">{analysisResult.total_columns}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">CSV ID</Label>
                        <p className="text-sm font-mono truncate">{analysisResult.csv_id || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">AI Summary</Label>
                      <ScrollArea className="h-48 border rounded-lg p-4 bg-muted">
                        <p className="text-sm whitespace-pre-wrap">{analysisResult.ai_summary}</p>
                      </ScrollArea>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="columns" className="space-y-2">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {analysisResult.columns_info.map((col, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{col.name}</CardTitle>
                              <Badge variant="outline">{col.dtype}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-1">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Non-null: </span>
                                <span className="font-semibold">{col.non_null_count.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Null: </span>
                                <span className="font-semibold">{col.null_count.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unique: </span>
                                <span className="font-semibold">{col.unique_count.toLocaleString()}</span>
                              </div>
                            </div>
                            {col.sample_values.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Sample Values</Label>
                                <div className="flex gap-1 flex-wrap mt-1">
                                  {col.sample_values.slice(0, 5).map((val, valIdx) => (
                                    <Badge key={valIdx} variant="secondary" className="text-xs">
                                      {String(val)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="sample">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted">
                          <tr>
                            {analysisResult.columns_info.map((col, idx) => (
                              <th key={idx} className="p-2 text-left font-semibold">
                                {col.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.sample_rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-t">
                              {analysisResult.columns_info.map((col, colIdx) => (
                                <td key={colIdx} className="p-2">
                                  {String(row[col.name] ?? "null")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setIsAnalysisDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="hero"
                onClick={() => {
                  setIsAnalysisDialogOpen(false);
                  setIsGenerateDialogOpen(true);
                }}
                disabled={!analysisResult}
              >
                <Play className="mr-2 h-4 w-4" />
                Generate EDA
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Generate Exploratory Data Analysis</DialogTitle>
              <DialogDescription>
                Add optional comments to guide the EDA generation process
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="E.g., Focus on correlation analysis, Check for outliers in the age column..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsGenerateDialogOpen(false);
                    setStreamingBlocks([]);
                    setIsStreaming(false);
                  }}
                  disabled={isStreaming}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleGenerateEDA}
                  disabled={isStreaming || !analysisResult}
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate EDA
                    </>
                  )}
                </Button>
              </div>
              {streamingBlocks.length > 0 && (
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {streamingBlocks.map((block) => (
                      <Card key={block.block_id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">
                              Block {block.block_id}: {block.description}
                            </CardTitle>
                            <Badge
                              variant={
                                block.status === "success"
                                  ? "default"
                                  : block.status === "error"
                                  ? "destructive"
                                  : block.status === "executing"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {block.status === "success" && (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              )}
                              {block.status === "error" && (
                                <XCircle className="mr-1 h-3 w-3" />
                              )}
                              {block.status === "executing" && (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              )}
                              {block.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {block.code && (
                            <div>
                              <Label className="text-xs">Code</Label>
                              <ScrollArea className="h-32 border rounded p-2 bg-muted">
                                <pre className="text-xs">{block.code}</pre>
                              </ScrollArea>
                            </div>
                          )}
                          {block.output && (
                            <div>
                              <Label className="text-xs">Output</Label>
                              <ScrollArea className="h-24 border rounded p-2 bg-muted">
                                <pre className="text-xs whitespace-pre-wrap">{block.output}</pre>
                              </ScrollArea>
                            </div>
                          )}
                          {block.error && (
                            <div>
                              <Label className="text-xs text-destructive">Error</Label>
                              <ScrollArea className="h-24 border border-destructive rounded p-2 bg-destructive/10">
                                <pre className="text-xs text-destructive whitespace-pre-wrap">
                                  {block.error}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                          {block.plots_generated && block.plots_generated.length > 0 && (
                            <div>
                              <Label className="text-xs">
                                Generated Plots ({block.plots_generated.length})
                              </Label>
                              <div className="flex gap-2 flex-wrap mt-1">
                                {block.plots_generated.map((plot, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {plot}
                                  </Badge>
                                ))}
                              </div>
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
        </Dialog>
      </main>
    </div>
  );
};

export default Home;
