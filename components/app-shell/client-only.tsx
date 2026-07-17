"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    useAppStore.getState().setHydrated();
    setReady(true);
  }, []);

  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}
