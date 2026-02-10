import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportVLMSummariesProps {
  isLoadingVLMSummary: boolean;
  vlmSummaries: any; // Replace 'any' with proper type when available
}

const ReportVLMSummaries = ({ isLoadingVLMSummary, vlmSummaries }: ReportVLMSummariesProps) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      {isLoadingVLMSummary ? (
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
      ) : vlmSummaries ? (
        <div className="space-y-4">
          {/* TODO: Implement VLM summaries display when data structure is available */}
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">VLM summaries will be displayed here</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No VLM summaries yet</p>
          </CardContent>
        </Card>
      )}
    </ScrollArea>
  );
};

export default ReportVLMSummaries;