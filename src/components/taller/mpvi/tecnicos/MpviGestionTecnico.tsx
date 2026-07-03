"use client";

import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import Modal from "@/components/shared/ui/Modal";
import {
  useMpviDatos,
  useMpviItems,
  useMpviTecnicosActions,
} from "@/modules/taller/mpvi/hooks/useMpviTecnicos";
import {
  formatMpviCurrency,
  MPVI_BODEGAS,
  type MpviFilaTecnicoEstado,
  type MpviSubsistemaEstado,
  type MpviTablaTecnico,
} from "@/modules/taller/mpvi/types";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { mpviTecnicosService } from "@/modules/taller/mpvi/services/mpvi-tecnicos.service";

const INPUT_CLASS = "w-full rounded-lg border px-3 py-2 text-sm";

function getFormFieldValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value : "";
}

type MpviDatosClienteHandle = {
  getValues: () => { nombre: string; celular: string };
};

const MpviDatosClienteForm = memo(
  forwardRef<
    MpviDatosClienteHandle,
    { defaultNombre: string; defaultCelular: string; descVh: string }
  >(function MpviDatosClienteForm({ defaultNombre, defaultCelular, descVh }, ref) {
    const formRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
      getValues: () => {
        const form = formRef.current;
        if (!form) return { nombre: "", celular: "" };
        return {
          nombre: getFormFieldValue(form, "nombre").trim(),
          celular: getFormFieldValue(form, "celular").trim(),
        };
      },
    }));

    useEffect(() => {
      const form = formRef.current;
      if (!form) return;
      const nombreInput = form.elements.namedItem("nombre") as HTMLInputElement | null;
      const celularInput = form.elements.namedItem("celular") as HTMLInputElement | null;
      if (nombreInput) nombreInput.value = defaultNombre;
      if (celularInput) celularInput.value = defaultCelular;
    }, [defaultNombre, defaultCelular]);

    return (
      <form ref={formRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre cliente *</label>
          <input name="nombre" type="text" className={INPUT_CLASS} defaultValue={defaultNombre} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Celular *</label>
          <input name="celular" type="text" className={INPUT_CLASS} defaultValue={defaultCelular} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción vehículo</label>
          <input className={`${INPUT_CLASS} bg-gray-50`} value={descVh} readOnly tabIndex={-1} />
        </div>
      </form>
    );
  }),
);

type MpviCamposGuardadoHandle = {
  getValues: () => { correo: string; numOrden: string; diasProxContacto: string; nota: string };
};

const MpviCamposGuardadoForm = memo(
  forwardRef<
    MpviCamposGuardadoHandle,
    { defaultCorreo: string; isPending: boolean; onGuardar: () => void }
  >(function MpviCamposGuardadoForm({ defaultCorreo, isPending, onGuardar }, ref) {
    const formRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
      getValues: () => {
        const form = formRef.current;
        if (!form) {
          return { correo: "", numOrden: "", diasProxContacto: "", nota: "" };
        }
        return {
          correo: getFormFieldValue(form, "correo").trim(),
          numOrden: getFormFieldValue(form, "num_orden").trim(),
          diasProxContacto: getFormFieldValue(form, "dias_prox_contacto").trim(),
          nota: getFormFieldValue(form, "nota"),
        };
      },
    }));

    useEffect(() => {
      const correoInput = formRef.current?.elements.namedItem("correo") as HTMLInputElement | null;
      if (correoInput) correoInput.value = defaultCorreo;
    }, [defaultCorreo]);

    return (
      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onGuardar();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correo cliente *</label>
            <input
              name="correo"
              type="email"
              className={INPUT_CLASS}
              defaultValue={defaultCorreo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">N° Orden *</label>
            <input
              name="num_orden"
              type="text"
              inputMode="numeric"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Días próximo contacto</label>
            <input
              name="dias_prox_contacto"
              type="text"
              inputMode="numeric"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Nota</label>
          <textarea name="nota" className={INPUT_CLASS} rows={3} />
        </div>

        <div className="mt-6">
          <Button type="submit" className="brand-btn" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cotización"}
          </Button>
        </div>
      </form>
    );
  }),
);

function buildClasificacionPayload(subsistemas: MpviSubsistemaEstado[]) {
  return {
    urgentes: subsistemas
      .filter((s) => s.clasificacion === "U")
      .map((s) => s.id)
      .join(","),
    recomendados: subsistemas
      .filter((s) => s.clasificacion === "R")
      .map((s) => s.id)
      .join(","),
    cobrables: subsistemas
      .filter((s) => s.noCobrable)
      .map((s) => s.id)
      .join(","),
  };
}

function useDebouncedCallback<T extends (...args: never[]) => void>(fn: T, delayMs: number) {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  fnRef.current = fn;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs],
  );
}

type MpviSubsistemasHandle = {
  getSubsistemas: () => MpviSubsistemaEstado[];
};

type ClasificacionPayload = ReturnType<typeof buildClasificacionPayload>;

const SubsistemaClasificacionRow = memo(function SubsistemaClasificacionRow({
  subsistema,
  onUpdate,
}: {
  subsistema: MpviSubsistemaEstado;
  onUpdate: (id: number, patch: Partial<MpviSubsistemaEstado>) => void;
}) {
  const { id, subsistema: nombre, clasificacion, noCobrable } = subsistema;

  return (
    <tr className="border-t">
      <td className="px-3 py-2">{nombre}</td>
      <td className="px-3 py-2 text-center">
        <input
          type="radio"
          name={`clasif-${id}`}
          checked={clasificacion === "U"}
          onChange={() => onUpdate(id, { clasificacion: "U" })}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="radio"
          name={`clasif-${id}`}
          checked={clasificacion === "R"}
          onChange={() => onUpdate(id, { clasificacion: "R" })}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <input
          type="radio"
          name={`clasif-${id}`}
          checked={clasificacion === "N"}
          onChange={() => onUpdate(id, { clasificacion: "N" })}
        />
      </td>
      <td className="px-3 py-2 text-center">
        <label className="inline-flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={noCobrable}
            onChange={(e) => onUpdate(id, { noCobrable: e.target.checked })}
          />
          {noCobrable ? "No cobrable" : "Cobrable"}
        </label>
      </td>
    </tr>
  );
});

const MpviSubsistemasClasificacion = memo(
  forwardRef<
    MpviSubsistemasHandle,
    {
      items: { id: number; subsistema: string }[];
      onClasificacionChange: (payload: ClasificacionPayload) => void;
    }
  >(function MpviSubsistemasClasificacion({ items, onClasificacionChange }, ref) {
    const [subsistemas, setSubsistemas] = useState<MpviSubsistemaEstado[]>([]);

    useImperativeHandle(ref, () => ({
      getSubsistemas: () => subsistemas,
    }));

    useEffect(() => {
      setSubsistemas(
        items.map((s) => ({
          id: s.id,
          subsistema: s.subsistema,
          clasificacion: "N" as const,
          noCobrable: false,
        })),
      );
    }, [items]);

    useEffect(() => {
      if (subsistemas.length === 0) return;
      onClasificacionChange(buildClasificacionPayload(subsistemas));
    }, [subsistemas, onClasificacionChange]);

    const updateSubsistema = useCallback((id: number, patch: Partial<MpviSubsistemaEstado>) => {
      setSubsistemas((prev) => {
        const index = prev.findIndex((s) => s.id === id);
        if (index === -1) return prev;

        const current = prev[index];
        const updated = { ...current, ...patch };
        if (
          updated.clasificacion === current.clasificacion &&
          updated.noCobrable === current.noCobrable
        ) {
          return prev;
        }

        const next = [...prev];
        next[index] = updated;
        return next;
      });
    }, []);

    if (subsistemas.length === 0) return null;

    return (
      <>
        <hr className="my-4" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2">Subsistema</th>
                <th className="px-3 py-2 text-center" title="Urgente">
                  <X className="inline text-red-500" size={16} />
                </th>
                <th className="px-3 py-2 text-center" title="Recomendado">
                  <AlertCircle className="inline text-orange-500" size={16} />
                </th>
                <th className="px-3 py-2 text-center" title="Sin cambio">
                  <Check className="inline text-green-500" size={16} />
                </th>
                <th className="px-3 py-2 text-center">C/NC</th>
              </tr>
            </thead>
            <tbody>
              {subsistemas.map((s) => (
                <SubsistemaClasificacionRow key={s.id} subsistema={s} onUpdate={updateSubsistema} />
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }),
);

const MpviTablasCotizacion = memo(function MpviTablasCotizacion({
  tituloU,
  tituloR,
  filasU,
  filasR,
  totalNeto,
  onChangeU,
  onChangeR,
  onStock,
}: {
  tituloU: string;
  tituloR: string;
  filasU: MpviFilaTecnicoEstado[];
  filasR: MpviFilaTecnicoEstado[];
  totalNeto: number;
  onChangeU: (key: string, field: "autorizado" | "noDisponible", value: boolean) => void;
  onChangeR: (key: string, field: "autorizado" | "noDisponible", value: boolean) => void;
  onStock: (codRepuesto: string) => void;
}) {
  return (
    <>
      <TablaCotizacionTecnico titulo={tituloU} filas={filasU} onChange={onChangeU} onStock={onStock} />
      <TablaCotizacionTecnico titulo={tituloR} filas={filasR} onChange={onChangeR} onStock={onStock} />
      {(filasU.length > 0 || filasR.length > 0) && (
        <p className="mt-4 font-semibold brand-text">
          Total neto autorizado: {formatMpviCurrency(totalNeto)}
        </p>
      )}
    </>
  );
});

function buildFilasEstado(tabla: MpviTablaTecnico | null | undefined): MpviFilaTecnicoEstado[] {
  if (!tabla?.filas?.length) return [];
  return tabla.filas.map((fila, idx) => ({
    key: `${fila.sufijo}-${fila.idSubsistema}-${idx}`,
    fila,
    autorizado: fila.autorizadoDefault,
    noDisponible: fila.noDisponibleDefault,
  }));
}

const TablaCotizacionTecnico = memo(function TablaCotizacionTecnico({
  titulo,
  filas,
  onChange,
  onStock,
}: {
  titulo: string;
  filas: MpviFilaTecnicoEstado[];
  onChange: (key: string, field: "autorizado" | "noDisponible", value: boolean) => void;
  onStock: (codRepuesto: string) => void;
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
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 border-b text-center">Operación</th>
            <th className="px-2 py-2 border-b text-center">Tiempo</th>
            <th className="px-2 py-2 border-b text-center">Cod. Repuesto</th>
            <th className="px-2 py-2 border-b text-center">Repuesto</th>
            <th className="px-2 py-2 border-b text-center">Cant.</th>
            <th className="px-2 py-2 border-b text-center">Disp</th>
            <th className="px-2 py-2 border-b text-center">Valor rep.</th>
            <th className="px-2 py-2 border-b text-center">M.O.</th>
            <th className="px-2 py-2 border-b text-center">Autoriza</th>
            <th className="px-2 py-2 border-b text-center">No Disp.</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ key, fila, autorizado, noDisponible }) => (
            <tr key={key} className="hover:bg-gray-50 transition-all">
              <td className="px-2 py-1 border-b">{fila.descripcion}</td>
              <td className="px-2 py-1 border-b text-center">{fila.tiempo}</td>
              <td className="px-2 py-1 border-b text-center">
                {fila.codRepuesto ? (
                  <button
                    type="button"
                    className="text-amber-700 underline"
                    onClick={() => onStock(fila.codRepuesto)}
                  >
                    {fila.codRepuesto}
                  </button>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-2 py-1 border-b">{fila.repuesto || "—"}</td>
              <td className="px-2 py-1 border-b text-center">{fila.cantidad}</td>
              <td className="px-2 py-1 border-b text-center">{fila.disponible}</td>
              <td className="px-2 py-1 border-b text-right">{formatMpviCurrency(fila.valorRepuesto)}</td>
              <td className="px-2 py-1 border-b text-right">{formatMpviCurrency(fila.manoObra)}</td>
              <td className="px-2 py-1 border-b text-center">
                <input
                  type="checkbox"
                  checked={autorizado}
                  onChange={(e) => onChange(key, "autorizado", e.target.checked)}
                />
              </td>
              <td className="px-2 py-1 border-b text-center">
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
            <td colSpan={6} className="px-2 py-2 text-right">
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
});

export function MpviGestionTecnico() {
  const { showError } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const empresa = user?.empresa;
  const { guardar, consultarStock } = useMpviTecnicosActions();

  const [formSessionKey, setFormSessionKey] = useState(0);
  const [bod, setBod] = useState(1);
  const [placa, setPlaca] = useState("");
  const [defaultNombre, setDefaultNombre] = useState("");
  const [defaultCelular, setDefaultCelular] = useState("");
  const [defaultCorreo, setDefaultCorreo] = useState("");
  const [descVh, setDescVh] = useState("");
  const [clasificacionPayload, setClasificacionPayload] = useState<ClasificacionPayload | null>(
    null,
  );
  const [filasU, setFilasU] = useState<MpviFilaTecnicoEstado[]>([]);
  const [filasR, setFilasR] = useState<MpviFilaTecnicoEstado[]>([]);
  const [subsistemaItems, setSubsistemaItems] = useState<{ id: number; subsistema: string }[]>([]);
  const [stockModal, setStockModal] = useState<{ open: boolean; cod: string; sedes: { sede: string; stock: number }[]; mensaje?: string }>({
    open: false,
    cod: "",
    sedes: [],
  });

  const clienteRef = useRef<MpviDatosClienteHandle>(null);
  const guardadoRef = useRef<MpviCamposGuardadoHandle>(null);
  const subsistemasRef = useRef<MpviSubsistemasHandle>(null);

  const placaQuery = placa.trim().length === 6 ? placa.trim().toUpperCase() : null;
  const { data: itemsData, loading: loadingItems, error: itemsError } = useMpviItems(placaQuery);

  const handleClasificacionChange = useDebouncedCallback((payload: ClasificacionPayload) => {
    setClasificacionPayload(payload);
  }, 350);

  const datosPayload = useMemo(() => {
    if (!placaQuery || !clasificacionPayload) return null;
    return { bod, placa: placaQuery, ...clasificacionPayload };
  }, [bod, placaQuery, clasificacionPayload]);

  const { datos, loading: loadingDatos } = useMpviDatos(datosPayload);

  const resetForm = useCallback(() => {
    setPlaca("");
    setDefaultNombre("");
    setDefaultCelular("");
    setDefaultCorreo("");
    setDescVh("");
    setSubsistemaItems([]);
    setClasificacionPayload(null);
    setFilasU([]);
    setFilasR([]);
    setFormSessionKey((key) => key + 1);
    queryClient.removeQueries({ queryKey: ["mpvi", "tecnicos"] });
  }, [queryClient]);

  useEffect(() => {
    if (!placaQuery || !itemsData) return;
    if (itemsData.ok) {
      setDefaultNombre(itemsData.nombre);
      setDefaultCelular(itemsData.celular);
      setDefaultCorreo(itemsData.correo);
      setDescVh(itemsData.desc_vh);
      setSubsistemaItems(itemsData.subsistemas);
      setClasificacionPayload(null);
      setFilasU([]);
      setFilasR([]);
    } else {
      setSubsistemaItems([]);
      setClasificacionPayload(null);
      setDefaultNombre("");
      setDefaultCelular("");
      setDefaultCorreo("");
      setDescVh("");
    }
  }, [itemsData, placaQuery]);

  useEffect(() => {
    if (!placaQuery || !datos) return;
    setFilasU(buildFilasEstado(datos.tablaU));
    setFilasR(buildFilasEstado(datos.tablaR));
  }, [datos, placaQuery]);

  const totalNeto = useMemo(() => {
    const sum = (filas: MpviFilaTecnicoEstado[]) =>
      filas.reduce(
        (acc, { fila, autorizado }) =>
          autorizado ? acc + fila.valorRepuesto + fila.manoObra : acc,
        0,
      );
    return sum(filasU) + sum(filasR);
  }, [filasU, filasR]);

  const updateFila = useCallback((
    sufijo: "U" | "R",
    key: string,
    field: "autorizado" | "noDisponible",
    value: boolean,
  ) => {
    const setter = sufijo === "U" ? setFilasU : setFilasR;
    setter((prev) => prev.map((f) => (f.key === key ? { ...f, [field]: value } : f)));
  }, []);

  const handleChangeFilaU = useCallback(
    (key: string, field: "autorizado" | "noDisponible", value: boolean) =>
      updateFila("U", key, field, value),
    [updateFila],
  );

  const handleChangeFilaR = useCallback(
    (key: string, field: "autorizado" | "noDisponible", value: boolean) =>
      updateFila("R", key, field, value),
    [updateFila],
  );

  const handleStock = useCallback(async (codRepuesto: string) => {
    try {
      const result = await consultarStock.mutateAsync(codRepuesto);
      setStockModal({
        open: true,
        cod: codRepuesto,
        sedes: result.sedes,
        mensaje: result.mensaje,
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error al consultar stock");
    }
  }, [consultarStock, showError]);

  const handleGuardar = useCallback(async () => {
    const { nombre, celular } = clienteRef.current?.getValues() ?? { nombre: "", celular: "" };
    const { correo, numOrden, diasProxContacto, nota } =
      guardadoRef.current?.getValues() ?? {
        correo: "",
        numOrden: "",
        diasProxContacto: "",
        nota: "",
      };

    const subsistemas = subsistemasRef.current?.getSubsistemas() ?? [];

    if (loadingDatos) {
      showError("Espere a que termine de cargar la cotización");
      return;
    }

    if (!placaQuery || !nombre || !correo || !numOrden) {
      showError("Complete los campos obligatorios");
      return;
    }

    const tieneAlgunCambio = subsistemas.some(
      (s) => s.clasificacion === "U" || s.clasificacion === "R",
    );
    if (subsistemas.length > 0 && !tieneAlgunCambio) {
      showError("Debe marcar al menos un subsistema como urgente o recomendado");
      return;
    }

    const allFilas = [...filasU, ...filasR];
    if (allFilas.length === 0) {
      showError("Espere a que carguen los ítems de cotización antes de guardar");
      return;
    }

    const urgentes = subsistemas.filter((s) => s.clasificacion === "U").map((s) => s.id).join(",");
    const recomendados = subsistemas.filter((s) => s.clasificacion === "R").map((s) => s.id).join(",");
    const cobrables = subsistemas.filter((s) => s.noCobrable).map((s) => s.id).join(",");

    const disponibilidad = allFilas.map((f) => (f.noDisponible ? "0" : "1")).join(",");
    const autorizados = allFilas
      .filter((f) => f.autorizado)
      .map((f) => String(f.fila.idSubsistema))
      .join(",");

    const pdfWindow = window.open(
      "",
      "MPVI",
      "status=0,title=0,height=600,width=800,scrollbars=1",
    );

    try {
      const result = await guardar.mutateAsync({
        bod,
        placa: placaQuery,
        nombre,
        celular,
        correo,
        num_orden: numOrden,
        diasProxContacto: diasProxContacto || "0",
        nota,
        urgentes,
        recomendados,
        cobrables,
        disponibilidad,
        autorizados,
      });

      const idCotizacion =
        result.idCotizacion != null ? Number(result.idCotizacion) : null;

      if (!result.ok || !idCotizacion) {
        pdfWindow?.close();
        if (result.ok && !idCotizacion) {
          showError("No se pudo obtener el ID de la cotización para el PDF");
        }
        return;
      }

      const blob = await mpviTecnicosService.obtenerPdfBlob(idCotizacion, empresa);
      const url = URL.createObjectURL(blob);

      if (pdfWindow && !pdfWindow.closed) {
        pdfWindow.location.replace(url);
      } else {
        window.open(url, "MPVI", "status=0,title=0,height=600,width=800,scrollbars=1");
      }

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      resetForm();
    } catch (err) {
      pdfWindow?.close();
      showError(err instanceof Error ? err.message : "Error al guardar o generar el PDF");
    }
  }, [bod, empresa, filasR, filasU, guardar, loadingDatos, placaQuery, resetForm, showError]);

  const formResetKey = `${formSessionKey}-${placaQuery ?? "sin-placa"}-${itemsData?.ok ? "ok" : "ko"}`;

  return (
    <div className="space-y-4">
      <div className="brand-card-surface rounded-2xl border brand-border-active brand-card-elevated p-4 sm:p-6 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bodega *</label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={bod}
              onChange={(e) => setBod(Number(e.target.value))}
            >
              {MPVI_BODEGAS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Placa *</label>
            <input
              type="text"
              maxLength={6}
              className="w-full rounded-lg border px-3 py-2 text-sm uppercase"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="ABC123"
            />
          </div>
        </div>

        {(loadingItems || loadingDatos) && (
          <div className="flex items-center gap-2 mt-4 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            <span>Cargando datos...</span>
          </div>
        )}

        {itemsError && (
          <p className="mt-3 text-sm text-red-600">{itemsError}</p>
        )}

        {itemsData && !itemsData.ok && (
          <p className="mt-3 text-sm text-amber-700">{itemsData.mensaje}</p>
        )}

        <hr className="my-4" />

        <MpviDatosClienteForm
          key={`cliente-${formResetKey}`}
          ref={clienteRef}
          defaultNombre={defaultNombre}
          defaultCelular={defaultCelular}
          descVh={descVh}
        />

        <MpviSubsistemasClasificacion
          key={`subsistemas-${formResetKey}`}
          ref={subsistemasRef}
          items={subsistemaItems}
          onClasificacionChange={handleClasificacionChange}
        />

        <MpviTablasCotizacion
          tituloU={datos?.tablaU?.etiqueta ?? "Cambios urgentes"}
          tituloR={datos?.tablaR?.etiqueta ?? "Cambios recomendados"}
          filasU={filasU}
          filasR={filasR}
          totalNeto={totalNeto}
          onChangeU={handleChangeFilaU}
          onChangeR={handleChangeFilaR}
          onStock={handleStock}
        />

        <hr className="my-4" />

        <MpviCamposGuardadoForm
          key={`guardado-${formResetKey}`}
          ref={guardadoRef}
          defaultCorreo={defaultCorreo}
          isPending={guardar.isPending || loadingDatos}
          onGuardar={handleGuardar}
        />
      </div>

      <Modal open={stockModal.open} onClose={() => setStockModal((s) => ({ ...s, open: false }))} title={`Stock — ${stockModal.cod}`}>
        {stockModal.mensaje && stockModal.sedes.length === 0 ? (
          <p className="text-gray-600">{stockModal.mensaje}</p>
        ) : (
          <ul className="space-y-2">
            {stockModal.sedes.map((s) => (
              <li key={s.sede} className="flex justify-between border-b pb-1">
                <span>{s.sede}</span>
                <span className="font-medium">{s.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
