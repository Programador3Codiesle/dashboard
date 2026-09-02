"use client";

import { memo } from "react";
import { DashboardAdmin } from "./DashboardAdmin";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";
import type {
  DashboardGerencia as DashboardGerenciaType,
  DashboardAdmin as DashboardAdminType,
} from "../types";

function DashboardGerenciaInner({ data }: { data: DashboardGerenciaType }) {
  const asAdmin: DashboardAdminType = {
    ...data,
    variant: "admin",
  };
  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Gerencia"
        headingAs="h2"
        headingClassName="text-xl font-bold text-gray-900"
      />
      <DashboardAdmin data={asAdmin} hideHeading />
    </div>
  );
}

export const DashboardGerencia = memo(DashboardGerenciaInner);
