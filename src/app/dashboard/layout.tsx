'use client';

import { DashboardLayout } from "@/components/shared/layout/DashboardLayout";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
