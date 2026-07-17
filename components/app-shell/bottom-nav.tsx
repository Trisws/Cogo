"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Wallet, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/home", label: "Trang chủ", icon: Home },
  { href: "/trips", label: "Chuyến đi", icon: Car },
  { href: "/wallet", label: "Ví & Tác động", icon: Wallet },
  { href: "/chat", label: "Tin nhắn", icon: MessageCircle },
  { href: "/profile", label: "Cá nhân", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between px-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
            >
              <Icon
                className={cn("size-5", active ? "text-primary" : "text-muted-foreground")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
