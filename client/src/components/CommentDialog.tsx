import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


const CommentDialog = ({ 
    csv_id, 
    setIsGenerateDialogOpen,
    onCommentSuccess 
}: { 
    csv_id: string, 
    setIsGenerateDialogOpen: any,
    onCommentSuccess?: (commentText: string) => void
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const edaStream = useGenerateEDAStream();
    const [comments, setComments] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingBlocks, setStreamingBlocks] = useState<StreamCodeBlockResponse[]>([]);
    
    const handleGenerateEDA = async () => {
        if (!csv_id || !user?.uid) {
            toast({
                title: "Missing information",
                description: "Please upload and analyze a file first",
                variant: "destructive",
            });
            return;
        }
        setIsStreaming(true);
        setStreamingBlocks([]);

        try {
            await edaStream.generate(
                {
                    uid: user.uid,
                    csv_id: csv_id,
                    comments: comments || undefined,
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
                    // Stream completed successfully
                    setIsStreaming(false);
                    
                    // Show optimistic update immediately
                    if (onCommentSuccess && comments) {
                        onCommentSuccess(comments);
                    }
                    
                    // Close dialog
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
        <>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                            disabled={isStreaming}
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
        </>
    )
};

export default CommentDialog;