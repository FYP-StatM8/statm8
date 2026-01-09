import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { Link } from "react-router-dom";
// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
//   DialogHeader,
//   DialogTitle
// } from "@/components/ui/dialog";
// import ReportItem from "@/components/ReportItem";

const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  // Placeholder data - will be replaced with real data later
  // const reports = [
  //   {
  //     id: 1,
  //     title: "Sample Report 1",
  //     description: "Analysis of Q4 sales data",
  //     date: "2025-10-25",
  //     status: "completed"
  //   },
  //   {
  //     id: 2,
  //     title: "Sample Report 2",
  //     description: "Customer behavior analysis",
  //     date: "2025-10-20",
  //     status: "completed"
  //   }
  // ];
  // const getDownloadUrl = (url) => {
  //   // Inserts 'fl_attachment' into the URL transformation path
  //   return url.replace('/upload/', '/upload/fl_attachment/');
  // };
  const handleDownload = async (csv_url:string, csv_name:string) => {
    try {
      // 1. Fetch the file as a blob
      const response = await fetch(csv_url);
      const blob = await response.blob();

      // 2. Create a temporary URL for that blob
      const url = window.URL.createObjectURL(blob);

      // 3. Create a hidden link element
      const link = document.createElement('a');
      link.href = url;

      // 4. Force the filename using your report name
      // We ensure it ends with .csv
      const filename = csv_name.endsWith('.csv')
        ? csv_name
        : `${csv_name}.csv`;

      link.setAttribute('download', filename);

      // 5. Append, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Clean up DOM and memory
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the file.");
    }
  };
  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + `/storage/csv/user/${user.uid}`)
      .then(res => res.json())
      .then(data => {
        setReports(data.csvs);
      });
  }, []);
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
              <Card key={report._id} className="hover:shadow-[var(--shadow-elegant)] transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">{report.created_at}</span>
                  </div>
                  <CardTitle className="text-xl">{report.csv_name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">.
                    <Link to={`/my-reports/${report._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {/* <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{report.csv_name} Report</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <ReportItem report={report} />
                        </div>

                      </DialogContent>
                    </Dialog> */}
                    {/* <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button> */}
                    <Button onClick={()=>{handleDownload(report.csv_url, report.csv_name)}} variant="outline" size="sm" className="gap-2">
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
