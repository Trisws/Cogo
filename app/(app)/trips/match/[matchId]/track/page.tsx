"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, MessageCircle, Navigation2, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { RouteMap } from "@/components/map/route-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore, useCurrentUser } from "@/lib/store";

export default function TrackTripPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const me = useCurrentUser();
  const match = useAppStore((s) => s.matches[matchId]);
  const trips = useAppStore((s) => s.trips);
  const users = useAppStore((s) => s.users);
  const advanceTrip = useAppStore((s) => s.advanceTrip);
  const completeTrip = useAppStore((s) => s.completeTrip);
  const [sosOpen, setSosOpen] = useState(false);

  useEffect(() => {
    if (!match || match.status !== "ongoing") return;
    const progress = match.progress ?? 0;
    if (progress >= 1) return;
    const t = setInterval(() => {
      const current = useAppStore.getState().matches[matchId];
      if (!current || current.status !== "ongoing") return;
      const next = Math.min(1, (current.progress ?? 0) + 0.04);
      advanceTrip(matchId, next);
    }, 700);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, match?.status]);

  if (!match) return null;

  const offerTrip = trips[match.offerTripId];
  const counterpart = users[me.id === match.driverId ? match.riderId : match.driverId];
  const progress = match.progress ?? 0;
  const arrived = progress >= 1;

  function finish() {
    completeTrip(matchId);
    router.push(`/trips/match/${matchId}/rate`);
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative flex-1">
        <RouteMap
          routes={[{ waypoints: offerTrip.route.waypoints, color: "#1f8a53", weight: 5 }]}
          markers={[
            { pos: offerTrip.route.origin, kind: "dot", color: "#94a3b8" },
            { pos: offerTrip.route.destination, kind: "pin", color: "#e11d48" },
            ...(match.liveDriverPos ? [{ pos: match.liveDriverPos, kind: "avatar" as const, avatarUrl: users[match.driverId].avatar, color: "#1f8a53" }] : []),
          ]}
          fitToContent={false}
          center={match.liveDriverPos ?? offerTrip.route.origin}
          zoom={14}
        />
        <div className="absolute inset-x-0 top-0 pt-[calc(env(safe-area-inset-top)+0.5rem)] px-4">
          <ScreenHeader title="Đang di chuyển" transparent className="rounded-2xl bg-background/90 shadow backdrop-blur px-0" />
        </div>

        <button
          onClick={() => setSosOpen(true)}
          className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg"
        >
          <AlertTriangle className="size-5" />
        </button>
      </div>

      <div className="space-y-3 rounded-t-3xl border-t border-border bg-background p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={counterpart.avatar} />
            <AvatarFallback>{counterpart.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{counterpart.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Navigation2 className="size-3" />
              {arrived ? "Đã đến điểm hẹn" : `Còn khoảng ${match.etaMinutes ?? "--"} phút`}
            </p>
          </div>
          <Button size="icon" variant="outline" className="size-9 rounded-full" onClick={() => router.push(`/chat/${matchId}`)}>
            <MessageCircle className="size-4" />
          </Button>
          <Button size="icon" variant="outline" className="size-9 rounded-full" onClick={() => toast.info("Đang gọi điện (mô phỏng)...")}>
            <PhoneCall className="size-4" />
          </Button>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand-green transition-all duration-700" style={{ width: `${progress * 100}%` }} />
        </div>

        <Button className="h-11 w-full rounded-full" disabled={!arrived} onClick={finish}>
          <CheckCircle2 className="size-4" /> {arrived ? "Hoàn tất chuyến đi" : "Đang di chuyển..."}
        </Button>
      </div>

      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Trung tâm an toàn CoGo
            </DialogTitle>
            <DialogDescription>
              Nhấn xác nhận để chia sẻ vị trí thời gian thực và thông tin chuyến đi tới liên hệ khẩn cấp và tổng đài
              hỗ trợ CoGo (mô phỏng cho bản demo).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSosOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSosOpen(false);
                toast.success("Đã gửi tín hiệu SOS tới trung tâm an toàn CoGo.");
              }}
            >
              Gửi tín hiệu SOS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
