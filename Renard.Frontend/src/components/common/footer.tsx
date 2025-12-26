import { Github, Twitter } from "lucide-react";
import logo from "@/assets/logo-Photoroom.png";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const nav = useNavigate();

  // Helper to scroll to hash on home page or navigate there
  const handleScroll = (id: string) => {
    // If we are not on home, go there first
    if (window.location.pathname !== "/") {
      nav(`/${id}`);
    } else {
      // If on home, smooth scroll
      const element = document.querySelector(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded flex items-center justify-center text-primary-foreground text-xs font-bold overflow-hidden">
                <img
                  src={logo}
                  alt="Renard Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-foreground">Renard</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cunningly smart productivity
              <br /> management for engineering teams.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => handleScroll("#features")}
                >
                  Features
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => handleScroll("#how-it-works")}
                >
                  Integrations
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => handleScroll("#pricing")}
                >
                  Pricing
                </Button>
              </li>
            </ul>
          </div>

          {/* Company Links (Placeholders) */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => nav("/about")}
                >
                  About
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => nav("/blogs")}
                >
                  Blog
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => nav("/feedback")}
                >
                  Feedback
                </Button>
              </li>
            </ul>
          </div>

          {/* Legal Links (Functional) */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => nav("/privacy")}
                >
                  Privacy
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-normal"
                  onClick={() => nav("/terms")}
                >
                  Terms
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Renard. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <Github className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
