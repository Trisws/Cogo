"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Car, ChevronRight, MapPin, Users } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  confirmed: { label: "Đã xác nhận", tone: "bg-brand-blue/10 text-brand-blue" },
  ongoing: { label: "Đang di chuyển", tone: "bg-brand-green/10 text-brand-green" },
  completed: { label: "Hoàn tất", tone: "bg-muted text-muted-foreground" },
  cancelled: { label: "Đã huỷ", tone: "bg-destructive/10 text-destructive" },
};

export default function TripsPage() {
  const me = useCurrentUser();
  const matches = useAppStore((s) => s.matches);
  const trips = useAppStore((s) => s.trips);
  const users = useAppStore((s) => s.users);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  const mine = useMemo(
    () =>
      Object.values(matches)
        .filter((m) => m.riderId === me.id || m.driverId === me.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [matches, me.id]
  );

  const list = mine.filter((m) =>
    tab === "upcoming" ? ["confirmed", "ongoing"].includes(m.status) : ["completed", "cancelled"].includes(m.status)
  );

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Chuyến đi của bạn" back={false} />
      <div className="px-4 pt-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3 px-4 py-4">
        {list.map((m) => {
          const offerTrip = trips[m.offerTripId];
          const counterpart = users[me.id === m.driverId ? m.riderId : m.driverId];
          const status = STATUS_LABEL[m.status];
          return (
            <Link
              key={m.id}
              href={`/trips/match/${m.id}`}
              className="block rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Badge className={cn("border-0 font-normal", status.tone)}>{status.label}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  {format(new Date(offerTrip.departAt), "HH:mm, dd/MM/yyyy")}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={counterpart.avatar} />
                  <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{counterpart.name}</p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="size-3 shrink-0" /> {offerTrip.route.destination.label}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}

        {list.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
            {tab === "upcoming" ? <Car className="size-8 text-muted-foreground" /> : <Users className="size-8 text-muted-foreground" />}
            <p className="text-sm text-muted-foreground">
              {tab === "upcoming" ? "Bạn chưa có chuyến đi nào sắp tới." : "Chưa có lịch sử chuyến đi."}
            </p>
            {tab === "upcoming" && (
              <Link href="/trips/new" className="text-sm font-medium text-brand-green">
                Tìm chuyến ngay →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
