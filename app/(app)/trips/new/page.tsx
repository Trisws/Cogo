"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MapPin, Navigation, Minus, Plus, Repeat } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { LocationPicker } from "@/components/map/location-picker";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { fetchRoute, haversineKm } from "@/lib/geo";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { GeocodeResult } from "@/lib/geo";
import type { Trip } from "@/lib/types";

const RECURRING_OPTIONS: { value: Trip["recurring"]; label: string }[] = [
  { value: "once", label: "Một lần" },
  { value: "weekdays", label: "Thứ 2 – 6" },
  { value: "daily", label: "Hàng ngày" },
];

function NewTripForm() {
  const router = useRouter();
  const params = useSearchParams();
  const kind: Trip["kind"] = params.get("kind") === "offer" ? "offer" : "request";
  const me = useCurrentUser();
  const addTrip = useAppStore((s) => s.addTrip);

  const [origin, setOrigin] = useState<GeocodeResult | null>(null);
  const [destination, setDestination] = useState<GeocodeResult | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [time, setTime] = useState("07:30");
  const [recurring, setRecurring] = useState<Trip["recurring"]>("weekdays");
  const [seats, setSeats] = useState(1);
  const [detour, setDetour] = useState([20]);
  const [loading, setLoading] = useState(false);

  const distanceKm = useMemo(() => {
    if (!origin || !destination) return 0;
    return haversineKm({ lat: origin.lat, lng: origin.lng }, { lat: destination.lat, lng: destination.lng }) * 1.25;
  }, [origin, destination]);

  const suggestedPrice = Math.round((distanceKm * 3000) / 1000) * 1000;

  async function submit() {
    if (!origin || !destination) {
      toast.error("Vui lòng chọn điểm đi và điểm đến.");
      return;
    }
    if (kind === "offer" && !me.vehicle) {
      toast.error("Bạn cần đăng ký thông tin xe trong phần Cá nhân trước.");
      return;
    }
    setLoading(true);
    const waypoints = await fetchRoute(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng }
    );
    const [h, m] = time.split(":").map(Number);
    const departDate = new Date();
    departDate.setDate(departDate.getDate() + dayOffset);
    departDate.setHours(h, m, 0, 0);
    if (departDate.getTime() < Date.now()) {
      departDate.setDate(departDate.getDate() + 1);
    }

    const trip = addTrip({
      kind,
      route: {
        origin: { lat: origin.lat, lng: origin.lng, label: origin.label },
        destination: { lat: destination.lat, lng: destination.lng, label: destination.label },
        waypoints,
        distanceKm: Math.round(distanceKm * 10) / 10,
      },
      departAt: departDate.toISOString(),
      recurring,
      seats,
      pricePerSeat: suggestedPrice || 20000,
      detourTolerance: detour[0] / 100,
    });
    setLoading(false);
    router.push(`/trips/${trip.id}/match`);
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title={kind === "offer" ? "Đăng chuyến đi" : "Tìm xe đi chung"} />

      <div className="space-y-5 px-4 pb-8 pt-3">
        <div className="space-y-2">
          <LocationPicker
            placeholder="Điểm đón"
            value={origin}
            onSelect={setOrigin}
            icon={<div className="size-2.5 shrink-0 rounded-full bg-brand-green" />}
          />
          <LocationPicker
            placeholder="Điểm đến"
            value={destination}
            onSelect={setDestination}
            icon={<MapPin className="size-4 shrink-0 text-destructive" />}
          />
          {distanceKm > 0 && (
            <p className="flex items-center gap-1 pl-1 text-xs text-muted-foreground">
              <Navigation className="size-3" /> Khoảng {distanceKm.toFixed(1)} km
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Thời gian khởi hành</p>
          <div className="flex gap-2">
            <SegButton active={dayOffset === 0} onClick={() => setDayOffset(0)}>
              Hôm nay
            </SegButton>
            <SegButton active={dayOffset === 1} onClick={() => setDayOffset(1)}>
              Ngày mai
            </SegButton>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Repeat className="size-3.5" /> Lặp lại
          </p>
          <div className="flex gap-2">
            {RECURRING_OPTIONS.map((o) => (
              <SegButton key={o.value} active={recurring === o.value} onClick={() => setRecurring(o.value)}>
                {o.label}
              </SegButton>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-border p-4">
          <div>
            <p className="text-sm font-medium">{kind === "offer" ? "Số ghế trống" : "Số chỗ cần"}</p>
            <p className="text-xs text-muted-foreground">Tối đa {kind === "offer" ? me.vehicle?.seats ?? 4 : 4} chỗ</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex size-8 items-center justify-center rounded-full border border-border"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-4 text-center text-sm font-semibold">{seats}</span>
            <button
              className="flex size-8 items-center justify-center rounded-full border border-border"
              onClick={() => setSeats((s) => Math.min(kind === "offer" ? me.vehicle?.seats ?? 4 : 4, s + 1))}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Mức chấp nhận đi vòng</p>
            <span className="text-sm font-semibold text-brand-green">{detour[0]}%</span>
          </div>
          <Slider
            value={detour}
            onValueChange={(v) => setDetour(Array.isArray(v) ? v : [v])}
            max={50}
            step={5}
          />
          <p className="text-[11px] text-muted-foreground">
            Hệ thống sẽ ưu tiên ghép những chuyến có lộ trình trùng khớp cao trong giới hạn này.
          </p>
        </div>

        {distanceKm > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-brand-green/10 p-4">
            <div>
              <p className="text-sm font-medium">{kind === "offer" ? "Giá đề xuất mỗi ghế" : "Chi phí ước tính"}</p>
              <p className="text-[11px] text-muted-foreground">Rẻ hơn ~35% so với gọi xe công nghệ</p>
            </div>
            <span className="text-lg font-bold text-brand-green">{suggestedPrice.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        <Button size="lg" className="h-12 w-full rounded-full text-base" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Đang tìm lộ trình...
            </>
          ) : (
            "Tìm chuyến ghép phù hợp"
          )}
        </Button>
      </div>
    </div>
  );
}

function SegButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 flex-1 rounded-xl border text-xs font-medium transition",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function NewTripPage() {
  return (
    <Suspense>
      <NewTripForm />
    </Suspense>
  );
}
