"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div className="w-5" />;
  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <div className="flex items-center justify-end gap-2">
        {theme === "dark" ? "Light" : "Dark"}
        {theme === "dark" ? (
          <Sun className="text-gray-50 h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </div>
    </button>
  );
}
