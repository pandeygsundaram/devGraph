import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // 1. Determine what the user is actually seeing right now
  const resolvedTheme = (() => {
    if (theme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      // Default to light during SSR or if window is undefined
      return "light";
    }
    return theme;
  })();

  // 2. Simple Toggle Logic: If it looks dark, make it light. Otherwise, make it dark.
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const sunVisible = resolvedTheme === "light";
  const moonVisible = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full w-9 h-9"
    >
      {/* Sun Icon */}
      <Sun
        className={
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 " +
          (sunVisible
            ? "rotate-0 scale-100 opacity-100 text-yellow-500" // Visible
            : "-rotate-90 scale-0 opacity-0") // Hidden
        }
      />

      {/* Moon Icon */}
      <Moon
        className={
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 " +
          (moonVisible
            ? "rotate-0 scale-100 opacity-100 text-primary" // Visible
            : "rotate-90 scale-0 opacity-0") // Hidden
        }
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
