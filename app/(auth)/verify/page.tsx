"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IdCard,
  ScanFace,
  CheckCircle2,
  Car,
  Bike,
  UserCheck,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type Step = "cccd" | "selfie" | "role" | "vehicle" | "done";
const ORDER: Step[] = ["cccd", "selfie", "role", "vehicle", "done"];

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cccd");
  const [processing, setProcessing] = useState(false);
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [vehicle, setVehicle] = useState({ type: "motorbike" as "motorbike" | "car", brand: "", model: "", plate: "", color: "", seats: "3" });

  const setVerification = useAppStore((s) => s.setVerification);
  const setRoleMode = useAppStore((s) => s.setRoleMode);
  const registerVehicle = useAppStore((s) => s.registerVehicle);
  const goToStep = useAppStore((s) => s.goToStep);

  const progress = ((ORDER.indexOf(step) + 1) / ORDER.length) * 100;

  function simulateProcess(next: Step, verifyKey?: "cccd" | "license") {
    setProcessing(true);
    setTimeout(() => {
      if (verifyKey) setVerification(verifyKey, true);
      setProcessing(false);
      setStep(next);
    }, 1200);
  }

  function finish() {
    setRoleMode(role);
    if (role === "driver") {
      registerVehicle({
        type: vehicle.type,
        brand: vehicle.brand || (vehicle.type === "car" ? "Toyota" : "Honda"),
        model: vehicle.model || (vehicle.type === "car" ? "Vios" : "Wave"),
        plate: vehicle.plate || "59X1-999.99",
        color: vehicle.color || "Trắng",
        seats: vehicle.type === "car" ? Number(vehicle.seats || 4) : 1,
      });
    }
    goToStep("done");
    router.replace("/home");
  }

  return (
    <div className="flex h-full flex-col bg-background px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground">Xác thực danh tính</p>
        <Progress value={progress} className="mt-2 h-1.5" />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex flex-1 flex-col"
        >
          {step === "cccd" && (
            <StepShell
              icon={IdCard}
              title="Xác thực CCCD"
              body="Tải ảnh mặt trước CCCD để hệ thống trích xuất thông tin (OCR mô phỏng cho bản demo)."
            >
              <UploadTile label="Ảnh mặt trước CCCD" processing={processing} onUpload={() => simulateProcess("selfie", "cccd")} />
            </StepShell>
          )}

          {step === "selfie" && (
            <StepShell icon={ScanFace} title="Xác thực khuôn mặt" body="Chụp một ảnh selfie để đối chiếu với giấy tờ (liveness check mô phỏng).">
              <UploadTile label="Chụp ảnh selfie" processing={processing} onUpload={() => simulateProcess("role")} />
            </StepShell>
          )}

          {step === "role" && (
            <StepShell icon={UserCheck} title="Bạn muốn dùng CoGo như thế nào?" body="Bạn có thể đổi vai trò bất cứ lúc nào trong phần Cá nhân.">
              <div className="flex flex-col gap-3">
                <RoleCard
                  active={role === "rider"}
                  title="Tìm xe đi chung"
                  desc="Đăng nhu cầu di chuyển, ghép chuyến với tài xế cùng lộ trình."
                  onClick={() => setRole("rider")}
                />
                <RoleCard
                  active={role === "driver"}
                  title="Cho đi chung xe"
                  desc="Đăng chuyến đi sẵn có, chia sẻ chi phí xăng xe với người đi cùng."
                  onClick={() => setRole("driver")}
                />
              </div>
              <Button size="lg" className="mt-6 h-11 w-full rounded-xl" onClick={() => setStep(role === "driver" ? "vehicle" : "done")}>
                Tiếp tục
              </Button>
            </StepShell>
          )}

          {step === "vehicle" && (
            <StepShell icon={role === "driver" && vehicle.type === "car" ? Car : Bike} title="Thông tin phương tiện" body="Thông tin này giúp người đi chung nhận diện xe của bạn.">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVehicle((v) => ({ ...v, type: "motorbike" }))}
                  className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-3", vehicle.type === "motorbike" ? "border-primary bg-primary/5" : "border-border")}
                >
                  <Bike className="size-5" /> <span className="text-xs">Xe máy</span>
                </button>
                <button
                  onClick={() => setVehicle((v) => ({ ...v, type: "car" }))}
                  className={cn("flex flex-col items-center gap-1.5 rounded-2xl border p-3", vehicle.type === "car" ? "border-primary bg-primary/5" : "border-border")}
                >
                  <Car className="size-5" /> <span className="text-xs">Ô tô</span>
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Hãng xe">
                  <Input value={vehicle.brand} onChange={(e) => setVehicle((v) => ({ ...v, brand: e.target.value }))} placeholder={vehicle.type === "car" ? "Toyota" : "Honda"} />
                </Field>
                <Field label="Dòng xe">
                  <Input value={vehicle.model} onChange={(e) => setVehicle((v) => ({ ...v, model: e.target.value }))} placeholder={vehicle.type === "car" ? "Vios" : "Wave"} />
                </Field>
                <Field label="Biển số">
                  <Input value={vehicle.plate} onChange={(e) => setVehicle((v) => ({ ...v, plate: e.target.value }))} placeholder="59X1-999.99" />
                </Field>
                <Field label="Màu xe">
                  <Input value={vehicle.color} onChange={(e) => setVehicle((v) => ({ ...v, color: e.target.value }))} placeholder="Trắng" />
                </Field>
              </div>
              <UploadTile label="Ảnh Giấy phép lái xe (GPLX)" processing={processing} onUpload={() => simulateProcess("done", "license")} className="mt-4" />
            </StepShell>
          )}

          {step === "done" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-brand-green/12 text-brand-green">
                <CheckCircle2 className="size-11" />
              </div>
              <h2 className="text-xl font-bold">Xác minh thành công!</h2>
              <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">
                Tài khoản của bạn đã sẵn sàng. Hãy bắt đầu tìm chuyến đi chung đầu tiên nhé.
              </p>
              <Button size="lg" className="mt-8 h-11 w-full max-w-xs rounded-xl" onClick={finish}>
                Vào CoGo
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepShell({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-brand-green/12 text-brand-green">
        <Icon className="size-6" />
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

function UploadTile({
  label,
  processing,
  onUpload,
  className,
}: {
  label: string;
  processing: boolean;
  onUpload: () => void;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      disabled={processing || done}
      onClick={() => {
        setDone(true);
        onUpload();
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 py-10 text-sm text-muted-foreground transition hover:bg-muted/60",
        className
      )}
    >
      {processing ? (
        <>
          <Loader2 className="size-6 animate-spin text-primary" />
          Đang xác minh...
        </>
      ) : done ? (
        <>
          <CheckCircle2 className="size-6 text-brand-green" />
          Đã tải lên
        </>
      ) : (
        <>
          <Upload className="size-6" />
          {label}
        </>
      )}
    </button>
  );
}

function RoleCard({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
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
