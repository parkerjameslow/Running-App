"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { SetupGate } from "./SetupGate";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <SetupGate>{children}</SetupGate>
    </StoreProvider>
  );
}
