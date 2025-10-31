import { Database, MessageSquare, BarChart3, Zap, Eye, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Database,
    title: "Smart Data Cleaning",
    description: "AI-powered data cleaning that understands multi-column dependencies and relationships."
  },
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    description: "Ask questions in plain English—no SQL or coding knowledge required."
  },
  {
    icon: BarChart3,
    title: "Intelligent Visualization",
    description: "Automatically generate meaningful charts and graphs from your data insights."
  },
  {
    icon: Eye,
    title: "Multimodal Analysis",
    description: "Process and analyze both structured data and visual information seamlessly."
  },
  {
    icon: Zap,
    title: "Automated Pipeline",
    description: "From ingestion to insights—fully automated workflow that adapts to your data."
  },
  {
    icon: FileText,
    title: "Report Generation",
    description: "Auto-generate comprehensive reports with key findings and visualizations."
  }
];

const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Modern Analytics
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform raw data into actionable insights
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-[var(--shadow-elegant)] hover:scale-105 transition-all duration-300 border-2 hover:border-primary/30 bg-card"
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
