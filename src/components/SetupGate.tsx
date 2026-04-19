"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

// Routes that don't require a completed setup.
const PUBLIC_ROUTES = ["/setup"];

export function SetupGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, hydrated } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return;
    if (data.userRole == null) {
      router.replace("/setup");
    }
  }, [hydrated, data.userRole, pathname, router]);

  // While redirecting, render nothing to avoid flash of wrong content.
  if (hydrated && data.userRole == null && !PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return null;
  }

  return <>{children}</>;
}
