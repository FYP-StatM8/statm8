import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="StatM8 Logo" className="h-8 w-8" />
            <span className="text-lg font-bold">StatM8</span>
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-sm text-secondary-foreground/70">
              © 2024 StatM8. AI that understands your data.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
