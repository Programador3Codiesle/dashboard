'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  useAplicarEdicion,
  useEdicionClases,
  useEdicionFiltroOpciones,
  useEdicionTablas,
} from "@/modules/cotizador/hooks/useEdicionConfig";
import type { TablaKeyEdicion } from "@/modules/cotizador/services/cotizador-edicion-config.service";

type TipoVehiculo = "livianos" | "pesados";
type TipoRegistro = "repuesto" | "mano";
type TipoMano = "adicional" | "trabajos";

function mapToTablaKey(
  tipoVehiculo: TipoVehiculo,
  tipoRegistro: TipoRegistro,
  tipoMano: TipoMano | null
): TablaKeyEdicion | null {
  if (tipoVehiculo === "livianos" && tipoRegistro === "repuesto") {
    return "livianos_repuesto";
  }
  if (tipoVehiculo === "pesados" && tipoRegistro === "repuesto") {
    return "pesados_repuesto";
  }
  if (tipoVehiculo === "livianos" && tipoRegistro === "mano") {
    if (tipoMano === "adicional") return "livianos_mano_adicional";
    if (tipoMano === "trabajos") return "livianos_mano_trabajos";
  }
  if (tipoVehiculo === "pesados" && tipoRegistro === "mano") {
    if (tipoMano === "adicional") return "pesados_mano_adicional";
    if (tipoMano === "trabajos") return "pesados_mano_trabajos";
  }
  return null;
}

export default function EditarRepuestoManoObraPage() {
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>("livianos");
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>("repuesto");
  const [tipoMano, setTipoMano] = useState<TipoMano | null>(null);

  const tablaKey = useMemo(
    () => mapToTablaKey(tipoVehiculo, tipoRegistro, tipoMano),
    [tipoVehiculo, tipoRegistro, tipoMano]
  );

  const { data: tablasConfig, loading: loadingTablas, error: errorTablas } =
    useEdicionTablas();
  const aplicarMutation = useAplicarEdicion();

  const tablaConfig = useMemo(
    () => tablasConfig?.find((t) => t.key === tablaKey) ?? null,
    [tablasConfig, tablaKey]
  );

  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [campos, setCampos] = useState<Record<string, string>>({});

  const filtrosConfig = tablaConfig?.filtros ?? [];
  const filtro1 = filtrosConfig[0] ?? null;
  const filtro2 = filtrosConfig[1] ?? null;
  const filtro3 = filtrosConfig[2] ?? null;

  const { data: opcionesFiltro1 } = useEdicionFiltroOpciones({
    tablaKey,
    filtro: filtro1,
    whereParcial: {},
  });

  const { data: opcionesFiltro2 } = useEdicionFiltroOpciones({
    tablaKey,
    filtro: filtro2,
    whereParcial:
      filtro1 != null
        ? {
            [filtro1]: filtros[filtro1] ?? "",
          }
        : {},
  });

  const { data: opcionesFiltro3 } = useEdicionFiltroOpciones({
    tablaKey,
    filtro: filtro3,
    whereParcial: {
      ...(filtro1 != null ? { [filtro1]: filtros[filtro1] ?? "" } : {}),
      ...(filtro2 != null ? { [filtro2]: filtros[filtro2] ?? "" } : {}),
    },
  });

  const handleAplicar = async () => {
    if (!tablaKey || !tablaConfig) return;

    // Normalizar filtros: sólo los permitidos por la tabla y con valor
    const filtrosValidos: Record<string, string> = {};
    for (const key of tablaConfig.filtros) {
      const val = filtros[key];
      if (val !== undefined && val !== "") {
        filtrosValidos[key] = val;
      }
    }

    // Normalizar campos: sólo columnas editables con valor
    const camposValidos: Record<string, string> = {};
    for (const col of tablaConfig.columnas_editables) {
      const val = campos[col];
      if (val !== undefined && val !== "") {
        camposValidos[col] = val;
      }
    }

    if (!Object.keys(filtrosValidos).length || !Object.keys(camposValidos).length) {
      return;
    }

    await aplicarMutation.mutateAsync({
      tablaKey,
      filtros: filtrosValidos,
      campos: camposValidos,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Editar repuesto / mano de obra
        </h1>
        <p className="text-gray-500 mt-1">
          Configura filtros y campos a editar para aplicar cambios masivos sobre
          las tablas de mantenimiento del cotizador.
        </p>
      </div>

      {errorTablas && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={18} />
          {errorTablas}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Bloque selección tipo */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-100 p-5 space-y-4 bg-gray-50/60">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              1. Tipo de información
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  Tipo de vehículo
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "livianos", label: "Livianos" },
                    { id: "pesados", label: "Pesados" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTipoVehiculo(opt.id as TipoVehiculo);
                        setFiltros({});
                        setCampos({});
                        aplicarMutation.reset();
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        tipoVehiculo === opt.id
                          ? "border-(--color-primary) text-(--color-primary) bg-gray-50"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                  Tipo de registro
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "repuesto", label: "Repuesto" },
                    { id: "mano", label: "Mano de obra" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTipoRegistro(opt.id as TipoRegistro);
                        setTipoMano(null);
                        setFiltros({});
                        setCampos({});
                        aplicarMutation.reset();
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        tipoRegistro === opt.id
                          ? "border-(--color-primary) text-(--color-primary) bg-gray-50"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {tipoRegistro === "mano" && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1.5">
                    Tipo de mano de obra
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "adicional", label: "Adicionales" },
                      { id: "trabajos", label: "Trabajos" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTipoMano(opt.id as TipoMano);
                          setFiltros({});
                          setCampos({});
                          aplicarMutation.reset();
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          tipoMano === opt.id
                            ? "border-(--color-primary) text-(--color-primary) bg-gray-50"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-1 text-xs text-gray-500">
                Tabla seleccionada:{" "}
                {loadingTablas
                  ? "Cargando..."
                  : tablaConfig
                  ? tablaConfig.tabla
                  : "Seleccione combinaciones válidas."}
              </div>
            </div>
          </div>

          {/* Bloque filtros */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              2. Filtros
            </h2>

            {!tablaConfig ? (
              <p className="text-xs text-gray-500">
                Selecciona primero el tipo de vehículo, registro y mano de obra
                (si aplica) para habilitar los filtros.
              </p>
            ) : (
              <div className="space-y-3">
                {filtrosConfig.map((filtroNombre, index) => {
                  const esClase = filtroNombre === tablaConfig.columna_clase;
                  const labelBase = esClase
                    ? "Clase"
                    : filtroNombre.charAt(0).toUpperCase() +
                      filtroNombre.slice(1).replace(/_/g, " ");

                  const opciones =
                    index === 0
                      ? opcionesFiltro1
                      : index === 1
                      ? opcionesFiltro2
                      : opcionesFiltro3;

                  return (
                    <div key={filtroNombre}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {labelBase}
                      </label>
                      <select
                        className="block w-full border border-gray-300 rounded-xl p-2 text-xs bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
                        value={filtros[filtroNombre] ?? ""}
                        onChange={(e) =>
                          setFiltros((prev) => {
                            const value = e.target.value;
                            const next: Record<string, string> = {
                              ...prev,
                              [filtroNombre]: value,
                            };
                            // Limpiar filtros dependientes cuando cambia uno anterior
                            for (let i = index + 1; i < filtrosConfig.length; i++) {
                              delete next[filtrosConfig[i]];
                            }
                            return next;
                          })
                        }
                      >
                        <option value="">
                          {esClase ? "Todas las clases" : "Todos"}
                        </option>
                        {opciones?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bloque campos a editar */}
          <div className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              3. Campos a editar
            </h2>

            {!tablaConfig ? (
              <p className="text-xs text-gray-500">
                Selecciona primero tipo y filtros para habilitar la edición.
              </p>
            ) : (
              <div className="space-y-3">
                {tablaConfig.columnas_editables.map((col) => (
                  <div key={col} className="flex items-center gap-2">
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-600">
                        {col}
                      </label>
                    </div>
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-xl px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
                      value={campos[col] ?? ""}
                      onChange={(e) =>
                        setCampos((prev) => ({
                          ...prev,
                          [col]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}

                <div className="pt-2 border-t border-dashed border-gray-200 mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleAplicar}
                    disabled={
                      !tablaKey ||
                      !Object.keys(filtros).length ||
                      !Object.keys(campos).length ||
                      aplicarMutation.isPending
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-(--color-primary) hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2 disabled:opacity-60 transition-all"
                  >
                    {aplicarMutation.isPending ? "Aplicando..." : "Aplicar edición"}
                  </button>

                  {aplicarMutation.data && (
                    <p className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                      <CheckCircle2 size={14} />
                      Registros afectados:{" "}
                      <span className="font-semibold">
                        {aplicarMutation.data.affectedRows}
                      </span>
                    </p>
                  )}

                  {!aplicarMutation.data && (
                    <p className="text-[11px] text-gray-400">
                      La edición se aplicará sobre todos los registros que
                      cumplan los filtros definidos.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

