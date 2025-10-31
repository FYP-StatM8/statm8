import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Trash2, Plus } from "lucide-react";

const MyReports = () => {
  // Placeholder data - will be replaced with real data later
  const reports = [
    {
      id: 1,
      title: "Sample Report 1",
      description: "Analysis of Q4 sales data",
      date: "2025-10-25",
      status: "completed"
    },
    {
      id: 2,
      title: "Sample Report 2",
      description: "Customer behavior analysis",
      date: "2025-10-20",
      status: "completed"
    }
  ];

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
          <Button variant="hero" size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Report
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first analysis report
                </p>
                <Button variant="hero">Create First Report</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-[var(--shadow-elegant)] transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{report.date}</span>
                  </div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyReports;
