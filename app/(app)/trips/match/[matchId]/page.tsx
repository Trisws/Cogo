"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BadgeCheck,
  Car,
  Clock,
  MessageCircle,
  ShieldCheck,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { RouteMap } from "@/components/map/route-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppStore, useCurrentUser } from "@/lib/store";

const STATUS_LABEL: Record<string, string> = {
  suggested: "Gợi ý",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  ongoing: "Đang di chuyển",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

export default function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const me = useCurrentUser();
  const match = useAppStore((s) => s.matches[matchId]);
  const trips = useAppStore((s) => s.trips);
  const users = useAppStore((s) => s.users);
  const startTrip = useAppStore((s) => s.startTrip);
  const cancelMatch = useAppStore((s) => s.cancelMatch);

  if (!match) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Chi tiết chuyến" />
        <p className="p-6 text-sm text-muted-foreground">Không tìm thấy chuyến ghép.</p>
      </div>
    );
  }

  const offerTrip = trips[match.offerTripId];
  const isDriver = me.id === match.driverId;
  const counterpart = users[isDriver ? match.riderId : match.driverId];
  const driver = users[match.driverId];
  const fee = Math.round(match.totalPrice * 0.08);

  function onStart() {
    startTrip(matchId);
    router.push(`/trips/match/${matchId}/track`);
  }

  function onCancel() {
    cancelMatch(matchId);
    toast.success("Đã huỷ chuyến và hoàn tiền vào ví.");
    router.push("/home");
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Chi tiết chuyến đi" right={<Badge variant="secondary">{STATUS_LABEL[match.status]}</Badge>} />

      <div className="h-44 w-full">
        <RouteMap
          routes={[{ waypoints: offerTrip.route.waypoints, color: "#1f8a53", weight: 5 }]}
          markers={[
            { pos: offerTrip.route.origin, kind: "dot", color: "#1f8a53" },
            { pos: offerTrip.route.destination, kind: "pin", color: "#e11d48" },
          ]}
        />
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
          <Avatar className="size-12">
            <AvatarImage src={counterpart.avatar} />
            <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-semibold">
              {counterpart.name}
              {counterpart.verified.cccd && <BadgeCheck className="size-3.5 text-brand-blue" />}
            </p>
            <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-amber-400 text-amber-400" /> {counterpart.ratingAvg.toFixed(1)}
              </span>
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="size-3" /> Tin cậy {counterpart.trustScore}
              </span>
              {isDriver ? " · Hành khách" : " · Tài xế"}
            </p>
          </div>
          <Button size="icon" variant="outline" className="size-9 rounded-full" onClick={() => router.push(`/chat/${matchId}`)}>
            <MessageCircle className="size-4" />
          </Button>
        </div>

        {driver.vehicle && (
          <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3.5">
            <Car className="size-5 text-brand-blue" />
            <div className="text-xs">
              <p className="font-medium">
                {driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.color}
              </p>
              <p className="text-muted-foreground">Biển số {driver.vehicle.plate}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-border p-3.5">
          <Row label="Điểm đón" value={offerTrip.route.origin.label} />
          <Row label="Điểm đến" value={offerTrip.route.destination.label} />
          <Row label="Khởi hành" value={format(new Date(offerTrip.departAt), "HH:mm, dd/MM/yyyy")} icon={Clock} />
          <Row label="Độ trùng lộ trình" value={`${Math.round(match.overlapPercent * 100)}% (${match.sharedDistanceKm.toFixed(1)} km)`} />
        </div>

        <div className="space-y-2 rounded-2xl border border-border p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Wallet className="size-3.5" /> Chia sẻ chi phí (tạm giữ)
          </p>
          <Row label="Tổng chi phí chuyến" value={`${match.totalPrice.toLocaleString("vi-VN")}đ`} />
          <Row label="Phí nền tảng CoGo (8%)" value={`-${fee.toLocaleString("vi-VN")}đ`} muted />
          <Separator />
          <Row label="Tài xế nhận được" value={`${(match.totalPrice - fee).toLocaleString("vi-VN")}đ`} strong />
        </div>

        <div className="flex flex-col gap-2.5 pb-4">
          {match.status === "confirmed" && (
            <>
              <Button className="h-12 w-full rounded-full text-base" onClick={onStart}>
                Bắt đầu chuyến đi
              </Button>
              <Button variant="ghost" className="h-10 w-full text-destructive" onClick={onCancel}>
                <XCircle className="size-4" /> Huỷ chuyến
              </Button>
            </>
          )}
          {match.status === "ongoing" && (
            <Button className="h-12 w-full rounded-full text-base" onClick={() => router.push(`/trips/match/${matchId}/track`)}>
              Xem theo dõi hành trình
            </Button>
          )}
          {match.status === "completed" && (
            <Button className="h-12 w-full rounded-full text-base" onClick={() => router.push(`/trips/match/${matchId}/rate`)}>
              Đánh giá chuyến đi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
  icon: Icon,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1 text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <span className={strong ? "text-sm font-bold text-brand-green" : muted ? "text-muted-foreground" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
