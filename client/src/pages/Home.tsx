import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
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
import { useState } from "react";

const Home = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'recent'>('upload');
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to StatM8</h1>
          <p className="text-xl text-gray-600">Your all-in-one data analysis platform</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload Data
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Files
              </button>
            </nav>
          </div>

          {activeTab === 'upload' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your Data</h2>
                <p className="text-gray-600 mb-6">
                  Upload your CSV, Excel, or JSON file to start analyzing your data
                </p>
                <div className="max-w-2xl mx-auto">
                  <FileUpload />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recent files. Upload a file to get started.</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
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
      </main>
    </div>
  );
};

export default Home;
