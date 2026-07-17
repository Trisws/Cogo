"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";

const DEMO_OTP = "123456";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [method, setMethod] = useState<"phone" | "student" | "company">("phone");
  const [phone, setPhone] = useState("0901 234 567");
  const [otp, setOtp] = useState("");
  const setPendingPhone = useAppStore((s) => s.setPendingPhone);
  const goToStep = useAppStore((s) => s.goToStep);

  function requestOtp() {
    setPendingPhone(phone);
    setStep("otp");
    toast.success(`Mã OTP demo đã gửi: ${DEMO_OTP}`, { duration: 4000 });
  }

  function verifyOtp() {
    if (otp !== DEMO_OTP) {
      toast.error("Mã OTP không đúng. Dùng mã demo 123456.");
      return;
    }
    goToStep("ekyc");
    router.push("/verify");
  }

  return (
    <div className="flex h-full flex-col justify-between bg-gradient-to-b from-brand-green to-brand-green-dark px-6 pb-10 pt-16 text-primary-foreground">
      <div>
        <div className="mb-10 flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-black">Co</div>
          <div>
            <p className="text-lg font-bold leading-none">CoGo</p>
            <p className="text-[11px] opacity-80">Share road · Share future</p>
          </div>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {step === "phone" ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl bg-background p-5 text-foreground shadow-xl"
            >
              <h2 className="text-lg font-bold">Đăng nhập / Đăng ký</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Xác thực nhanh để bắt đầu ghép chuyến an toàn.
              </p>

              <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="phone">
                    <Phone className="size-3.5" /> SĐT
                  </TabsTrigger>
                  <TabsTrigger value="student">
                    <GraduationCap className="size-3.5" /> Sinh viên
                  </TabsTrigger>
                  <TabsTrigger value="company">
                    <Building2 className="size-3.5" /> Công ty
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="id-input">
                  {method === "phone" ? "Số điện thoại" : method === "student" ? "Email trường/mã số sinh viên" : "Email công ty"}
                </Label>
                <Input
                  id="id-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={method === "phone" ? "090 xxx xxxx" : "ban@vidu.edu.vn"}
                />
              </div>

              <Button size="lg" className="mt-5 h-11 w-full rounded-xl" onClick={requestOtp}>
                Gửi mã xác thực
              </Button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Bằng việc tiếp tục, bạn đồng ý với Điều khoản & Chính sách bảo mật của CoGo.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl bg-background p-5 text-foreground shadow-xl"
            >
              <h2 className="text-lg font-bold">Nhập mã OTP</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Mã 6 số đã gửi tới <span className="font-medium text-foreground">{phone}</span> (demo: 123456)
              </p>
              <Input
                className="mt-4 h-12 text-center text-xl tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
              />
              <Button size="lg" className="mt-5 h-11 w-full rounded-xl" onClick={verifyOtp}>
                Xác nhận
              </Button>
              <button className="mt-3 w-full text-center text-xs text-muted-foreground" onClick={() => setStep("phone")}>
                Đổi số điện thoại
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-[11px] opacity-75">INNOSTAR 2026 · Bản demo giao diện sản phẩm</p>
    </div>
  );
}
