import { GraduationCap, Building2, FlaskConical, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const useCases = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Learn data science without the steep learning curve. Perfect for assignments and projects."
  },
  {
    icon: FlaskConical,
    title: "Researchers",
    description: "Focus on discoveries, not data wrangling. Accelerate your research with AI assistance."
  },
  {
    icon: Users,
    title: "Analysts",
    description: "10x your productivity with automated workflows and intelligent insights."
  },
  {
    icon: Building2,
    title: "Enterprises",
    description: "Scale data-driven decision making across your organization effortlessly."
  }
];

const UseCases = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're just starting out or managing enterprise-scale data
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              className="p-6 text-center hover:shadow-[var(--shadow-elegant)] hover:scale-105 transition-all duration-300 bg-card border-2 hover:border-primary/20"
            >
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <useCase.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
