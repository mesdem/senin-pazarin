// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);

    // localStorage’da kayıt varsa onu yükle
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  if (!mounted) return null;

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-label="Tema değiştir"
    >
      {theme === "light" ? (
        // Güneş ikonu
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0-16a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 18a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM4.22 4.22a1 1 0 011.42 0L6.34 5a1 1 0 01-1.42 1.42L4.22 5.64a1 1 0 010-1.42zm12.02.78a1 1 0 011.42-1.42l1.12 1.12A1 1 0 0118.36 6.1l-1.12-1.1zM3 12a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm16 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM5.64 17.66A1 1 0 016.34 17l.78.76a1 1 0 11-1.42 1.42l-.78-.76a1 1 0 01.72-1.76zm12.72-1.18a1 1 0 011.42 1.42l-.78.76a1 1 0 01-1.42-1.42l.78-.76z" />
        </svg>
      ) : (
        // Ay ikonu
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 0012 17a7 7 0 009-4.21z" />
        </svg>
      )}
    </button>
  );
}
