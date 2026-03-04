'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Search } from "lucide-react";
import { useCotizadorPesadosInit, useMantenimientoPesados, usePesadosInfoClient } from "@/modules/cotizador/hooks/useCotizadorPesados";
import { useMutation } from "@tanstack/react-query";
import { cotizadorPesadosService } from "@/modules/cotizador/services/cotizador-pesados.service";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function CotizarPesadosPage() {
  const [placaBusqueda, setPlacaBusqueda] = useState("");
  const [placaConsultada, setPlacaConsultada] = useState<string | null>(null);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<number | null>(null);
  const [revisionSeleccionada, setRevisionSeleccionada] = useState<number | null>(null);
  const [yearModel, setYearModel] = useState<number | null>(null);
  const [comentarios, setComentarios] = useState<string>("");
  const [telefonoCliente, setTelefonoCliente] = useState<string>("");
  const [emailCliente, setEmailCliente] = useState<string>("");
  const [kmCliente, setKmCliente] = useState<string>("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<"ACDelco" | "GM" | null>(null);

  const { showSuccess, showError } = useToast();

  const { data: initData } = useCotizadorPesadosInit();
  const { info, loading: loadingInfo, error: errorInfo } = usePesadosInfoClient(placaConsultada);

  const { mantenimiento, loading: loadingMtto, refetch: refetchMtto } = useMantenimientoPesados({
    clase: (info as any)?.vehiculo?.clase ?? null,
    revision: revisionSeleccionada,
    bodega: bodegaSeleccionada,
    yearModel,
    enabled: false, // solo al hacer clic en "Cargar Mtto"
  });

  const clasesOptions = useMemo(() => initData?.clases ?? [], [initData?.clases]);

  const handleBuscarVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizada = placaBusqueda.trim().toUpperCase();
    if (!normalizada) return;
    setPlacaConsultada(normalizada);
    setBodegaSeleccionada(null);
    setRevisionSeleccionada(null);
    setYearModel(null);
    setGrupoSeleccionado(null);
  };

  const handleSeleccionarBodega = (value: string) => {
    const num = Number(value);
    setBodegaSeleccionada(Number.isNaN(num) ? null : num);
  };

  const handleSeleccionarRevision = (value: string) => {
    const num = Number(value);
    setRevisionSeleccionada(Number.isNaN(num) ? null : num);
  };

  const handleSeleccionarYear = (value: string) => {
    const num = Number(value);
    setYearModel(Number.isNaN(num) ? null : num);
  };

  const totalPorGrupo = useMemo(() => {
    const result: Record<string, { totalRepuestos: number; totalManoObra: number; totalHoras: number }> = {};
    (((mantenimiento as any)?.grupos ?? []) as any[]).forEach((g: any) => {
      const totalRepuestos = (g.repuestos as any[]).reduce((acc, r: any) => acc + r.valor, 0);
      const totalManoObra = (g.manoObra as any[]).reduce((acc, m: any) => acc + m.valor, 0);
      const totalHoras = (g.manoObra as any[]).reduce((acc, m: any) => acc + m.horas, 0);
      result[g.grupo] = { totalRepuestos, totalManoObra, totalHoras };
    });
    return result;
  }, [mantenimiento]);

  const guardarMutation = useMutation({
    mutationFn: async () => {
      if (!info || !mantenimiento || !bodegaSeleccionada || !revisionSeleccionada || !yearModel || !grupoSeleccionado) {
        throw new Error("Faltan datos para guardar la cotización de pesados.");
      }

      const vehiculo = (info as any).vehiculo;
      const grupo = ((mantenimiento as any).grupos as any[]).find((g: any) => g.grupo === grupoSeleccionado);
      if (!grupo) {
        throw new Error("No se encontró información de mantenimiento para el grupo seleccionado.");
      }

      const kmClienteNumber = Number(kmCliente || vehiculo.kilometraje);

      const general = {
        nombreCliente: vehiculo.cliente,
        nitCliente: vehiculo.nit,
        telfCliente: telefonoCliente || vehiculo.celular || null,
        placa: vehiculo.placa,
        clase: vehiculo.clase,
        descripcion: vehiculo.descripcion,
        des_modelo: vehiculo.des_modelo,
        kilometraje_actual: vehiculo.kilometraje,
        kilometraje_estimado: vehiculo.km_estimado,
        kilometraje_cliente: Number.isNaN(kmClienteNumber) ? vehiculo.kilometraje : kmClienteNumber,
        bodega: bodegaSeleccionada,
        revision: revisionSeleccionada,
        emailCliente: emailCliente || vehiculo.mail || null,
        usuario: 0,
        observaciones: comentarios || null,
        estado: 0,
      };

      const repuestos = ((grupo.repuestos ?? []) as any[]).map((r: any) => ({
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
        categoria: r.categoria,
        uni_disponibles: r.unidades_disponibles,
        valor: r.valor,
        estado: 1,
        grupo: grupo.grupo,
      }));

      const manoObra = ((grupo.manoObra ?? []) as any[]).map((m: any) => ({
        mtto: m.operacion,
        valor: m.valor,
        estado: 1,
        cant_horas: m.horas ?? null,
        grupo: grupo.grupo,
      }));

      return cotizadorPesadosService.crearCotizacion({
        general,
        repuestos,
        manoObra,
      });
    },
    onSuccess: (data) => {
      showSuccess(`Cotización de pesados guardada correctamente (ID #${data.idCotizacion}).`);
    },
    onError: (error: any) => {
      showError(error?.message || "No se pudo guardar la cotización de pesados.");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Cotizador Pesados
        </h1>
        <p className="text-gray-500 mt-1">
          Cotiza mantenimiento para vehículos pesados por grupo (ACDelco / GM) usando la misma lógica del módulo legacy.
        </p>
      </div>

      {/* Búsqueda por placa */}
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
          disabled={loadingInfo || !placaBusqueda.trim()}
          className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Search size={18} />
          <span>{loadingInfo ? "Buscando..." : "Buscar"}</span>
        </button>
      </motion.form>

      {/* Datos del vehículo y formulario principal */}
      {info && (
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
              <p className="font-medium text-gray-900">{(info as any).vehiculo?.cliente}</p>
            </div>
            <div>
              <p className="text-gray-500">Placa</p>
              <p className="font-medium text-gray-900">{(info as any).vehiculo?.placa}</p>
            </div>
            <div>
              <p className="text-gray-500">Clase</p>
              <p className="font-medium text-gray-900">
                {(info as any).vehiculo?.clase} - {(info as any).vehiculo?.descripcion}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Modelo</p>
              <p className="font-medium text-gray-900">
                {(info as any).vehiculo?.des_modelo} ({(info as any).vehiculo?.year})
              </p>
            </div>
            <div>
              <p className="text-gray-500">Kilometraje actual</p>
              <p className="font-medium text-gray-900">
                {new Intl.NumberFormat("es-CO").format((info as any).vehiculo?.kilometraje)} km
              </p>
            </div>
            <div>
              <p className="text-gray-500">Kilometraje estimado</p>
              <p className="font-medium text-gray-900">
                {(info as any).vehiculo?.km_estimado != null
                  ? `${new Intl.NumberFormat("es-CO").format((info as any).vehiculo?.km_estimado)} km`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Selección de bodega, revisión y año */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bodega
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={bodegaSeleccionada ?? ""}
                onChange={(e) => handleSeleccionarBodega(e.target.value)}
              >
                <option value="">Seleccione una sede</option>
                <option value="1">Girón Diesel</option>
                <option value="6">Barranca</option>
                <option value="8">Cúcuta</option>
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
              >
                <option value="">Seleccione una revisión</option>
                {(((info as any)?.revisiones ?? []) as any[]).map((r: any) => (
                  <option key={r.revision} value={r.revision}>
                    Revisión {r.revision}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año modelo
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={yearModel ?? ""}
                onChange={(e) => handleSeleccionarYear(e.target.value)}
              >
                <option value="">Año</option>
                {Array.from({ length: 12 }).map((_, idx) => {
                  const year = 2016 + idx;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Datos adicionales de contacto */}
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
                placeholder={(info as any).vehiculo?.celular || "Celular"}
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
                placeholder={(info as any).vehiculo?.mail || "correo@cliente.com"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Km cliente
              </label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={kmCliente}
                onChange={(e) => setKmCliente(e.target.value)}
                placeholder={String((info as any).vehiculo?.kilometraje)}
              />
            </div>
          </div>

          {/* Comentarios y botón cargar mantenimiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios
              </label>
              <textarea
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all min-h-[60px]"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Escriba aquí los comentarios de la cotización"
              />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <button
                type="button"
                disabled={loadingMtto || !info || !bodegaSeleccionada || !revisionSeleccionada || !yearModel}
                onClick={() => refetchMtto()}
                className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Search size={16} />
                <span>{loadingMtto ? "Cargando..." : "Cargar Mtto"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tablas de totales por grupo (ACDelco / GM) */}
      {mantenimiento && ((mantenimiento as any).grupos ?? []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(((mantenimiento as any).grupos ?? []) as any[]).map((g: any) => {
              const totales = totalPorGrupo[g.grupo] || {
                totalRepuestos: 0,
                totalManoObra: 0,
                totalHoras: 0,
              };
              return (
                <div key={g.grupo} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="grupoMtto"
                        className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                        checked={grupoSeleccionado === g.grupo}
                        onChange={() => setGrupoSeleccionado(g.grupo as "ACDelco" | "GM")}
                      />
                      <span className="font-semibold">{g.grupo}</span>
                    </label>
                    <div className="text-xs text-gray-500">
                      Total horas taller:{" "}
                      <span className="font-semibold">
                        {totales.totalHoras.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <th className="text-right py-1 px-2 w-1/2">Subtotal repuestos</th>
                        <td className="text-right py-1 px-2 w-1/2">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(totales.totalRepuestos)}
                        </td>
                      </tr>
                      <tr>
                        <th className="text-right py-1 px-2 w-1/2">Subtotal mano de obra</th>
                        <td className="text-right py-1 px-2 w-1/2">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(totales.totalManoObra)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="text-right py-1 px-2 w-1/2">Total</th>
                        <td className="text-right py-1 px-2 w-1/2 font-semibold">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(totales.totalRepuestos + totales.totalManoObra)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => guardarMutation.mutate()}
              disabled={
                guardarMutation.isPending ||
                !mantenimiento ||
                !info ||
                !bodegaSeleccionada ||
                !revisionSeleccionada ||
                !yearModel ||
                !grupoSeleccionado
              }
              className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{guardarMutation.isPending ? "Guardando..." : "Guardar cotización"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {errorInfo && (
        <div className="text-sm text-red-500">
          {errorInfo}
        </div>
      )}
    </div>
  );
}

