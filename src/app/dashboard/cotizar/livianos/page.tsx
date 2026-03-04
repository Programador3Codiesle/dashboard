'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Search } from "lucide-react";
import {
  useCotizadorLivianosInit,
  useRevisionesLivianos,
  useRevisionDetalleLivianos,
  useVehiculoPorPlaca,
} from "@/modules/cotizador/hooks/useCotizadorLivianos";
import { useMutation } from "@tanstack/react-query";
import { cotizadorLivianosService } from "@/modules/cotizador/services/cotizador-livianos.service";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function CotizarLivianosPage() {
  const [placaBusqueda, setPlacaBusqueda] = useState("");
  const [placaConsultada, setPlacaConsultada] = useState<string | null>(null);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<number | null>(null);
  const [revisionSeleccionada, setRevisionSeleccionada] = useState<number | null>(null);
  const [kilometrajeCliente, setKilometrajeCliente] = useState<string>("");
  const [telefonoCliente, setTelefonoCliente] = useState<string>("");
  const [emailCliente, setEmailCliente] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [agendarCita, setAgendarCita] = useState<boolean>(false);

  const { showSuccess, showError } = useToast();

  const { data: initData, loading: loadingInit, error: errorInit } = useCotizadorLivianosInit();
  const { vehiculo, loading: loadingVehiculo, error: errorVehiculo } = useVehiculoPorPlaca(placaConsultada);
  const vehiculoClase = (vehiculo as any)?.clase ?? null;
  const { revisiones, loading: loadingRevisiones } = useRevisionesLivianos(vehiculoClase);
  const { detalle, loading: loadingDetalle } = useRevisionDetalleLivianos({
    bodega: bodegaSeleccionada,
    clase: vehiculoClase,
    revision: revisionSeleccionada,
  });

  const bodegasOptions = useMemo(() => initData?.bodegas ?? [], [initData?.bodegas]);

  const handleBuscarVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizada = placaBusqueda.trim().toUpperCase();
    if (!normalizada) return;
    setPlacaConsultada(normalizada);
    // Reiniciar selección de bodega/revisión/detalle al cambiar de vehículo
    setBodegaSeleccionada(null);
    setRevisionSeleccionada(null);
  };

  const handleSeleccionarBodega = (value: string) => {
    const num = Number(value);
    setBodegaSeleccionada(Number.isNaN(num) ? null : num);
  };

  const handleSeleccionarRevision = (value: string) => {
    const num = Number(value);
    setRevisionSeleccionada(Number.isNaN(num) ? null : num);
  };

  const totalRepuestos = useMemo(
    () => ((detalle as any)?.repuestos ?? []).reduce((acc: number, r: any) => acc + r.valor, 0),
    [detalle]
  );

  const totalManoObra = useMemo(
    () => ((detalle as any)?.manoObra ?? []).reduce((acc: number, m: any) => acc + m.valor_unitario, 0),
    [detalle]
  );

  const totalGeneral = totalRepuestos + totalManoObra;

  const guardarMutation = useMutation({
    mutationFn: async () => {
      if (!vehiculo || !detalle || !bodegaSeleccionada || !revisionSeleccionada) {
        throw new Error("Faltan datos para guardar la cotización.");
      }

      const v = vehiculo as any;
      const kmClienteNumber = Number(kilometrajeCliente || v.kilometraje);

      const general = {
        nombreCliente: v.cliente,
        nitCliente: v.nit,
        telfCliente: telefonoCliente || v.celular || null,
        placa: v.placa,
        clase: v.clase,
        descripcion: v.descripcion,
        des_modelo: v.des_modelo,
        kilometraje_actual: v.kilometraje,
        kilometraje_estimado: v.km_estimado,
        kilometraje_cliente: Number.isNaN(kmClienteNumber) ? v.kilometraje : kmClienteNumber,
        bodega: bodegaSeleccionada,
        revision: revisionSeleccionada,
        emailCliente: emailCliente || v.mail || null,
        // En el legacy este campo viene de la sesión; aquí de momento usamos 0.
        usuario: 0,
        observaciones: observaciones || null,
        estado: agendarCita ? 1 : 0,
      };

      const repuestos = ((detalle as any).repuestos ?? []).map((r: any) => ({
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
        categoria: r.categoria,
        uni_disponibles: r.unidades_disponibles,
        valor: r.valor,
        estado: 1, // Por ahora todos autorizados como en el subtotal base
        adicional: null,
      }));

      const manoObra = ((detalle as any).manoObra ?? []).map((m: any) => ({
        mtto: m.operacion,
        valor: m.valor_unitario,
        estado: 1,
        cant_horas: m.cant_horas ?? null,
        adicional: null,
      }));

      return cotizadorLivianosService.crearCotizacion({
        general,
        repuestos,
        manoObra,
      });
    },
    onSuccess: (data) => {
      showSuccess(`Cotización guardada correctamente (ID #${data.idCotizacion}).`);
    },
    onError: (error: any) => {
      showError(error?.message || "No se pudo guardar la cotización.");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Cotizador Livianos
        </h1>
        <p className="text-gray-500 mt-1">
          Busca un vehículo por placa, selecciona la revisión y genera el detalle base de la cotización para livianos.
        </p>
      </div>

      {/* Fila de búsqueda por placa */}
      <motion.form
        onSubmit={handleBuscarVehiculo}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col md:flex-row md:items-end gap-4"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa del vehículo
          </label>
          <input
            type="text"
            value={placaBusqueda}
            onChange={(e) => setPlacaBusqueda(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
            className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all text-sm bg-white tracking-widest uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loadingVehiculo || !placaBusqueda.trim()}
          className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Search size={18} />
          <span>{loadingVehiculo ? "Buscando..." : "Buscar"}</span>
        </button>
      </motion.form>

      {/* Estado de carga / error inicial */}
      {loadingInit && (
        <div className="text-sm text-gray-500">
          Cargando configuración inicial del cotizador...
        </div>
      )}
      {errorInit && (
        <div className="text-sm text-red-500">
          {errorInit}
        </div>
      )}

      {/* Tarjeta con datos básicos del vehículo (cuando exista) */}
      {vehiculo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Datos del vehículo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Cliente</p>
              <p className="font-medium text-gray-900">{(vehiculo as any).cliente}</p>
            </div>
            <div>
              <p className="text-gray-500">Placa</p>
              <p className="font-medium text-gray-900">{(vehiculo as any).placa}</p>
            </div>
            <div>
              <p className="text-gray-500">Clase</p>
              <p className="font-medium text-gray-900">
                {(vehiculo as any).clase} - {(vehiculo as any).descripcion}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Modelo</p>
              <p className="font-medium text-gray-900">
                {(vehiculo as any).des_modelo} ({(vehiculo as any).year})
              </p>
            </div>
            <div>
              <p className="text-gray-500">Kilometraje actual</p>
              <p className="font-medium text-gray-900">
                {new Intl.NumberFormat("es-CO").format((vehiculo as any).kilometraje)} km
              </p>
            </div>
            <div>
              <p className="text-gray-500">Kilometraje estimado</p>
              <p className="font-medium text-gray-900">
                {(vehiculo as any).km_estimado != null
                  ? `${new Intl.NumberFormat("es-CO").format((vehiculo as any).km_estimado)} km`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Selección de bodega y revisión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bodega
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={bodegaSeleccionada ?? ""}
                onChange={(e) => handleSeleccionarBodega(e.target.value)}
              >
                <option value="">Selecciona una bodega</option>
                {bodegasOptions.map((b: any) => (
                  <option key={b.bodega} value={b.bodega}>
                    {b.bodega} - {b.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Revisión
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={revisionSeleccionada ?? ""}
                onChange={(e) => handleSeleccionarRevision(e.target.value)}
                disabled={loadingRevisiones || !(revisiones as any[] | undefined)?.length}
              >
                <option value="">
                  {loadingRevisiones ? "Cargando revisiones..." : "Selecciona una revisión"}
                </option>
                {(revisiones as any[] | undefined)?.map((r: any) => (
                  <option key={r.revision} value={r.revision}>
                    Revisión {r.revision}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Datos adicionales de la cotización */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono cliente
              </label>
              <input
                type="tel"
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                placeholder={(vehiculo as any).celular || "Teléfono"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email cliente
              </label>
              <input
                type="email"
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                placeholder={(vehiculo as any).mail || "correo@cliente.com"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometraje ingresado por el cliente
              </label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={kilometrajeCliente}
                onChange={(e) => setKilometrajeCliente(e.target.value)}
                placeholder={String((vehiculo as any).kilometraje)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all min-h-[60px]"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la cotización..."
              />
            </div>
            <div className="flex flex-col justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-(--color-primary)"
                  checked={agendarCita}
                  onChange={(e) => setAgendarCita(e.target.checked)}
                />
                <span>Marcar cotización como agendada</span>
              </label>
              <button
                type="button"
                onClick={() => guardarMutation.mutate()}
                disabled={
                  guardarMutation.isPending ||
                  !detalle ||
                  !bodegaSeleccionada ||
                  !revisionSeleccionada
                }
                className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{guardarMutation.isPending ? "Guardando..." : "Guardar cotización"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabla simple con detalle de repuestos y mano de obra */}
      {detalle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle de cotización (repuestos y mano de obra)
            </h2>
            <div className="text-sm text-gray-700 space-y-1 md:text-right">
              <p>
                <span className="font-medium">Total repuestos: </span>
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                  totalRepuestos
                )}
              </p>
              <p>
                <span className="font-medium">Total mano de obra: </span>
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                  totalManoObra
                )}
              </p>
              <p className="text-base">
                <span className="font-semibold">Total general: </span>
                <span className="brand-text font-bold">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(totalGeneral)}
                </span>
              </p>
            </div>
          </div>

          {/* Repuestos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-primary)]">
                  <th className="text-left py-2 px-3">Código</th>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-center py-2 px-3">Cant.</th>
                  <th className="text-left py-2 px-3">Categoría</th>
                  <th className="text-center py-2 px-3">Und. disp.</th>
                  <th className="text-right py-2 px-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {((detalle as any).repuestos ?? []).map((r: any) => (
                  <tr key={r.seq} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{r.codigo}</td>
                    <td className="py-2 px-3">{r.descripcion}</td>
                    <td className="py-2 px-3 text-center">{r.cantidad}</td>
                    <td className="py-2 px-3">{r.categoria}</td>
                    <td className="py-2 px-3 text-center">{r.unidades_disponibles}</td>
                    <td className="py-2 px-3 text-right">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(r.valor)}
                    </td>
                  </tr>
                ))}
                {!((detalle as any).repuestos ?? []).length && (
                  <tr>
                    <td colSpan={6} className="py-3 px-3 text-center text-gray-500">
                      No hay repuestos configurados para esta revisión.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mano de obra */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-primary)]">
                  <th className="text-left py-2 px-3">Operación</th>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-center py-2 px-3">Horas</th>
                  <th className="text-right py-2 px-3">Valor (≤ 5 años)</th>
                </tr>
              </thead>
              <tbody>
                {((detalle as any).manoObra ?? []).map((m: any) => (
                  <tr key={m.operacion} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{m.operacion}</td>
                    <td className="py-2 px-3">{m.descripcion_operacion}</td>
                    <td className="py-2 px-3 text-center">{m.cant_horas}</td>
                    <td className="py-2 px-3 text-right">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(m.valor_unitario)}
                    </td>
                  </tr>
                ))}
                {!((detalle as any).manoObra ?? []).length && (
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-center text-gray-500">
                      No hay mano de obra configurada para esta revisión.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loadingDetalle && (
            <div className="text-sm text-gray-500">
              Cargando detalle de cotización...
            </div>
          )}
        </motion.div>
      )}

      {/* Error específico de búsqueda por placa */}
      {errorVehiculo && (
        <div className="text-sm text-red-500">
          {errorVehiculo}
        </div>
      )}
    </div>
  );
}

