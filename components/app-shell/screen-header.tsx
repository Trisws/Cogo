"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
  transparent = false,
  className,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-2 px-4 pt-[env(safe-area-inset-top)]",
        transparent ? "bg-transparent" : "bg-background/95 backdrop-blur border-b border-border",
        className
      )}
    >
      <div className="flex h-14 w-full items-center gap-2">
        {back && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 size-9 shrink-0"
            onClick={() => router.back()}
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
