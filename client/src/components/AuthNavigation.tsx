import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Home, FileText, User } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
const AuthNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/my-reports", label: "My Reports", icon: FileText },
    { path: "/my-profile", label: "My Profile", icon: User },
  ];
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center gap-3">
            <img src={logo} alt="StatM8 Logo" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              StatM8
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavigation;
