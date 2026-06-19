"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { initSync } from "@/lib/sync/syncEngine";

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    initSync();
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors closeButton />
    </NextThemesProvider>
  );
}
