"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
