import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Eye, Plus } from "lucide-react";
import { Comment } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CommentDialog from "@/components/CommentDialog";
import { useAuth } from "@/context/authContext";

interface ReportCommentsProps {
  csvId: string;
  isLoadingComments: boolean;
  comments: Comment[] | undefined;
  onViewAssets: (comment: Comment) => void;
  onRefetch: () => void | Promise<void>;
}

const CommentCard = ({ comment, onViewAssets }: { comment: Comment; onViewAssets: () => void }) => {
  let dateString = "Just now";
  try {
    // If date doesn't end with Z, add it to indicate UTC
    let dateStr = comment.created_at;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
      dateStr = dateStr + 'Z';
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      dateString = date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {dateString}
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

const ReportComments = ({ csvId, isLoadingComments, comments, onViewAssets, onRefetch }: ReportCommentsProps) => {
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  // Clear optimistic comments when real comments include new data
  useEffect(() => {
    if (comments && comments.length > 0 && optimisticComments.length > 0) {
      console.log("Clearing optimistic comments, real data loaded");
      setOptimisticComments([]);
    }
  }, [comments?.length]);

  const handleCommentSuccess = async (commentText: string) => {
    const now = new Date();
    
    const tempComment: Comment = {
      _id: `temp-${Date.now()}`,
      uid: user?.uid || "unknown",
      csv_id: csvId,
      comment: commentText,
      created_at: now.toISOString(),
    };
    
    console.log("Adding optimistic comment");
    setOptimisticComments([tempComment]);

    // Close dialog
    setIsCommentDialogOpen(false);
    
    // Refetch real comments after a delay
    setTimeout(async () => {
      console.log("Refetching comments...");
      if (onRefetch) {
        await onRefetch();
      }
    }, 1000);
  };

  const displayComments = [
    ...optimisticComments,
    ...(comments || [])
  ].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCommentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Comment
        </Button>
      </div>
      <ScrollArea className="h-[500px] pr-4">
        {isLoadingComments && optimisticComments.length === 0 ? (
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
        ) : displayComments && displayComments.length > 0 ? (
          <div className="space-y-4">
            {displayComments.map((comment: Comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onViewAssets={() => onViewAssets(comment)}
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

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <CommentDialog
          csv_id={csvId}
          setIsGenerateDialogOpen={setIsCommentDialogOpen}
          onCommentSuccess={handleCommentSuccess}
        />
      </Dialog>
    </div>
  );
};

export default ReportComments;