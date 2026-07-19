"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IdCard, ScanFace, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type Step = "cccd" | "selfie" | "done";
const ORDER: Step[] = ["cccd", "selfie", "done"];

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cccd");
  const [processing, setProcessing] = useState(false);

  const setVerification = useAppStore((s) => s.setVerification);
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
              <UploadTile label="Chụp ảnh selfie" processing={processing} onUpload={() => simulateProcess("done")} />
            </StepShell>
          )}

          {step === "done" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-brand-green/12 text-brand-green">
                <CheckCircle2 className="size-11" />
              </div>
              <h2 className="text-xl font-bold">Xác minh thành công!</h2>
              <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">
                Tài khoản của bạn đã sẵn sàng. Bạn có thể chọn "Tìm xe đi chung" hoặc "Cho đi chung xe" ngay ở trang chủ.
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

export function UploadTile({
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
