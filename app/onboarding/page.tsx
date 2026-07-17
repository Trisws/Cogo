"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Leaf, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const SLIDES = [
  {
    icon: Users,
    title: "Đi chung, tiết kiệm hơn",
    body: "Ghép chuyến với người cùng lộ trình, cùng khung giờ — tiết kiệm 30–40% chi phí di chuyển mỗi ngày.",
  },
  {
    icon: Leaf,
    title: "Không thêm xe, chỉ tối ưu",
    body: "Không thêm phương tiện lên đường — CoGo lấp đầy những ghế trống sẵn có, giảm kẹt xe và khí thải.",
  },
  {
    icon: ShieldCheck,
    title: "An toàn có xác thực",
    body: "Định danh CCCD/GPLX, đánh giá hai chiều và theo dõi hành trình thời gian thực cho mọi chuyến đi.",
  },
];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) {
      completeOnboarding();
      router.push("/login");
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-brand-green/10 via-background to-background">
      <div className="flex justify-end p-4">
        <button
          className="text-sm text-muted-foreground"
          onClick={() => {
            completeOnboarding();
            router.push("/login");
          }}
        >
          Bỏ qua
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 flex size-24 items-center justify-center rounded-[2rem] bg-brand-green/12 text-brand-green">
              <slide.icon className="size-11" strokeWidth={1.6} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">{slide.title}</h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground text-balance">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-6 px-8 pb-10">
        <div className="flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-brand-green" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <Button size="lg" className="h-12 w-full rounded-full text-base" onClick={next}>
          {isLast ? "Bắt đầu" : "Tiếp tục"}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
