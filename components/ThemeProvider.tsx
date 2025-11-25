// components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // 🔹 BURASI ARTIK "light"
      enableSystem={false} // Sisteme göre değil, kendi seçtiğimiz temaya göre
    >
      {children}
    </NextThemesProvider>
  );
}
