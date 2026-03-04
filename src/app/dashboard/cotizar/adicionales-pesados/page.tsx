'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Layers, ListChecks, AlertTriangle } from "lucide-react";
import {
  useAdicionalesPesadosInit,
  useCargarAdicionalPesado,
  useCrearAdicionalPesado,
  useListarAdicionalesPesados,
} from "@/modules/cotizador/hooks/useAdicionalesPesados";
import type {
  BulkManoObraAdicionalPesadoInput,
  BulkRepuestoAdicionalPesadoInput,
} from "@/modules/cotizador/services/cotizador-adicionales-pesados.service";

type TabId = "crear" | "cargar" | "listar";

export default function AdicionalesPesadosPage() {
  const [activeTab, setActiveTab] = useState<TabId>("crear");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [adicionalSeleccionado, setAdicionalSeleccionado] = useState<number | "">("");
  const [clasesSeleccionadas, setClasesSeleccionadas] = useState<string[]>([]);
  const [repuestos, setRepuestos] = useState<BulkRepuestoAdicionalPesadoInput[]>([]);
  const [manoObra, setManoObra] = useState<BulkManoObraAdicionalPesadoInput[]>([]);
  const [filtroAdicionalLista, setFiltroAdicionalLista] = useState<number | "">("");
  const [filtroClasesLista, setFiltroClasesLista] = useState<string[]>([]);

  const { data: init, loading: loadingInit, error: errorInit } =
    useAdicionalesPesadosInit();
  const crearMutation = useCrearAdicionalPesado();
  const cargarMutation = useCargarAdicionalPesado();

  const { data: listaData, loading: loadingLista } = useListarAdicionalesPesados({
    adicionalId:
      typeof filtroAdicionalLista === "number" ? filtroAdicionalLista : undefined,
    clases: filtroClasesLista.length ? filtroClasesLista : undefined,
  });

  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    await crearMutation.mutateAsync({ nombre: nuevoNombre });
    setNuevoNombre("");
  };

  const handleAgregarRepuestoFila = () => {
    setRepuestos((prev) => [
      ...prev,
      {
        codigo: "",
        descripcion: "",
        cantidad: 1,
        yearStart: new Date().getFullYear(),
        yearEnd: new Date().getFullYear(),
        descuento: 0,
      },
    ]);
  };

  const handleAgregarManoObraFila = () => {
    setManoObra((prev) => [
      ...prev,
      {
        operacion: "",
        tiempo: 1,
        valorMenos5: 0,
        valorMas5: 0,
        descuento: 0,
      },
    ]);
  };

  const handleCargar = async () => {
    if (!adicionalSeleccionado || clasesSeleccionadas.length === 0) return;
    await cargarMutation.mutateAsync({
      adicionalId: adicionalSeleccionado as number,
      clases: clasesSeleccionadas,
      repuestos,
      manoObra,
    });
  };

  const clases = init?.clases ?? [];
  const adicionales = init?.adicionales ?? [];

  const clasesMap = useMemo(
    () => new Map(clases.map((c) => [c.clase, c.descripcion])),
    [clases]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Adicionales Pesados
        </h1>
        <p className="text-gray-500 mt-1">
          Administración de adicionales de repuestos y mano de obra para el
          cotizador de vehículos pesados.
        </p>
      </div>

      {errorInit && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={18} />
          {errorInit}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            {[
              { id: "crear", label: "Crear adicionales", icon: PlusCircle },
              { id: "cargar", label: "Cargar adicionales", icon: Layers },
              { id: "listar", label: "Lista adicionales", icon: ListChecks },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-(--color-primary) text-(--color-primary) bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 space-y-6">
          {activeTab === "crear" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Crear nuevo adicional
              </h2>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre nuevo adicional
                  </label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value.toUpperCase())}
                    className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                    placeholder="EJ: LAVADO, POLICHADO..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCrear}
                  disabled={crearMutation.isPending || !nuevoNombre.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-(--color-primary) hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2 disabled:opacity-60 transition-all"
                >
                  <PlusCircle size={18} />
                  Crear
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Adicionales disponibles
                </h3>
                {loadingInit ? (
                  <p className="text-sm text-gray-500">Cargando...</p>
                ) : (
                  <div className="max-h-64 overflow-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Adicional</th>
                          <th className="px-4 py-2 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {adicionales.map((a) => (
                          <tr key={a.id} className="hover:bg-gray-50/80">
                            <td className="px-4 py-2 text-gray-800">{a.id}</td>
                            <td className="px-4 py-2 text-gray-800">
                              {a.adicional}
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                                  a.estado === 1
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {a.estado === 1 ? "Habilitado" : "Inhabilitado"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {adicionales.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-4 text-center text-gray-500"
                            >
                              No hay adicionales registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "cargar" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Cargar repuestos y mano de obra a adicionales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adicional
                  </label>
                  <select
                    className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                    value={adicionalSeleccionado}
                    onChange={(e) =>
                      setAdicionalSeleccionado(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    <option value="">Seleccione un adicional</option>
                    {adicionales.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.adicional}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clases
                  </label>
                  <select
                    multiple
                    className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white h-32 outline-none"
                    value={clasesSeleccionadas}
                    onChange={(e) =>
                      setClasesSeleccionadas(
                        Array.from(e.target.selectedOptions).map(
                          (o) => o.value
                        )
                      )
                    }
                  >
                    {clases.map((c) => (
                      <option key={c.clase} value={c.clase}>
                        {c.clase} - {c.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Repuestos
                  </h3>
                  <button
                    type="button"
                    onClick={handleAgregarRepuestoFila}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
                  >
                    <PlusCircle size={14} />
                    Agregar fila
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left">Código</th>
                        <th className="px-3 py-2 text-left">Descripción</th>
                        <th className="px-3 py-2 text-center">Cantidad</th>
                        <th className="px-3 py-2 text-center">Año inicial</th>
                        <th className="px-3 py-2 text-center">Año final</th>
                        <th className="px-3 py-2 text-center">% Desc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {repuestos.map((r, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="px-3 py-1.5">
                            <input
                              value={r.codigo}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, codigo: e.target.value.toUpperCase() }
                                      : x
                                  )
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              value={r.descripcion}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          descripcion: e.target.value.toUpperCase(),
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={r.cantidad}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, cantidad: Number(e.target.value) || 0 }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={r.yearStart}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, yearStart: Number(e.target.value) || 0 }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={r.yearEnd}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, yearEnd: Number(e.target.value) || 0 }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={r.descuento ?? 0}
                              onChange={(e) =>
                                setRepuestos((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          descuento: Number(e.target.value) || 0,
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                        </tr>
                      ))}
                      {repuestos.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-3 py-3 text-center text-gray-500"
                          >
                            No hay filas de repuestos. Usa “Agregar fila”.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Mano de obra
                  </h3>
                  <button
                    type="button"
                    onClick={handleAgregarManoObraFila}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
                  >
                    <PlusCircle size={14} />
                    Agregar fila
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left">Operación</th>
                        <th className="px-3 py-2 text-center">Tiempo</th>
                        <th className="px-3 py-2 text-center">Valor &lt; 5 años</th>
                        <th className="px-3 py-2 text-center">Valor &gt; 5 años</th>
                        <th className="px-3 py-2 text-center">% Desc.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {manoObra.map((m, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="px-3 py-1.5">
                            <textarea
                              value={m.operacion}
                              onChange={(e) =>
                                setManoObra((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          operacion: e.target.value.toUpperCase(),
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                              rows={1}
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              step="0.25"
                              value={m.tiempo}
                              onChange={(e) =>
                                setManoObra((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, tiempo: Number(e.target.value) || 0 }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={m.valorMenos5}
                              onChange={(e) =>
                                setManoObra((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          valorMenos5: Number(e.target.value) || 0,
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={m.valorMas5}
                              onChange={(e) =>
                                setManoObra((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          valorMas5: Number(e.target.value) || 0,
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={m.descuento ?? 0}
                              onChange={(e) =>
                                setManoObra((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          descuento: Number(e.target.value) || 0,
                                        }
                                      : x
                                  )
                                )
                              }
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center"
                            />
                          </td>
                        </tr>
                      ))}
                      {manoObra.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-3 text-center text-gray-500"
                          >
                            No hay filas de mano de obra. Usa “Agregar fila”.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCargar}
                  disabled={
                    cargarMutation.isPending ||
                    !adicionalSeleccionado ||
                    clasesSeleccionadas.length === 0
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-(--color-primary) hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2 disabled:opacity-60 transition-all"
                >
                  {cargarMutation.isPending ? "Guardando..." : "Guardar adicional"}
                </button>
                {cargarMutation.data && (
                  <p className="mt-2 text-xs text-gray-600">
                    Repuestos OK: {cargarMutation.data.repuestos_add} | Repuestos
                    fallidos: {cargarMutation.data.repuestos_fail} | Mano OK:{" "}
                    {cargarMutation.data.mano_add} | Mano fallida:{" "}
                    {cargarMutation.data.mano_fail}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "listar" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Lista de adicionales (repuestos y mano de obra)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adicional
                  </label>
                  <select
                    className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                    value={filtroAdicionalLista}
                    onChange={(e) =>
                      setFiltroAdicionalLista(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    <option value="">Todos</option>
                    {adicionales.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.adicional}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clases
                  </label>
                  <select
                    multiple
                    className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white h-32 outline-none"
                    value={filtroClasesLista}
                    onChange={(e) =>
                      setFiltroClasesLista(
                        Array.from(e.target.selectedOptions).map((o) => o.value)
                      )
                    }
                  >
                    {clases.map((c) => (
                      <option key={c.clase} value={c.clase}>
                        {c.clase} - {c.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Repuestos
                  </h3>
                  {loadingLista ? (
                    <p className="text-sm text-gray-500">Cargando...</p>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-xs">
                        <thead className="bg-white text-gray-600 uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2 text-center">Clase</th>
                            <th className="px-3 py-2 text-center">Adicional</th>
                            <th className="px-3 py-2 text-center">Código</th>
                            <th className="px-3 py-2 text-left">Descripción</th>
                            <th className="px-3 py-2 text-center">Cantidad</th>
                            <th className="px-3 py-2 text-center">Año desde</th>
                            <th className="px-3 py-2 text-center">Año hasta</th>
                            <th className="px-3 py-2 text-center">% Desc.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {listaData?.repuestos?.map((r) => (
                            <tr key={r.seq} className="hover:bg-gray-50/80">
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {r.clase}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {r.adicionalNombre}
                              </td>
                              <td className="px-3 py-1.5 text-center font-mono text-gray-800">
                                {r.codigo}
                              </td>
                              <td className="px-3 py-1.5 text-gray-800">
                                {r.descripcion}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {r.cantidad}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {r.year_start}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {r.year_end}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {r.descuento ?? 0}
                              </td>
                            </tr>
                          ))}
                          {(!listaData || listaData.repuestos.length === 0) && (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-3 py-3 text-center text-gray-500"
                              >
                                No hay repuestos para los filtros seleccionados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Mano de obra
                  </h3>
                  {loadingLista ? (
                    <p className="text-sm text-gray-500">Cargando...</p>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-xs">
                        <thead className="bg-white text-gray-600 uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2 text-center">Clase</th>
                            <th className="px-3 py-2 text-center">Adicional</th>
                            <th className="px-3 py-2 text-left">Operación</th>
                            <th className="px-3 py-2 text-center">Tiempo</th>
                            <th className="px-3 py-2 text-center">Valor &lt; 5 años</th>
                            <th className="px-3 py-2 text-center">Valor &gt; 5 años</th>
                            <th className="px-3 py-2 text-center">% Desc.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {listaData?.manoObra?.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50/80">
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {m.clase}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {m.adicionalNombre}
                              </td>
                              <td className="px-3 py-1.5 text-gray-800">
                                {m.operacion}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-800">
                                {m.tiempo}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {m.valor_menos_5anos}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {m.valor_mas_5anos}
                              </td>
                              <td className="px-3 py-1.5 text-center text-gray-700">
                                {m.descuento ?? 0}
                              </td>
                            </tr>
                          ))}
                          {(!listaData || listaData.manoObra.length === 0) && (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-3 py-3 text-center text-gray-500"
                              >
                                No hay mano de obra para los filtros seleccionados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

