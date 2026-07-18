"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BadgeCheck, Clock, ShieldCheck, Star, Users } from "lucide-react";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { RouteMap } from "@/components/map/route-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { routeOverlapPercent } from "@/lib/geo";
import { cn } from "@/lib/utils";

const BRAND_COLORS = ["#1f8a53", "#2f7fd6", "#e0a52c", "#c2447a", "#7b5be0"];

export default function MatchResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const me = useCurrentUser();
  const trips = useAppStore((s) => s.trips);
  const users = useAppStore((s) => s.users);
  const createMatch = useAppStore((s) => s.createMatch);

  const myTrip = trips[id];
  const oppositeKind = myTrip?.kind === "offer" ? "request" : "offer";

  const candidates = useMemo(() => {
    if (!myTrip) return [];
    const myDepart = new Date(myTrip.departAt).getTime();
    return Object.values(trips)
      .filter(
        (t) =>
          t.id !== myTrip.id &&
          t.kind === oppositeKind &&
          t.status === "open" &&
          t.ownerId !== me.id &&
          Math.abs(new Date(t.departAt).getTime() - myDepart) < 60 * 60 * 1000
      )
      .map((t) => {
        const { overlapPercent, sharedDistanceKm } = routeOverlapPercent(
          myTrip.route.waypoints,
          t.route.waypoints
        );
        return { trip: t, overlapPercent, sharedDistanceKm, owner: users[t.ownerId] };
      })
      .filter((c) => c.overlapPercent >= 0.2 && c.owner)
      .sort((a, b) => b.overlapPercent - a.overlapPercent);
  }, [myTrip, oppositeKind, trips, users, me.id]);

  if (!myTrip) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="Kết quả ghép chuyến" />
        <p className="p-6 text-sm text-muted-foreground">Không tìm thấy chuyến đi.</p>
      </div>
    );
  }

  function confirm(candidateTripId: string, overlapPercent: number, sharedDistanceKm: number) {
    const offerTripId = myTrip.kind === "offer" ? myTrip.id : candidateTripId;
    const requestTripId = myTrip.kind === "request" ? myTrip.id : candidateTripId;
    const match = createMatch({
      offerTripId,
      requestTripId,
      overlapPercent,
      sharedDistanceKm,
    });
    router.push(`/trips/match/${match.id}`);
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Kết quả ghép chuyến"
        subtitle={`${myTrip.route.origin.label.split(",")[0]} → ${myTrip.route.destination.label.split(",")[0]}`}
      />

      <div className="relative h-40 w-full">
        <RouteMap
          routes={[{ waypoints: myTrip.route.waypoints, color: "#94a3b8", weight: 4 }]}
          markers={[
            { pos: myTrip.route.origin, kind: "dot", color: "#1f8a53" },
            { pos: myTrip.route.destination, kind: "pin", color: "#e11d48" },
          ]}
        />
      </div>

      <div className="space-y-3 px-4 py-4">
        <p className="text-xs text-muted-foreground">
          {candidates.length > 0
            ? `Tìm thấy ${candidates.length} chuyến phù hợp, xếp theo mức độ trùng lộ trình`
            : "Chưa có chuyến nào trùng lộ trình trong khung giờ này."}
        </p>

        {candidates.map(({ trip, overlapPercent, sharedDistanceKm, owner }, idx) => {
          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
          const driver = trip.kind === "offer" ? owner : me;
          return (
            <div key={trip.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="h-24 w-full">
                <RouteMap
                  routes={[
                    { waypoints: myTrip.route.waypoints, color: "#cbd5e1", weight: 4 },
                    { waypoints: trip.route.waypoints, color, weight: 4 },
                  ]}
                  interactive={false}
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-11">
                      <AvatarImage src={owner.avatar} />
                      <AvatarFallback>{owner.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="flex items-center gap-1 text-sm font-semibold">
                        {owner.name}
                        {owner.verified.cccd && <BadgeCheck className="size-3.5 text-brand-blue" />}
                      </p>
                      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3 fill-amber-400 text-amber-400" /> {owner.ratingAvg.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <ShieldCheck className="size-3" /> Tin cậy {owner.trustScore}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-brand-green">
                      {trip.pricePerSeat.toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-[10px] text-muted-foreground">/ ghế</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {format(new Date(trip.departAt), "HH:mm")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {trip.seats} chỗ
                  </span>
                  <span>{sharedDistanceKm.toFixed(1)} km trùng lộ trình</span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Độ trùng lộ trình</span>
                    <span className={cn("font-semibold")} style={{ color }}>
                      {Math.round(overlapPercent * 100)}%
                    </span>
                  </div>
                  <Progress value={overlapPercent * 100} className="h-1.5" />
                </div>

                {trip.genderPreference && trip.genderPreference !== "any" && (
                  <p className="mt-2 text-[11px] font-medium text-brand-blue">
                    {trip.genderPreference === "female-only" ? "Chỉ nhận khách nữ" : "Chỉ nhận khách nam"}
                  </p>
                )}
                {trip.notes && (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{trip.notes}</p>
                )}

                <Button
                  className="mt-3.5 h-10 w-full rounded-xl"
                  onClick={() => confirm(trip.id, overlapPercent, sharedDistanceKm)}
                >
                  Ghép chuyến với {driver === me ? "bạn" : owner.name.split(" ").pop()}
                </Button>
              </div>
            </div>
          );
        })}

        {candidates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Hãy thử nới rộng mức chấp nhận đi vòng hoặc đổi khung giờ khởi hành.
          </div>
        )}
      </div>
    </div>
  );
}
