"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Car, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/app-shell/screen-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { UploadTile } from "@/app/(auth)/verify/page";

export default function VehicleSetupPage() {
  const router = useRouter();
  const me = useCurrentUser();
  const registerVehicle = useAppStore((s) => s.registerVehicle);
  const setVerification = useAppStore((s) => s.setVerification);
  const setRoleMode = useAppStore((s) => s.setRoleMode);

  const [vehicle, setVehicle] = useState({
    type: me.vehicle?.type ?? ("motorbike" as "motorbike" | "car"),
    brand: me.vehicle?.brand ?? "",
    model: me.vehicle?.model ?? "",
    plate: me.vehicle?.plate ?? "",
    color: me.vehicle?.color ?? "",
    seats: String(me.vehicle?.seats ?? 3),
  });
  const [photosUploaded, setPhotosUploaded] = useState(0);
  const allPhotosDone = photosUploaded >= 3;

  function submit() {
    registerVehicle({
      type: vehicle.type,
      brand: vehicle.brand || (vehicle.type === "car" ? "Toyota" : "Honda"),
      model: vehicle.model || (vehicle.type === "car" ? "Vios" : "Wave"),
      plate: vehicle.plate || "59X1-999.99",
      color: vehicle.color || "Trắng",
      seats: vehicle.type === "car" ? Number(vehicle.seats || 4) : 1,
    });
    setVerification("license", true);
    setRoleMode("driver");
    toast.success("Đăng ký xe thành công! Bạn đã có thể đăng chuyến.");
    router.back();
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Đăng ký xe" subtitle="Bắt buộc để đăng chuyến cho người khác đi cùng" />

      <div className="space-y-5 px-4 pb-8 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVehicle((v) => ({ ...v, type: "motorbike" }))}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl border p-3",
              vehicle.type === "motorbike" ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Bike className="size-5" /> <span className="text-xs">Xe máy</span>
          </button>
          <button
            onClick={() => setVehicle((v) => ({ ...v, type: "car" }))}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl border p-3",
              vehicle.type === "car" ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <Car className="size-5" /> <span className="text-xs">Ô tô</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Hãng xe">
            <Input
              value={vehicle.brand}
              onChange={(e) => setVehicle((v) => ({ ...v, brand: e.target.value }))}
              placeholder={vehicle.type === "car" ? "Toyota" : "Honda"}
            />
          </Field>
          <Field label="Dòng xe">
            <Input
              value={vehicle.model}
              onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))}
              placeholder={vehicle.type === "car" ? "Vios" : "Wave"}
            />
          </Field>
          <Field label="Biển số">
            <Input value={vehicle.plate} onChange={(e) => setVehicle((v) => ({ ...v, plate: e.target.value }))} placeholder="59X1-999.99" />
          </Field>
          <Field label="Màu xe">
            <Input value={vehicle.color} onChange={(e) => setVehicle((v) => ({ ...v, color: e.target.value }))} placeholder="Trắng" />
          </Field>
          {vehicle.type === "car" && (
            <Field label="Số chỗ ngồi">
              <Input
                type="number"
                min={2}
                max={16}
                value={vehicle.seats}
                onChange={(e) => setVehicle((v) => ({ ...v, seats: e.target.value }))}
              />
            </Field>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Giấy tờ xác thực</p>
          <UploadTile
            label="Ảnh xe (biển số rõ nét)"
            processing={false}
            onUpload={() => setPhotosUploaded((n) => Math.max(n, 1))}
          />
          <UploadTile
            label="Ảnh cà vẹt xe (giấy đăng ký xe)"
            processing={false}
            onUpload={() => setPhotosUploaded((n) => Math.max(n, 2))}
          />
          <UploadTile
            label="Ảnh Giấy phép lái xe (GPLX)"
            processing={false}
            onUpload={() => setPhotosUploaded((n) => Math.max(n, 3))}
          />
        </div>

        <Button size="lg" className="h-12 w-full rounded-full text-base" disabled={!allPhotosDone} onClick={submit}>
          {allPhotosDone ? (
            <>
              <CheckCircle2 className="size-4" /> Hoàn tất đăng ký xe
            </>
          ) : (
            `Tải lên đủ ${3 - photosUploaded} ảnh còn thiếu`
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
