'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Layers, ListChecks, AlertTriangle } from "lucide-react";
import {
  useAdicionalesLivianosInit,
  useCargarAdicionalLiviano,
  useCrearAdicionalLiviano,
  useListarAdicionalesLivianos,
  useUpdateEstadoAdicionalLiviano,
  useValidarCodigoRepuesto,
  useUpdateRepuestoAdicionalLiviano,
  useUpdateManoObraAdicionalLiviano,
  useDeleteRepuestoAdicionalLiviano,
  useDeleteManoObraAdicionalLiviano,
} from "@/modules/cotizador/hooks/useAdicionalesLivianos";
import { useToast } from "@/components/shared/ui/ToastContext";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
// Utilidad mínima para concatenar clases
const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");
import type {
  BulkManoObraAdicionalLivianoInput,
  BulkRepuestoAdicionalLivianoInput,
  AdicionalRepuestoLiviano,
  AdicionalManoObraLiviano,
} from "@/modules/cotizador/services/cotizador-adicionales-livianos.service";

type TabId = "crear" | "cargar" | "listar";

export default function AdicionalesLivianosPage() {
  const [activeTab, setActiveTab] = useState<TabId>("crear");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [adicionalSeleccionado, setAdicionalSeleccionado] = useState<number | "">("");
  const [clasesSeleccionadas, setClasesSeleccionadas] = useState<string[]>([]);
  const [repuestos, setRepuestos] = useState<BulkRepuestoAdicionalLivianoInput[]>([]);
  const [manoObra, setManoObra] = useState<BulkManoObraAdicionalLivianoInput[]>([]);
  const [filtroAdicionalLista, setFiltroAdicionalLista] = useState<number | "">("");
  const [filtroClasesLista, setFiltroClasesLista] = useState<string[]>([]);
  const [repuestoEdit, setRepuestoEdit] = useState<AdicionalRepuestoLiviano | null>(
    null
  );
  const [manoObraEdit, setManoObraEdit] = useState<AdicionalManoObraLiviano | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "repuesto" | "mano" | null;
    repuesto?: AdicionalRepuestoLiviano;
    manoObra?: AdicionalManoObraLiviano;
  }>({ open: false, type: null });

  const { data: init, loading: loadingInit, error: errorInit } =
    useAdicionalesLivianosInit();
  const crearMutation = useCrearAdicionalLiviano();
  const cargarMutation = useCargarAdicionalLiviano();
  const updateEstadoMutation = useUpdateEstadoAdicionalLiviano();
  const validarCodigoMutation = useValidarCodigoRepuesto();
  const updateRepuestoMutation = useUpdateRepuestoAdicionalLiviano();
  const updateMoMutation = useUpdateManoObraAdicionalLiviano();
  const deleteRepuestoMutation = useDeleteRepuestoAdicionalLiviano();
  const deleteMoMutation = useDeleteManoObraAdicionalLiviano();
  const { showSuccess, showError, showInfo } = useToast();
  const toast = (opts: { title: string; description?: string; variant?: "destructive" }) => {
    const message = opts.description ?? opts.title;
    if (opts.variant === "destructive") {
      showError(message);
    } else {
      showSuccess(message);
    }
  };

  const {
    data: listaData,
    loading: loadingLista,
    refetch: refetchLista,
  } = useListarAdicionalesLivianos({
    adicionalId:
      typeof filtroAdicionalLista === "number" ? filtroAdicionalLista : undefined,
    clases: filtroClasesLista.length ? filtroClasesLista : undefined,
  });

  const handleCrear = async () => {
    const nombre = nuevoNombre.trim();
    if (nombre.length <= 5) {
      toast({
        title: "Nombre inválido",
        description:
          "El nombre del adicional debe tener más de 5 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Solo letras/espacios/ñ (similar al legacy)
    const soloLetras = /^[A-Za-zÑñÁÉÍÓÚÜáéíóúü ]+$/;
    if (!soloLetras.test(nombre)) {
      toast({
        title: "Caracteres no permitidos",
        description:
          "El nombre del adicional solo puede contener letras y espacios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await crearMutation.mutateAsync({ nombre });
      setNuevoNombre("");
      toast({
        title: "Adicional creado",
        description: "Se ha creado el adicional correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al crear adicional",
        description: error?.message ?? "No se pudo crear el adicional.",
        variant: "destructive",
      });
    }
  };

  const handleAgregarRepuestoFila = () => {
    // Validar que la última fila (si existe) esté completa antes de agregar otra (legacy)
    if (repuestos.length > 0) {
      const last = repuestos[repuestos.length - 1];
      if (
        !last.codigo.trim() ||
        !last.descripcion.trim() ||
        !last.cantidad ||
        !last.yearStart ||
        !last.yearEnd
      ) {
        toast({
          title: "Complete la fila anterior",
          description:
            "Para agregar una nueva fila de repuesto debe completar los campos de la anterior.",
          variant: "destructive",
        });
        return;
      }
    }

    const year = new Date().getFullYear();
    setRepuestos((prev) => [
      ...prev,
      {
        codigo: "",
        descripcion: "",
        cantidad: 1,
        yearStart: year,
        yearEnd: year,
        descuento: 0,
      },
    ]);
  };

  const handleAgregarManoObraFila = () => {
    // Validar que la última fila de mano de obra esté completa
    if (manoObra.length > 0) {
      const last = manoObra[manoObra.length - 1];
      if (
        !last.operacion.trim() ||
        !last.tiempo ||
        !last.valorMenos5 ||
        !last.valorMas5
      ) {
        toast({
          title: "Complete la fila anterior",
          description:
            "Para agregar una nueva fila de mano de obra debe completar los campos de la anterior.",
          variant: "destructive",
        });
        return;
      }
    }

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

  const validarFilaRepuesto = (r: BulkRepuestoAdicionalLivianoInput) => {
    const yearActual = new Date().getFullYear();
    if (!r.codigo.trim() || !r.descripcion.trim()) {
      return "Código y descripción son obligatorios.";
    }
    if (!r.cantidad || r.cantidad <= 0) {
      return "La cantidad debe ser mayor a cero.";
    }
    if (r.yearStart < 2000 || r.yearStart > yearActual + 1) {
      return `El año inicial debe estar entre 2000 y ${yearActual + 1}.`;
    }
    if (r.yearEnd < 2000 || r.yearEnd > yearActual + 1) {
      return `El año final debe estar entre 2000 y ${yearActual + 1}.`;
    }
    if (r.yearStart > r.yearEnd) {
      return "El año inicial no puede ser mayor al año final.";
    }
    if (r.descuento != null && (r.descuento < 0 || r.descuento > 100)) {
      return "El descuento debe estar entre 0 y 100.";
    }
    return null;
  };

  const validarFilaManoObra = (m: BulkManoObraAdicionalLivianoInput) => {
    if (!m.operacion.trim()) {
      return "La descripción de la operación es obligatoria.";
    }
    if (!m.tiempo || m.tiempo <= 0) {
      return "El tiempo debe ser mayor a cero.";
    }
    if (m.valorMenos5 <= 0 || m.valorMas5 <= 0) {
      return "Los valores de mano de obra deben ser mayores a cero.";
    }
    if (m.descuento != null && (m.descuento < 0 || m.descuento > 100)) {
      return "El descuento debe estar entre 0 y 100.";
    }
    return null;
  };

  const handleCargar = async () => {
    if (!adicionalSeleccionado || clasesSeleccionadas.length === 0) {
      toast({
        title: "Faltan datos",
        description:
          "Debe seleccionar un adicional y al menos una clase para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Validaciones tipo legacy: filas vacías
    const errores: string[] = [];

    repuestos.forEach((r, idx) => {
      const e = validarFilaRepuesto(r);
      if (e) errores.push(`Repuesto fila ${idx + 1}: ${e}`);
    });

    manoObra.forEach((m, idx) => {
      const e = validarFilaManoObra(m);
      if (e) errores.push(`Mano de obra fila ${idx + 1}: ${e}`);
    });

    if (errores.length > 0) {
      toast({
        title: "Errores en el formulario",
        description: errores.join(" "),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await cargarMutation.mutateAsync({
        adicionalId: adicionalSeleccionado as number,
        clases: clasesSeleccionadas,
        repuestos,
        manoObra,
      });

      const insertoAlgo =
        (result.repuestos_add ?? 0) > 0 || (result.mano_add ?? 0) > 0;

      if (insertoAlgo) {
        const partes: string[] = [];
        if (result.repuestos_add > 0) {
          partes.push(`Repuestos nuevos: ${result.repuestos_add}.`);
        }
        if (result.mano_add > 0) {
          partes.push(`Mano de obra nueva: ${result.mano_add}.`);
        }
        if (result.repuestos_fail > 0 || result.mano_fail > 0) {
          partes.push(
            "Algunos ítems no se agregaron porque ya existían para el adicional y las clases seleccionadas.",
          );
        }
        showSuccess(
          partes.length
            ? partes.join(" ")
            : "Adicional cargado correctamente.",
        );
      } else {
        showInfo(
          "No se registraron nuevos repuestos ni mano de obra; todos los ítems ya existen para el adicional y las clases seleccionadas.",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error al guardar adicional",
        description: error?.message ?? "No se pudo guardar el adicional.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.type) {
      setDeleteConfirm({ open: false, type: null });
      return;
    }
    try {
      if (deleteConfirm.type === "repuesto" && deleteConfirm.repuesto) {
        await deleteRepuestoMutation.mutateAsync({
          seq: deleteConfirm.repuesto.seq,
          codigo: deleteConfirm.repuesto.codigo,
          adicionalId: deleteConfirm.repuesto.adicionalId,
        });
        await refetchLista();
        showSuccess("Repuesto eliminado correctamente.");
      } else if (deleteConfirm.type === "mano" && deleteConfirm.manoObra) {
        await deleteMoMutation.mutateAsync({
          id: deleteConfirm.manoObra.id,
          operacion: deleteConfirm.manoObra.operacion,
          adicionalId: deleteConfirm.manoObra.adicionalId,
        });
        await refetchLista();
        showSuccess("Mano de obra eliminada correctamente.");
      }
    } catch (error: any) {
      toast({
        title: deleteConfirm.type === "repuesto" ? "Error al eliminar repuesto" : "Error al eliminar mano de obra",
        description: error?.message ?? "No se pudo completar la eliminación.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm({ open: false, type: null });
    }
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
          Adicionales Livianos
        </h1>
        <p className="text-gray-500 mt-1">
          Administración de adicionales de repuestos y mano de obra para el
          cotizador de vehículos livianos.
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
        className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white brand-bg brand-bg-hover focus:outline-none brand-focus-ring disabled:opacity-60 transition-all"
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
                      <thead className="uppercase tracking-wider text-xs bg-(--color-primary) text-white">
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
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                                  a.estado === 1
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                )}
                                onClick={async () => {
                                  const nuevoEstado = a.estado === 1 ? 0 : 1;
                                  try {
                                    await updateEstadoMutation.mutateAsync({
                                      id: a.id,
                                      estado: nuevoEstado,
                                    });
                                    toast({
                                      title: "Estado actualizado",
                                      description: `El adicional se ha ${nuevoEstado === 1 ? "habilitado" : "inhabilitado"} correctamente.`,
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Error al actualizar estado",
                                      description:
                                        error?.message ??
                                        "No se pudo actualizar el estado del adicional.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                {a.estado === 1 ? "Habilitado" : "Inhabilitado"}
                              </button>
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
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        setClasesSeleccionadas(clases.map((c) => c.clase))
                      }
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => setClasesSeleccionadas([])}
                    >
                      Limpiar
                    </button>
                  </div>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-(--color-primary) border border-(--color-primary) bg-white hover:bg-gray-50"
                  >
                    <PlusCircle size={14} />
                    Agregar fila
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="uppercase tracking-wider text-xs bg-(--color-primary) text-white">
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
                            onBlur={async () => {
                              const codigo = r.codigo.trim();
                              if (!codigo) return;
                              try {
                                const resp = await validarCodigoMutation.mutateAsync({
                                  codigo,
                                });
                                if (resp.response === "success" && resp.alterno) {
                                  // Simulación simple del comportamiento legacy:
                                  // priorizamos el código principal, pero si quiere cambiar a alterno
                                  // puede editar manualmente.
                                  setRepuestos((prev) =>
                                    prev.map((x, i) =>
                                      i === idx
                                        ? { ...x, codigo: resp.codigo ?? codigo }
                                        : x
                                    )
                                  );
                                  toast({
                                    title: "Código con alterno",
                                    description: `El código existe y tiene alterno ${resp.alterno}. Se usará ${resp.codigo}.`,
                                  });
                                } else if (resp.response === "error") {
                                  setRepuestos((prev) =>
                                    prev.map((x, i) =>
                                      i === idx ? { ...x, codigo: "" } : x
                                    )
                                  );
                                  toast({
                                    title: "Código no encontrado",
                                    description: `El código ingresado ${codigo} no existe en la base de datos de repuestos.`,
                                    variant: "destructive",
                                  });
                                }
                              } catch (error: any) {
                                toast({
                                  title: "Error al validar código",
                                  description:
                                    error?.message ??
                                    "No se pudo validar el código del repuesto.",
                                  variant: "destructive",
                                });
                              }
                            }}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-(--color-primary) border border-(--color-primary) bg-white hover:bg-gray-50"
                  >
                    <PlusCircle size={14} />
                    Agregar fila
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="uppercase tracking-wider text-xs bg-(--color-primary) text-white">
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
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        setFiltroClasesLista(clases.map((c) => c.clase))
                      }
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => setFiltroClasesLista([])}
                    >
                      Limpiar
                    </button>
                  </div>
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
                        <thead className="uppercase tracking-wider text-xs bg-(--color-primary) text-white">
                          <tr>
                            <th className="px-3 py-2 text-center">Clase</th>
                            <th className="px-3 py-2 text-center">Adicional</th>
                            <th className="px-3 py-2 text-center">Código</th>
                            <th className="px-3 py-2 text-left">Descripción</th>
                            <th className="px-3 py-2 text-center">Cantidad</th>
                            <th className="px-3 py-2 text-center">Año desde</th>
                            <th className="px-3 py-2 text-center">Año hasta</th>
                            <th className="px-3 py-2 text-center">% Desc.</th>
                            <th className="px-3 py-2 text-center">Opción</th>
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
                              <td className="px-3 py-1.5 text-center">
                                <div className="inline-flex gap-1">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-[11px] rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setRepuestoEdit(r)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-[11px] rounded border border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        open: true,
                                        type: "repuesto",
                                        repuesto: r,
                                      })
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!listaData || listaData.repuestos.length === 0) && (
                            <tr>
                              <td
                                colSpan={9}
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
                        <thead className="uppercase tracking-wider text-xs bg-(--color-primary) text-white">
                          <tr>
                            <th className="px-3 py-2 text-center">Clase</th>
                            <th className="px-3 py-2 text-center">Adicional</th>
                            <th className="px-3 py-2 text-left">Operación</th>
                            <th className="px-3 py-2 text-center">Tiempo</th>
                            <th className="px-3 py-2 text-center">Valor &lt; 5 años</th>
                            <th className="px-3 py-2 text-center">Valor &gt; 5 años</th>
                            <th className="px-3 py-2 text-center">% Desc.</th>
                            <th className="px-3 py-2 text-center">Opción</th>
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
                              <td className="px-3 py-1.5 text-center">
                                <div className="inline-flex gap-1">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-[11px] rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setManoObraEdit(m)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-[11px] rounded border border-red-300 text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        open: true,
                                        type: "mano",
                                        manoObra: m,
                                      })
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!listaData || listaData.manoObra.length === 0) && (
                            <tr>
                              <td
                                colSpan={8}
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

      {/* Modal edición repuesto */}
      {repuestoEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Actualizar repuesto:
              <br />
              <span className="text-xs font-normal text-gray-600">
                Clase: {repuestoEdit.clase} - Adicional:{" "}
                {repuestoEdit.adicionalNombre} - Código: {repuestoEdit.codigo} -{" "}
                {repuestoEdit.descripcion}
              </span>
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block mb-1 text-gray-700">Descripción</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                  value={repuestoEdit.descripcion}
                  onChange={(e) =>
                    setRepuestoEdit({
                      ...repuestoEdit,
                      descripcion: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={repuestoEdit.cantidad}
                    onChange={(e) =>
                      setRepuestoEdit({
                        ...repuestoEdit,
                        cantidad: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Descuento %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={repuestoEdit.descuento ?? 0}
                    onChange={(e) =>
                      setRepuestoEdit({
                        ...repuestoEdit,
                        descuento: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Año desde</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={repuestoEdit.year_start}
                    onChange={(e) =>
                      setRepuestoEdit({
                        ...repuestoEdit,
                        year_start: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Año hasta</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={repuestoEdit.year_end}
                    onChange={(e) =>
                      setRepuestoEdit({
                        ...repuestoEdit,
                        year_end: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 text-sm">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setRepuestoEdit(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg brand-bg text-white hover:opacity-90"
                onClick={async () => {
                  if (!repuestoEdit) return;
                  const yearActual = new Date().getFullYear();
                  if (
                    repuestoEdit.year_start < 2000 ||
                    repuestoEdit.year_start > yearActual + 1 ||
                    repuestoEdit.year_end < 2000 ||
                    repuestoEdit.year_end > yearActual + 1 ||
                    repuestoEdit.year_start > repuestoEdit.year_end
                  ) {
                    toast({
                      title: "Años inválidos",
                      description:
                        "Verifique que los años estén en el rango permitido y que el inicial no sea mayor al final.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    await updateRepuestoMutation.mutateAsync({
                      seq: repuestoEdit.seq,
                      descripcion: repuestoEdit.descripcion,
                      cantidad: repuestoEdit.cantidad,
                      yearStart: repuestoEdit.year_start,
                      yearEnd: repuestoEdit.year_end,
                      descuento: repuestoEdit.descuento ?? 0,
                    });
                    await refetchLista();
                    toast({
                      title: "Repuesto actualizado",
                      description: "El repuesto se actualizó correctamente.",
                    });
                    setRepuestoEdit(null);
                  } catch (error: any) {
                    toast({
                      title: "Error al actualizar repuesto",
                      description:
                        error?.message ??
                        "No se pudo actualizar la información del repuesto.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición mano de obra */}
      {manoObraEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Actualizar mano de obra:
              <br />
              <span className="text-xs font-normal text-gray-600">
                Clase: {manoObraEdit.clase} - Adicional:{" "}
                {manoObraEdit.adicionalNombre}
              </span>
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block mb-1 text-gray-700">Operación</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs"
                  rows={2}
                  value={manoObraEdit.operacion}
                  onChange={(e) =>
                    setManoObraEdit({
                      ...manoObraEdit,
                      operacion: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">Tiempo</label>
                  <input
                    type="number"
                    step={0.25}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={manoObraEdit.tiempo}
                    onChange={(e) =>
                      setManoObraEdit({
                        ...manoObraEdit,
                        tiempo: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Descuento %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={manoObraEdit.descuento ?? 0}
                    onChange={(e) =>
                      setManoObraEdit({
                        ...manoObraEdit,
                        descuento: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-700">
                    Valor &lt; 5 años
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={manoObraEdit.valor_menos_5anos}
                    onChange={(e) =>
                      setManoObraEdit({
                        ...manoObraEdit,
                        valor_menos_5anos: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">
                    Valor &gt; 5 años
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-right"
                    value={manoObraEdit.valor_mas_5anos}
                    onChange={(e) =>
                      setManoObraEdit({
                        ...manoObraEdit,
                        valor_mas_5anos: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 text-sm">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setManoObraEdit(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg brand-bg text-white hover:opacity-90"
                onClick={async () => {
                  if (!manoObraEdit) return;
                  if (
                    manoObraEdit.tiempo <= 0 ||
                    manoObraEdit.valor_menos_5anos <= 0 ||
                    manoObraEdit.valor_mas_5anos <= 0
                  ) {
                    toast({
                      title: "Valores inválidos",
                      description:
                        "Tiempo y valores de mano de obra deben ser mayores a cero.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    await updateMoMutation.mutateAsync({
                      id: manoObraEdit.id,
                      operacion: manoObraEdit.operacion,
                      tiempo: manoObraEdit.tiempo,
                      valorMenos5: manoObraEdit.valor_menos_5anos,
                      valorMas5: manoObraEdit.valor_mas_5anos,
                      descuento: manoObraEdit.descuento ?? 0,
                    });
                    await refetchLista();
                    toast({
                      title: "Mano de obra actualizada",
                      description: "La mano de obra se actualizó correctamente.",
                    });
                    setManoObraEdit(null);
                  } catch (error: any) {
                    toast({
                      title: "Error al actualizar mano de obra",
                      description:
                        error?.message ??
                        "No se pudo actualizar la información de mano de obra.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirm.open}
        title={
          deleteConfirm.type === "repuesto"
            ? "Eliminar repuesto"
            : "Eliminar mano de obra"
        }
        message={
          deleteConfirm.type === "repuesto" && deleteConfirm.repuesto
            ? `¿Está seguro de eliminar el repuesto ${deleteConfirm.repuesto.codigo} del adicional ${deleteConfirm.repuesto.adicionalNombre}?`
            : deleteConfirm.type === "mano" && deleteConfirm.manoObra
              ? `¿Está seguro de eliminar la operación de mano de obra del adicional ${deleteConfirm.manoObra.adicionalNombre}?`
              : "¿Está seguro de eliminar este registro?"
        }
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, type: null })}
      />
    </div>
  );
}

