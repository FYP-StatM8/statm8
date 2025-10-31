import { AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const Problem = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Problem */}
          <Card className="p-8 border-2 border-destructive/20 bg-card hover:shadow-[var(--shadow-elegant)] transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">The Problem</h3>
                <p className="text-muted-foreground">Traditional data analysis is:</p>
              </div>
            </div>
            <ul className="space-y-3 ml-14">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span className="text-muted-foreground">
                  Time-consuming and requires specialized expertise
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span className="text-muted-foreground">
                  Fragmented across multiple disconnected tools
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span className="text-muted-foreground">
                  Limited in handling complex queries and context
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span className="text-muted-foreground">
                  Inaccessible to non-technical users
                </span>
              </li>
            </ul>
          </Card>

          {/* Solution */}
          <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5 hover:shadow-[var(--shadow-glow)] transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Our Solution</h3>
                <p className="text-muted-foreground">StatM8 provides:</p>
              </div>
            </div>
            <ul className="space-y-3 ml-14">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">
                  End-to-end automated data analysis pipeline
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">
                  Natural language interface for effortless interaction
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">
                  Domain-aware AI with contextual understanding
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">
                  Accessible to everyone, no coding required
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Problem;
