"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { SplashFallback } from "@/components/app-shell/splash-fallback";

export default function RootPage() {
  const router = useRouter();
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const authStep = useAppStore((s) => s.authStep);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!onboardingDone) router.replace("/onboarding");
      else if (authStep !== "done") router.replace("/login");
      else router.replace("/home");
    }, 700);
    return () => clearTimeout(t);
  }, [onboardingDone, authStep, router]);

  return <SplashFallback />;
}
