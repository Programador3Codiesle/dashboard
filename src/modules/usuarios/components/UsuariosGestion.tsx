"use client";

import { UsuariosToolbar } from "./UsuariosToolbar";
import { UsuariosTable } from "./UsuariosTable";
import { USUARIOS_COPY } from "../constants";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

export function UsuariosGestion() {
  return (
    <div data-testid="usuarios-module" className="app-section-card w-full min-w-0 max-w-none">
      <PageTitleRow
        title={USUARIOS_COPY.title}
        headingAs="h2"
        headingClassName="app-title-xl brand-text"
        className="mb-4 sm:mb-6"
      />
      <UsuariosToolbar />
      <UsuariosTable />
      <p className="mt-8 text-sm text-gray-500">{USUARIOS_COPY.footer}</p>
    </div>
  );
}
