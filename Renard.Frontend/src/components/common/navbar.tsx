import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import logo from "@/assets/logo-Photoroom.png";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const nav = useNavigate();

  const links = ["About", "Features", "How it Works", "Pricing"];

  const getHash = (link: string) => `#${link.toLowerCase().replace(/ /g, "-")}`;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => nav("/")}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
              <img src={logo} alt="Renard" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Renard
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) =>
              link === "About" ? (
                <button
                  key={link}
                  onClick={() => nav("/about")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  {link}
                </button>
              ) : (
                <a
                  key={link}
                  href={getHash(link)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  {link}
                </a>
              )
            )}

            <div className="h-4 w-[1px] bg-border mx-2" />

            <ModeToggle />

            <button
              className="text-foreground hover:text-primary font-medium text-sm"
              onClick={() => nav("/login")}
            >
              Log in
            </button>

            <Button
              className="bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg shadow-primary/20"
              onClick={() => nav("/signup")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" onClick={() => setIsOpen((p) => !p)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {links.map((link) =>
                link === "About" ? (
                  <button
                    key={link}
                    onClick={() => {
                      nav("/about");
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-foreground hover:bg-secondary rounded-md"
                  >
                    {link}
                  </button>
                ) : (
                  <a
                    key={link}
                    href={getHash(link)}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary rounded-md"
                  >
                    {link}
                  </a>
                )
              )}

              <div className="flex flex-col gap-3 mt-4">
                <button
                  className="text-foreground hover:text-primary font-medium text-sm"
                  onClick={() => {
                    nav("/login");
                    setIsOpen(false);
                  }}
                >
                  Log in
                </button>

                <Button
                  className="bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg shadow-primary/20"
                  onClick={() => {
                    nav("/signup");
                    setIsOpen(false);
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
