import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const actionCodeSettings = {
        url: "change with continue url",
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions.",
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.log(err);
      const code = err.code || err.message;
      toast({
        title: "Error",
        description: code,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="StatM8 Logo" className="h-16 w-16" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-center">
            {isSubmitted
              ? "We've sent a password reset link to your email"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" size="lg">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                A password reset link has been sent to{" "}
                <span className="font-semibold">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please check your inbox and spam folder
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => setIsSubmitted(false)}
            >
              Try Another Email
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Link
            to="/login"
            className="text-sm text-primary hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
