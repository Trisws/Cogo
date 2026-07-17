import type { ReactNode } from "react";
import { BottomNav } from "@/components/app-shell/bottom-nav";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
