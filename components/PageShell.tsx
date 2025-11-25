// components/PageShell.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  title?: string;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  headerRight,
  children,
  className,
}: PageShellProps) {
  return (
    <div className="py-4 sm:py-6">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && (
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {description}
            </p>
          )}
        </div>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>

      <div
        className={cn(
          "rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
