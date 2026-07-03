"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import {
  useMpviDatosServicio,
  useMpviJefeTallerActions,
} from "@/modules/taller/mpvi/hooks/useMpviJefeTaller";
import {
  formatMpviCurrency,
  type MpviFilaServicioEstado,
  type MpviTablaServicio,
} from "@/modules/taller/mpvi/types";
import { useToast } from "@/components/shared/ui/ToastContext";

interface MpviGestionJefeProps {
  op?: number;
  initialIdCotizacion?: number | null;
  showBackLink?: boolean;
}

function buildFilasServicio(tabla: MpviTablaServicio | undefined): MpviFilaServicioEstado[] {
  if (!tabla?.filas?.length) return [];
  return tabla.filas.map((fila, idx) => ({
    key: `${fila.sufijo}-${fila.idSubsistema}-${fila.operacion}-${idx}`,
    fila,
    autorizado: fila.autorizado,
    noDisponible: fila.noDisponible,
  }));
}

function TablaServicio({
  titulo,
  filas,
  onChange,
}: {
  titulo: string;
  filas: MpviFilaServicioEstado[];
  onChange: (key: string, field: "autorizado" | "noDisponible", value: boolean) => void;
}) {
  if (!filas.length) return null;

  const totales = filas.reduce(
    (acc, { fila, autorizado }) => {
      if (autorizado) {
        acc.repuestos += fila.valorRepuesto ?? 0;
        acc.manoObra += fila.manoObra ?? 0;
      }
      return acc;
    },
    { repuestos: 0, manoObra: 0 },
  );

  return (
    <div className="mt-6 overflow-x-auto">
      <h4 className="font-semibold text-gray-800 mb-2">{titulo}</h4>
      <table className="min-w-full text-sm border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 border-b">Cod. Op.</th>
            <th className="px-2 py-2 border-b">Operación</th>
            <th className="px-2 py-2 border-b text-center">Tiempo</th>
            <th className="px-2 py-2 border-b">Cod. Rep.</th>
            <th className="px-2 py-2 border-b">Repuesto</th>
            <th className="px-2 py-2 border-b text-center">Cant.</th>
            <th className="px-2 py-2 border-b text-center">Disp</th>
            <th className="px-2 py-2 border-b text-right">Valor rep.</th>
            <th className="px-2 py-2 border-b text-right">M.O.</th>
            <th className="px-2 py-2 border-b text-center">Autoriza</th>
            <th className="px-2 py-2 border-b text-center">No Disp.</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ key, fila, autorizado, noDisponible }) => (
            <tr key={key} className="border-t hover:bg-gray-50 transition-all">
              <td className="px-2 py-1">{fila.operacion}</td>
              <td className="px-2 py-1">{fila.descripcion}</td>
              <td className="px-2 py-1 text-center">{fila.tiempo}</td>
              <td className="px-2 py-1">{fila.codRepuesto || "—"}</td>
              <td className="px-2 py-1">{fila.repuesto || "—"}</td>
              <td className="px-2 py-1 text-center">{fila.cantidad}</td>
              <td className="px-2 py-1 text-center">{fila.disponible ? "Sí" : "No"}</td>
              <td className="px-2 py-1 text-right">{formatMpviCurrency(fila.valorRepuesto)}</td>
              <td className="px-2 py-1 text-right">{formatMpviCurrency(fila.manoObra)}</td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={autorizado}
                  onChange={(e) => onChange(key, "autorizado", e.target.checked)}
                />
              </td>
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={noDisponible}
                  onChange={(e) => onChange(key, "noDisponible", e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-medium">
          <tr>
            <td colSpan={7} className="px-2 py-2 text-right">
              Totales autorizados
            </td>
            <td className="px-2 py-2 text-right">{formatMpviCurrency(totales.repuestos)}</td>
            <td className="px-2 py-2 text-right">{formatMpviCurrency(totales.manoObra)}</td>
            <td colSpan={2} className="px-2 py-2 text-right">
              Neto: {formatMpviCurrency(totales.repuestos + totales.manoObra)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function MpviGestionJefe({
  op = 1,
  initialIdCotizacion = null,
  showBackLink = false,
}: MpviGestionJefeProps) {
  const { showError } = useToast();
  const { guardarServicio, abrirPdf } = useMpviJefeTallerActions();

  const [idCotizacionInput, setIdCotizacionInput] = useState(
    initialIdCotizacion ? String(initialIdCotizacion) : "",
  );
  const [idCotizacion, setIdCotizacion] = useState<number | null>(initialIdCotizacion);
  const [correo, setCorreo] = useState("");
  const [diasProxContacto, setDiasProxContacto] = useState("");
  const [nota, setNota] = useState("");
  const [filasU, setFilasU] = useState<MpviFilaServicioEstado[]>([]);
  const [filasR, setFilasR] = useState<MpviFilaServicioEstado[]>([]);
  const [valoresAutoIniciales, setValoresAutoIniciales] = useState("");
  const [valoresDispIniciales, setValoresDispIniciales] = useState("");
  const guardandoRef = useRef(false);

  const { datos, loading, error, refetch } = useMpviDatosServicio(op, idCotizacion);

  useEffect(() => {
    if (!datos) return;
    setCorreo(datos.correo);
    setDiasProxContacto(String(datos.diasProxContacto ?? ""));
    setNota(datos.nota ?? "");
    const u = buildFilasServicio(datos.tablaU);
    const r = buildFilasServicio(datos.tablaR);
    setFilasU(u);
    setFilasR(r);
    const all = [...u, ...r];
    setValoresAutoIniciales(all.map((f) => (f.autorizado ? "1" : "0")).join(","));
    setValoresDispIniciales(all.map((f) => (f.noDisponible ? "0" : "1")).join(","));
  }, [datos]);

  const totalNeto = useMemo(() => {
    const sum = (filas: MpviFilaServicioEstado[]) =>
      filas.reduce(
        (acc, { fila, autorizado }) =>
          autorizado ? acc + fila.valorRepuesto + fila.manoObra : acc,
        0,
      );
    return sum(filasU) + sum(filasR);
  }, [filasU, filasR]);

  const updateFila = (
    sufijo: "U" | "R",
    key: string,
    field: "autorizado" | "noDisponible",
    value: boolean,
  ) => {
    const setter = sufijo === "U" ? setFilasU : setFilasR;
    setter((prev) => prev.map((f) => (f.key === key ? { ...f, [field]: value } : f)));
  };

  const buildPayload = (opGuardar: number) => {
    const all = [...filasU, ...filasR];
    return {
      op,
      opGuardar,
      idCotizacion: idCotizacion!,
      correo,
      diasProxContacto: diasProxContacto || "0",
      nota,
      totalAutorizado: String(totalNeto),
      operaciones: all.map((f) => (f.fila.operacion === "N/A" ? "" : f.fila.operacion)).join(","),
      repuestos: all.map((f) => (f.fila.codRepuesto === "N/A" ? "" : f.fila.codRepuesto)).join(","),
      disponibilidad: all.map((f) => (f.noDisponible ? "0" : "1")).join(","),
      autorizaciones: all.map((f) => (f.autorizado ? "1" : "0")).join(","),
      subsistemas: all.map((f) => String(f.fila.idSubsistema)).join(","),
      valoresAuto: valoresAutoIniciales,
      valoresDisp: valoresDispIniciales,
    };
  };

  const handleGestionar = () => {
    const id = parseInt(idCotizacionInput, 10);
    if (!id || Number.isNaN(id)) {
      showError("Ingrese un id de cotización válido");
      return;
    }
    setIdCotizacion(id);
  };

  const handleGuardar = async (opGuardar: number) => {
    if (!idCotizacion) {
      showError("Debe cargar una cotización primero");
      return;
    }
    if (guardandoRef.current || guardarServicio.isPending) {
      return;
    }

    guardandoRef.current = true;
    try {
      const result = await guardarServicio.mutateAsync(buildPayload(opGuardar));

      if (!result.ok) {
        return;
      }

      if (opGuardar === 1) {
        await abrirPdf(idCotizacion, 0);
        setIdCotizacion(null);
        setIdCotizacionInput("");
        setFilasU([]);
        setFilasR([]);
        setCorreo("");
        setDiasProxContacto("");
        setNota("");
        return;
      }

      await refetch();
    } finally {
      guardandoRef.current = false;
    }
  };

  return (
    <div className="space-y-4">
      {showBackLink && (
        <Link
          href="/dashboard/taller/mpvi/mpvi-contact"
          className="text-sm brand-text hover:underline"
        >
          ← Regresar a gestión contact
        </Link>
      )}

      <div className="brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Id cotización</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={idCotizacionInput}
              onChange={(e) => setIdCotizacionInput(e.target.value)}
              disabled={!!initialIdCotizacion}
            />
          </div>
          {!initialIdCotizacion && (
            <Button type="button" className="brand-btn" onClick={handleGestionar}>
              Gestionar
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => idCotizacion && abrirPdf(idCotizacion, 0)}
            disabled={!idCotizacion}
          >
            Imprimir cotización
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => idCotizacion && abrirPdf(idCotizacion, 1)}
            disabled={!idCotizacion}
          >
            PDF Técnico
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => idCotizacion && abrirPdf(idCotizacion, 2)}
            disabled={!idCotizacion}
          >
            Ver PDF BDC
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 mt-4 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            <span>Cargando cotización...</span>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {datos && (
          <>
            <TablaServicio
              titulo={datos.tablaU?.etiqueta ?? "Urgentes"}
              filas={filasU}
              onChange={(key, field, value) => updateFila("U", key, field, value)}
            />
            <TablaServicio
              titulo={datos.tablaR?.etiqueta ?? "Recomendados"}
              filas={filasR}
              onChange={(key, field, value) => updateFila("R", key, field, value)}
            />

            <p className="mt-4 font-semibold brand-text">
              Total neto autorizado: {formatMpviCurrency(totalNeto)}
            </p>

            <hr className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Días próximo contacto</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={diasProxContacto}
                  onChange={(e) => setDiasProxContacto(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Nota</label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                className="brand-btn"
                disabled={guardarServicio.isPending}
                onClick={() => handleGuardar(2)}
              >
                {guardarServicio.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                className="brand-btn"
                disabled={guardarServicio.isPending}
                onClick={() => handleGuardar(1)}
              >
                {guardarServicio.isPending ? "Procesando..." : "Ejecutar y enviar"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
