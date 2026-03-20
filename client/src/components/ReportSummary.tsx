import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CSVFile } from "@/lib/api";

interface ReportSummaryProps {
  selectedCSV: CSVFile;
}

const ReportSummary = ({ selectedCSV }: ReportSummaryProps) => {
  const parseJSONResponse = (jsonResponse: string) => {
    try {
      return JSON.parse(jsonResponse);
    } catch {
      return null;
    }
  };

  const summary = parseJSONResponse(selectedCSV.json_response);

  if (!summary) {
    return <p className="text-muted-foreground">No summary available</p>;
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
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
    </ScrollArea>
  );
};

export default ReportSummary;