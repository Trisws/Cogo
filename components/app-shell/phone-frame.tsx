"use client";

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-muted to-muted/60 flex items-center justify-center sm:py-8 px-0 sm:px-4">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground sm:h-[880px] sm:max-h-[94dvh] sm:w-[402px] sm:rounded-[2.75rem] sm:border-[8px] sm:border-neutral-900 sm:shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 hidden h-7 items-center justify-center sm:flex">
          <div className="h-5 w-28 rounded-full bg-neutral-900" />
        </div>
        <div className="flex h-full w-full flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
