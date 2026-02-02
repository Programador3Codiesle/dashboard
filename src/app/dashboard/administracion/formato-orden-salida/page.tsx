'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  formatoOrdenSalidaService,
  TipoSalida,
  CrearOrdenSalidaDTO,
} from "@/modules/administracion/services/formato-orden-salida.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useMisJefes } from "@/modules/usuarios/hooks/useJefes";

const AREAS = [
  "Administración",
  "Central de Beneficios",
  "Vehículos Nuevos",
  "Vehículos Usados",
  "Repuestos",
  "Taller Gasolina",
  "Taller Diesel",
  "Lamina y Pintura",
  "Alistamiento",
  "Contact Center",
  "Accesorios",
];

const SEDES = [
  "Giron",
  "Rosita",
  "Chevropartes",
  "Solochevrolet",
  "Barrancabermeja",
  "Bocono",
  "Malecon",
];

export default function FormatoOrdenSalidaPage() {
  const today = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const { user } = useAuth();
  const { jefes, isLoading: loadingJefes } = useMisJefes();

  const [tiposSalida, setTiposSalida] = useState<TipoSalida[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CrearOrdenSalidaDTO>({
    fecha_salida: today,
    area: "",
    sede: "Giron",
    jefe: 0,
    tipoSalida: 0,
    quienSale: "",
    placa: "",
    conductor: "",
    explicacion: "",
    id_empresa: user?.empresa ?? 1,
  });

  // Mantener sincronizado el id_empresa con el usuario autenticado
  useEffect(() => {
    if (user?.empresa) {
      setForm((prev) => ({
        ...prev,
        id_empresa: user.empresa!,
      }));
    }
  }, [user?.empresa]);

  const { showError, showSuccess } = useToast();
  const [selectedJefeNit, setSelectedJefeNit] = useState<number | null>(null);

  const showPlaca = useMemo(
    () => form.tipoSalida === 1 || form.tipoSalida === 15,
    [form.tipoSalida]
  );

  const showConductor = useMemo(
    () => [8, 10, 16, 18].includes(form.tipoSalida),
    [form.tipoSalida]
  );

  useEffect(() => {
    // Cargar tipos de salida cuando se seleccione un jefe específico
    const loadTipos = async () => {
      if (!selectedJefeNit) {
        setTiposSalida([]);
        return;
      }
      setLoadingTipos(true);
      try {
        const data = await formatoOrdenSalidaService.obtenerTiposSalida(selectedJefeNit);
        setTiposSalida(data);
      } catch (error) {
        console.error("Error cargando tipos de salida", error);
        showError("No se pudieron cargar los tipos de salida");
      } finally {
        setLoadingTipos(false);
      }
    };

    loadTipos();
  }, [selectedJefeNit, showError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "tipoSalida" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.area || !form.sede || !form.quienSale || !form.explicacion || !form.tipoSalida) {
      showError("Por favor diligencia todos los campos obligatorios.");
      return;
    }

    if (!jefes.length || !selectedJefeNit) {
      showError("No hay jefes configurados para este usuario.");
      return;
    }

    if (showPlaca && !form.placa) {
      showError("La placa del vehículo es obligatoria para este tipo de salida.");
      return;
    }

    if (showConductor && !form.conductor) {
      showError("El conductor es obligatorio para este tipo de salida.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await formatoOrdenSalidaService.crearOrdenSalida(form);
      if (!result.status) {
        showError(result.message || "No se pudo guardar la orden de salida.");
        return;
      }

      showSuccess("Los datos se guardaron correctamente.");
      setForm({
        fecha_salida: today,
        area: "",
        sede: "Giron",
        jefe: 0,
        tipoSalida: 0,
        quienSale: "",
        placa: "",
        conductor: "",
        explicacion: "",
        id_empresa: user?.empresa ?? form.id_empresa,
      });
      setSelectedJefeNit(null);
    } catch (error) {
      console.error("Error guardando formato orden de salida", error);
      showError("Ha ocurrido un error al guardar la información.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Formato Orden de Salida
          </h1>
          <p className="text-gray-500 mt-1">
            Diligencia la información para registrar una nueva orden de salida.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Código del formato
          </p>
          <p className="text-sm font-bold text-gray-800">SGC-FR02</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-lg border border-gray-100/80 p-6 md:p-8 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha_salida"
              min={today}
              value={form.fecha_salida}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Área a la que se autoriza la salida
            </label>
            <select
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            >
              <option value="">Seleccione una opción</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sede
            </label>
            <select
              name="sede"
              value={form.sede}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            >
              {SEDES.map((sede) => (
                <option key={sede} value={sede}>
                  {sede}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Jefe autoriza
            </label>
            <select
              name="jefe"
              value={selectedJefeNit ?? ""}
              onChange={(e) => {
                const nit = Number(e.target.value);
                const jefe = jefes.find((j) => j.nit && Number(j.nit) === nit);
                if (!jefe || !jefe.nit) {
                  setSelectedJefeNit(null);
                  setForm((prev) => ({ ...prev, jefe: 0, tipoSalida: 0 }));
                  setTiposSalida([]);
                  return;
                }
                setSelectedJefeNit(nit);
                setForm((prev) => ({ ...prev, jefe: nit, tipoSalida: 0 }));
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
              disabled={loadingJefes}
            >
              <option value="">
                {loadingJefes
                  ? "Cargando jefes..."
                  : jefes.length === 0
                  ? "No hay jefes configurados"
                  : "Seleccione una opción"}
              </option>
              {jefes.map((jefe) => (
                <option key={jefe.id} value={jefe.nit ?? ""}>
                  {jefe.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tipo de salida
            </label>
            <div className="relative">
              <select
                name="tipoSalida"
                value={form.tipoSalida || ""}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                required
                disabled={loadingTipos || !selectedJefeNit}
              >
                <option value="">Seleccione una opción</option>
                {tiposSalida.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
              {loadingTipos && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Persona que saldrá
            </label>
            <input
              type="text"
              name="quienSale"
              value={form.quienSale}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            />
          </div>

          {showPlaca && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Placa del vehículo
              </label>
              <input
                type="text"
                name="placa"
                value={form.placa ?? ""}
                onChange={(e) =>
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "placa",
                      value: e.target.value.toUpperCase(),
                    },
                  } as any)
                }
                className="w-full border border-amber-300 bg-amber-50 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          {showConductor && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Conductor
              </label>
              <input
                type="text"
                name="conductor"
                value={form.conductor ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Explicación
          </label>
          <textarea
            name="explicacion"
            value={form.explicacion}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-8 py-2.5 rounded-full brand-btn text-sm font-semibold shadow-md hover:opacity-90 focus:outline-none brand-focus-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Guardar
          </button>
        </div>
      </motion.form>
    </div>
  );
}

