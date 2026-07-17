"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, CreditCard, Car, Star, Sparkles } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  match: Car,
  trip: Sparkles,
  payment: CreditCard,
  rating: Star,
  system: Bell,
};

export default function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Thông báo"
        right={
          notifications.some((n) => !n.read) ? (
            <button className="text-xs text-brand-green" onClick={markAllRead}>
              Đã đọc tất cả
            </button>
          ) : null
        }
      />
      <div className="divide-y divide-border">
        {notifications.map((n) => {
          const Icon = ICONS[n.kind] ?? Bell;
          const content = (
            <div
              onClick={() => markNotificationRead(n.id)}
              className={cn("flex items-start gap-3 px-4 py-3.5", !n.read && "bg-brand-green/5")}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-brand-green" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { locale: vi, addSuffix: true })}
                </p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-green" />}
            </div>
          );
          return n.link ? (
            <Link key={n.id} href={n.link}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Bell className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Chưa có thông báo nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
