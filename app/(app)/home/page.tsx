"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Users, Car, Leaf, Wallet, Building2, ChevronRight, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RouteMap } from "@/components/map/route-map";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const me = useCurrentUser();
  const setRoleMode = useAppStore((s) => s.setRoleMode);
  const matches = useAppStore((s) => s.matches);
  const trips = useAppStore((s) => s.trips);
  const users = useAppStore((s) => s.users);
  const notifications = useAppStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  const upcoming = Object.values(matches)
    .filter((m) => (m.riderId === me.id || m.driverId === me.id) && ["confirmed", "ongoing"].includes(m.status))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const upcomingOfferTrip = upcoming ? trips[upcoming.offerTripId] : null;
  const counterpart = upcoming
    ? users[upcoming.driverId === me.id ? upcoming.riderId : upcoming.driverId]
    : null;

  function pickRole(mode: "rider" | "driver") {
    setRoleMode(mode);
    if (mode === "driver" && !me.vehicle) {
      router.push("/vehicle-setup");
      return;
    }
    router.push(`/trips/new?kind=${mode === "rider" ? "request" : "offer"}`);
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-52 w-full overflow-hidden">
        <RouteMap
          markers={[{ pos: { lat: 10.7769, lng: 106.7009 }, kind: "dot", color: "#1f8a53" }]}
          center={{ lat: 10.7769, lng: 106.7009 }}
          zoom={13}
          interactive={false}
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
          <Link href="/profile" className="flex items-center gap-2 rounded-full bg-background/90 py-1 pl-1 pr-3 shadow backdrop-blur">
            <Avatar className="size-8">
              <AvatarImage src={me.avatar} />
              <AvatarFallback>{me.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Chào, {me.name}</span>
          </Link>
          <Link href="/notifications" className="relative flex size-9 items-center justify-center rounded-full bg-background/90 shadow backdrop-blur">
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            )}
          </Link>
        </div>
      </div>

      <div className="-mt-8 space-y-5 rounded-t-3xl bg-background px-4 pb-6 pt-5">
        <Link
          href="/trips/new"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
        >
          <Search className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Bạn muốn đi đâu hôm nay?</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => pickRole("rider")}
            className="flex flex-col items-start gap-2.5 rounded-2xl bg-brand-green/10 p-4 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green text-white">
              <Users className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Tìm xe đi chung</p>
              <p className="text-[11px] text-muted-foreground">Tiết kiệm 30–40% chi phí</p>
            </div>
          </button>
          <button
            onClick={() => pickRole("driver")}
            className="flex flex-col items-start gap-2.5 rounded-2xl bg-brand-blue/10 p-4 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-blue text-white">
              <Car className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Cho đi chung xe</p>
              <p className="text-[11px] text-muted-foreground">Chia sẻ chi phí xăng xe</p>
            </div>
          </button>
        </div>

        {upcoming && upcomingOfferTrip && counterpart && (
          <Link
            href={`/trips/match/${upcoming.id}`}
            className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-semibold text-brand-green">
                {upcoming.status === "ongoing" ? "Đang di chuyển" : "Chuyến sắp tới"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {format(new Date(upcomingOfferTrip.departAt), "HH:mm, dd/MM")}
              </span>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Avatar className="size-10">
                <AvatarImage src={counterpart.avatar} />
                <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{counterpart.name}</p>
                <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  <MapPin className="size-3 shrink-0" /> {upcomingOfferTrip.route.destination.label}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        )}

        <div className="grid grid-cols-3 gap-2.5">
          <StatTile icon={Wallet} label="Đã tiết kiệm" value={`${(me.moneySaved / 1000).toFixed(0)}k`} href="/wallet" />
          <StatTile icon={Leaf} label="CO₂ giảm" value={`${me.co2SavedKg.toFixed(1)}kg`} href="/impact" />
          <StatTile icon={Users} label="Chuyến đi" value={`${me.tripsCount}`} href="/trips" />
        </div>

        <Link
          href="/enterprise"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-green p-4 text-white"
        >
          <Building2 className="size-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">CoGo Enterprise</p>
            <p className="text-[11px] opacity-90">Báo cáo ESG & tối ưu bãi đỗ xe cho doanh nghiệp</p>
          </div>
          <ChevronRight className="size-4 shrink-0" />
        </Link>

        {me.roleMode === "driver" && !me.vehicle && (
          <Badge variant="outline" className="w-full justify-center py-2 text-[11px]">
            Hãy thêm thông tin xe trong phần Cá nhân để đăng chuyến
          </Badge>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className={cn("flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3.5 text-center")}>
      <Icon className="size-4 text-brand-green" />
      <span className="text-sm font-bold leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </Link>
  );
}
