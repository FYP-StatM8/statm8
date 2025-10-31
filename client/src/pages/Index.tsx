import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/authContext";
import AuthNavigation from "@/components/AuthNavigation";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen">
      {loading ? <Skeleton className=" w-full" /> : user ? <AuthNavigation /> : <Navigation />
      }
      <main>
        <Hero />
        <Problem />
        <Features />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
