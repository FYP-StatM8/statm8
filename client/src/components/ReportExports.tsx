import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportExportsProps {
  // Add props as needed when exports functionality is implemented
}

const ReportExports = ({}: ReportExportsProps) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-muted-foreground">Export options will be available here</p>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default ReportExports;