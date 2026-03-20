import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/authContext";
import { useUploadAndAnalyze, useUserCSVs } from "@/hooks/useApi";
import { DatasetSummaryResponse } from "@/lib/api";
import {
  Upload,
  FileSpreadsheet,
  BarChart3,
  Loader2,
  Play,
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CommentDialog from "@/components/CommentDialog";

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

  const uploadMutation = useUploadAndAnalyze();
  const { data: userCSVs, isLoading: isLoadingCSVs } = useUserCSVs(user?.uid || null);

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
    insightsDiscovered: 0
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

        {/* Upload Dialog */}
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

        {/* Analysis Results Dialog */}
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

        {/* EDA Generation Dialog */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <CommentDialog 
            csv_id={analysisResult?.csv_id || ""} 
            setIsGenerateDialogOpen={setIsGenerateDialogOpen}
          />
        </Dialog>
      </main>
    </div>
  );
};

export default Home;