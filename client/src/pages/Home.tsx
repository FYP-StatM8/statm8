import AuthNavigation from "@/components/AuthNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  BarChart3, 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp, 
  Users,
  Upload,
  Download
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights from your data with advanced machine learning algorithms",
      action: "Start Analysis"
    },
    {
      icon: FileSpreadsheet,
      title: "Data Upload",
      description: "Upload CSV, Excel, or connect to your database for seamless data integration",
      action: "Upload Data"
    },
    {
      icon: BarChart3,
      title: "Interactive Visualizations",
      description: "Create beautiful charts and graphs with our intuitive visualization tools",
      action: "Create Chart"
    },
    {
      icon: Sparkles,
      title: "Automated Reports",
      description: "Generate comprehensive reports automatically with AI-driven insights",
      action: "Generate Report"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast trends and make data-driven decisions with predictive models",
      action: "View Predictions"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Share reports and insights with your team in real-time",
      action: "Invite Team"
    }
  ];

  const quickActions = [
    { icon: Upload, label: "Upload Dataset", color: "text-blue-500" },
    { icon: FileSpreadsheet, label: "New Analysis", color: "text-green-500" },
    { icon: BarChart3, label: "View Dashboard", color: "text-purple-500" },
    { icon: Download, label: "Export Report", color: "text-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AuthNavigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to unlock insights from your data? Choose a feature below to get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer hover:scale-105">
                <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                  <Icon className={`h-8 w-8 ${action.color}`} />
                  <span className="text-sm font-medium text-center">{action.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Grid */}
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
                    <Button variant="outline" className="w-full">
                      {feature.action}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">0</CardTitle>
              <CardDescription>Datasets Analyzed</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">0</CardTitle>
              <CardDescription>Reports Generated</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">0</CardTitle>
              <CardDescription>Insights Discovered</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;
