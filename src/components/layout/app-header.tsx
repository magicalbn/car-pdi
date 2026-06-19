"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SyncBadge } from "@/components/layout/sync-badge";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  backHref,
  showBack,
  right,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "safe-top sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-2 px-3">
        {(showBack || backHref) &&
          (backHref ? (
            <Button asChild variant="ghost" size="icon-sm" aria-label="Back">
              <Link href={backHref}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ))}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {right}
          <SyncBadge />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
