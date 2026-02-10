import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Eye, Plus } from "lucide-react";
import { Comment } from "@/lib/api";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CommentDialog from "@/components/CommentDialog";
import { useAuth } from "@/context/authContext";

interface ReportCommentsProps {
  csvId: string;
  isLoadingComments: boolean;
  comments: Comment[] | undefined;
  onViewAssets: (comment: Comment) => void;
  onRefetch: () => void | Promise<void>;
  onCommentAdded?: (tempComment: Comment) => void;
}

const CommentCard = ({ comment, onViewAssets }: { comment: Comment; onViewAssets: () => void }) => {
  const date = new Date(comment.created_at + "Z").toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
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

const ReportComments = ({ csvId, isLoadingComments, comments, onViewAssets, onRefetch, onCommentAdded }: ReportCommentsProps) => {
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  const handleDialogClose = async (open: boolean) => {
    setIsCommentDialogOpen(open);
    // Refetch comments when dialog closes
    if (!open && onRefetch) {
      console.log("Dialog closed, refetching comments...");
      // Reduced delay since we show optimistic updates
      setTimeout(async () => {
        await onRefetch();
        // Clear optimistic comments after real data is fetched
        setOptimisticComments([]);
      }, 300);
    }
  };

  const handleCommentSuccess = (commentText: string) => {
    // Debug: Show current time
    const now = new Date();
    console.log("Current UTC time:", now.toISOString());
    console.log("Current IST time:", formatInTimeZone(now, "Asia/Kolkata", "MMM dd, yyyy HH:mm"));

    // Add optimistic comment immediately
    const tempComment: Comment = {
      _id: `temp-${Date.now()}`,
      uid: user?.uid || "unknown",
      csv_id: csvId,
      comment: commentText,
      created_at: now.toISOString(), // This creates UTC time
    };
    setOptimisticComments(prev => [tempComment, ...prev]);
  };

  // Combine real comments with optimistic ones, filtering out duplicates
  const displayComments = [
    ...optimisticComments,
    ...(comments || []).filter(realComment =>
      !optimisticComments.some(optComment =>
        optComment.comment === realComment.comment
      )
    )
  ].sort((a, b) => {
    // Sort by created_at in descending order (most recent first)
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

      <Dialog open={isCommentDialogOpen} onOpenChange={handleDialogClose}>
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