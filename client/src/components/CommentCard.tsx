import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Comment } from "@/lib/api";
import { format } from "date-fns";

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

export default CommentCard;