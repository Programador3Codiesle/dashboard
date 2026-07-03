"use client";

import { memo, useCallback, type FormEvent, type ReactNode } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/shared/atoms/Button";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useMpviAdminActions, useMpviCatalogo } from "@/modules/taller/mpvi/hooks/useMpviAdmin";
import type { MpviGuardarElementoPayload } from "@/modules/taller/mpvi/types";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-amber-400 focus:outline-none";

const CARD_CLASS =
  "brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all";

type GuardarElementoMutation = UseMutationResult<unknown, Error, MpviGuardarElementoPayload, unknown>;

type CatalogoOpcion = { id: number; label: string };

function getFormValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value : "";
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalId(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function isGuardarPendingForOp(guardar: GuardarElementoMutation, op: number) {
  return guardar.isPending && guardar.variables?.op === op;
}

function CatalogoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={CARD_CLASS}>
      <h3 className="text-lg font-semibold mb-3 brand-section-title">{title}</h3>
      {children}
    </div>
  );
}

const CatalogoSelect = memo(function CatalogoSelect({
  id,
  name,
  opciones,
  placeholder,
}: {
  id: string;
  name: string;
  opciones: CatalogoOpcion[];
  placeholder: string;
}) {
  return (
    <select id={id} name={name} className={INPUT_CLASS} defaultValue="">
      <option value="">{placeholder}</option>
      {opciones.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
});

function AgregarSistemaForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const sistema = getFormValue(form, "sistema").trim();
      if (!sistema) {
        showError("Ingrese el nombre del sistema");
        return;
      }
      guardar.mutate({ op: 0, data: { sistema } }, { onSuccess: () => form.reset() });
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Sistema">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          name="sistema"
          type="text"
          placeholder="Nombre del sistema"
          className={`flex-1 ${INPUT_CLASS}`}
        />
        <Button
          type="submit"
          className="brand-btn"
          disabled={isGuardarPendingForOp(guardar, 0)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

function AgregarSubsistemaForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();
  const { opciones: sistemas } = useMpviCatalogo("sistemas");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const idSistema = getFormValue(form, "sub_id_sistema");
      const subsistema = getFormValue(form, "sub_nombre").trim();
      if (!idSistema || !subsistema) {
        showError("Seleccione un sistema e ingrese el nombre del subsistema");
        return;
      }
      guardar.mutate(
        { op: 1, data: { id_sistema: Number(idSistema), subsistema } },
        { onSuccess: () => form.reset() },
      );
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Subsistema">
      <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CatalogoSelect
          id="sistema-bd"
          name="sub_id_sistema"
          opciones={sistemas}
          placeholder="Seleccione sistema"
        />
        <input name="sub_nombre" type="text" placeholder="Subsistema" className={INPUT_CLASS} />
        <Button
          type="submit"
          className="brand-btn"
          disabled={isGuardarPendingForOp(guardar, 1)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

function AgregarVehiculoForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();
  const { opciones: subsistemas } = useMpviCatalogo("subsistemas");
  const { opciones: familias } = useMpviCatalogo("familias-vh");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const idSubsistema = getFormValue(form, "vh_id_subsistema");
      const idFamilia = getFormValue(form, "vh_id_familia");
      const clase = getFormValue(form, "vh_clase").trim();
      const anoIni = getFormValue(form, "vh_ano_inicial");
      const anoFin = getFormValue(form, "vh_ano_final");
      if (!idFamilia || !clase) {
        showError("Seleccione familia e ingrese la clase del vehículo");
        return;
      }
      guardar.mutate(
        {
          op: 2,
          data: {
            id_subsistema: parseOptionalId(idSubsistema),
            id_familia: Number(idFamilia),
            clase,
            ano_inicial: parseOptionalInt(anoIni),
            ano_final: parseOptionalInt(anoFin),
          },
        },
        { onSuccess: () => form.reset() },
      );
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Vehículo">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <CatalogoSelect
          id="subsistema-vh"
          name="vh_id_subsistema"
          opciones={subsistemas}
          placeholder="Subsistema (opcional)"
        />
        <CatalogoSelect
          id="familia-vh"
          name="vh_id_familia"
          opciones={familias}
          placeholder="Familia"
        />
        <input name="vh_clase" type="text" placeholder="Clase" className={INPUT_CLASS} />
        <input
          name="vh_ano_inicial"
          type="text"
          inputMode="numeric"
          placeholder="Año inicial (opcional)"
          className={INPUT_CLASS}
        />
        <input
          name="vh_ano_final"
          type="text"
          inputMode="numeric"
          placeholder="Año final (opcional)"
          className={INPUT_CLASS}
        />
        <Button
          type="submit"
          className="brand-btn"
          disabled={isGuardarPendingForOp(guardar, 2)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

function AgregarManoObraForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();
  const { opciones: subsistemas } = useMpviCatalogo("subsistemas");
  const { opciones: vehiculos } = useMpviCatalogo("vehiculos");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const idSubsistema = getFormValue(form, "mo_id_subsistema");
      const idVh = getFormValue(form, "mo_id_vh");
      const idTempario = getFormValue(form, "mo_id_tempario").trim();
      const tiempo = getFormValue(form, "mo_tiempo").trim();
      if (!idSubsistema || !idVh || !idTempario || !tiempo) {
        showError("Complete todos los campos de mano de obra");
        return;
      }
      guardar.mutate(
        {
          op: 3,
          data: {
            id_subsistema: Number(idSubsistema),
            id_vh: Number(idVh),
            id_tempario: Number(idTempario),
            tiempo: Number(tiempo),
          },
        },
        { onSuccess: () => form.reset() },
      );
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Mano de Obra">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <CatalogoSelect
          id="subsistema-mo"
          name="mo_id_subsistema"
          opciones={subsistemas}
          placeholder="Subsistema"
        />
        <CatalogoSelect
          id="vh-mo"
          name="mo_id_vh"
          opciones={vehiculos}
          placeholder="Vehículo"
        />
        <input
          name="mo_id_tempario"
          type="text"
          inputMode="numeric"
          placeholder="Id tempario"
          className={INPUT_CLASS}
        />
        <input
          name="mo_tiempo"
          type="text"
          inputMode="decimal"
          placeholder="Tiempo (horas)"
          className={INPUT_CLASS}
        />
        <Button
          type="submit"
          className="brand-btn md:col-span-2 lg:col-span-4"
          disabled={isGuardarPendingForOp(guardar, 3)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

function AgregarRepuestoForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();
  const { opciones: subsistemas } = useMpviCatalogo("subsistemas");
  const { opciones: vehiculos } = useMpviCatalogo("vehiculos");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const idSubsistema = getFormValue(form, "rep_id_subsistema");
      const idVh = getFormValue(form, "rep_id_vh");
      const codigo = getFormValue(form, "rep_codigo").trim();
      const cantidad = getFormValue(form, "rep_cantidad").trim();
      if (!idSubsistema || !idVh || !codigo || !cantidad) {
        showError("Complete todos los campos del repuesto");
        return;
      }
      guardar.mutate(
        {
          op: 4,
          data: {
            id_subsistema: Number(idSubsistema),
            id_vh: Number(idVh),
            codigo,
            cantidad: Number(cantidad),
          },
        },
        { onSuccess: () => form.reset() },
      );
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Repuesto">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <CatalogoSelect
          id="subsistema-rep"
          name="rep_id_subsistema"
          opciones={subsistemas}
          placeholder="Subsistema"
        />
        <CatalogoSelect id="vh-rep" name="rep_id_vh" opciones={vehiculos} placeholder="Vehículo" />
        <input name="rep_codigo" type="text" placeholder="Código" className={INPUT_CLASS} />
        <input
          name="rep_cantidad"
          type="text"
          inputMode="numeric"
          placeholder="Cantidad"
          className={INPUT_CLASS}
        />
        <Button
          type="submit"
          className="brand-btn md:col-span-2 lg:col-span-4"
          disabled={isGuardarPendingForOp(guardar, 4)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

function AgregarReferenciaForm({ guardar }: { guardar: GuardarElementoMutation }) {
  const { showError } = useToast();
  const { opciones: repuestos } = useMpviCatalogo("repuestos");

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const idRepuesto = getFormValue(form, "ref_id_repuesto");
      const alterno1 = getFormValue(form, "ref_alterno1").trim();
      const alterno2 = getFormValue(form, "ref_alterno2").trim();
      const alterno3 = getFormValue(form, "ref_alterno3").trim();
      if (!idRepuesto || !alterno1) {
        showError("Seleccione un repuesto e ingrese al menos el alterno 1");
        return;
      }
      guardar.mutate(
        {
          op: 5,
          data: {
            id_repuesto: Number(idRepuesto),
            alterno1,
            alterno2: alterno2 || undefined,
            alterno3: alterno3 || undefined,
          },
        },
        { onSuccess: () => form.reset() },
      );
    },
    [guardar, showError],
  );

  return (
    <CatalogoCard title="Agregar Referencia">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <CatalogoSelect
          id="repuesto-ref"
          name="ref_id_repuesto"
          opciones={repuestos}
          placeholder="Repuesto"
        />
        <input name="ref_alterno1" type="text" placeholder="Alterno 1" className={INPUT_CLASS} />
        <input name="ref_alterno2" type="text" placeholder="Alterno 2" className={INPUT_CLASS} />
        <input name="ref_alterno3" type="text" placeholder="Alterno 3" className={INPUT_CLASS} />
        <Button
          type="submit"
          className="brand-btn md:col-span-2 lg:col-span-4"
          disabled={isGuardarPendingForOp(guardar, 5)}
        >
          Crear
        </Button>
      </form>
    </CatalogoCard>
  );
}

/**
 * Formularios de catálogo MPVI con inputs no controlados.
 * Cada sección tiene estado aislado para evitar re-renders al escribir.
 */
export function MpviCatalogoForms() {
  const { guardarElemento } = useMpviAdminActions();

  return (
    <div className="space-y-4">
      <AgregarSistemaForm guardar={guardarElemento} />
      <AgregarSubsistemaForm guardar={guardarElemento} />
      <AgregarVehiculoForm guardar={guardarElemento} />
      <AgregarManoObraForm guardar={guardarElemento} />
      <AgregarRepuestoForm guardar={guardarElemento} />
      <AgregarReferenciaForm guardar={guardarElemento} />
    </div>
  );
}
