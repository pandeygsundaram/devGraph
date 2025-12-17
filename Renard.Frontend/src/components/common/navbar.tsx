import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import logo from "@/assets/logo-Photoroom.png";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["Features", "How it Works", "Pricing", "Testimonials"];
  const nav = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            {/* Renard Logo */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold transform -rotate-3 hover:rotate-0 transition-transform">
              <img src={logo} />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Renard
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {link}
              </a>
            ))}

            <div className="h-4 w-[1px] bg-border mx-2"></div>

            <ModeToggle />
            <button
              className="text-foreground hover:text-primary font-medium text-sm"
              onClick={() => {
                nav("/login");
              }}
            >
              Log in
            </button>
            <Button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              onClick={() => {
                nav("/signup");
              }}
            >
              Get Started
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ModeToggle />
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary rounded-md"
                >
                  {link}
                </a>
              ))}
              <div className="flex flex-col gap-3">
                <button
                  className="text-foreground hover:text-primary font-medium text-sm"
                  onClick={() => {
                    nav("/login");
                  }}
                >
                  Log in
                </button>
                <Button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  onClick={() => {
                    nav("/signup");
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
