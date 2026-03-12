'use client';

import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/core/auth/hooks/useAuth";

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
  const [tipoMantenimiento, setTipoMantenimiento] = useState<string>("");
  const [adicionalSeleccionado, setAdicionalSeleccionado] = useState<string>("");

  const [repuestosState, setRepuestosState] = useState<any[]>([]);
  const [manoObraState, setManoObraState] = useState<any[]>([]);

  const [openPosibleRetorno, setOpenPosibleRetorno] = useState(false);
  const [posibleRetornoPlaca, setPosibleRetornoPlaca] = useState("");
  const [posibleRetornoBodega, setPosibleRetornoBodega] = useState<string>("");
  const [posibleRetornoTipo, setPosibleRetornoTipo] = useState<string>("");
  const [posibleRetornoObs, setPosibleRetornoObs] = useState("");
  const [posibleRetornoSubmitting, setPosibleRetornoSubmitting] = useState(false);

  const [openAdicionalModal, setOpenAdicionalModal] = useState(false);
  const [adicionalModalData, setAdicionalModalData] = useState<{
    soloManoObra: boolean;
    repuestos: any[];
    manoObra: any[];
  } | null>(null);
  const [adicionalModalLoading, setAdicionalModalLoading] = useState(false);

  const { user } = useAuth();

  const { showSuccess, showError } = useToast();

  const { data: initData, loading: loadingInit, error: errorInit } = useCotizadorLivianosInit();
  const { vehiculo, loading: loadingVehiculo, error: errorVehiculo } = useVehiculoPorPlaca(placaConsultada);
  const vehiculoClase = (vehiculo as any)?.clase ?? null;
  const { revisiones, loading: loadingRevisiones } = useRevisionesLivianos(vehiculoClase);

  const kmActual = (vehiculo as any)?.kilometraje ?? 0;
  const kmClienteValido =
    kilometrajeCliente.trim() !== "" &&
    !Number.isNaN(Number(kilometrajeCliente)) &&
    Number(kilometrajeCliente) > kmActual;

  const { detalle, loading: loadingDetalle } = useRevisionDetalleLivianos({
    bodega: bodegaSeleccionada,
    clase: vehiculoClase,
    revision: revisionSeleccionada,
    // Sólo cargamos la plantilla automática en MTTO GARANTÍA.
    kmClienteValido: kmClienteValido && tipoMantenimiento === "0",
    yearModel: (vehiculo as any)?.year ?? null,
  });

  // Mostrar errores de búsqueda por placa como toast usando el sistema global
  useEffect(() => {
    if (errorVehiculo) {
      showError(errorVehiculo);
    }
  }, [errorVehiculo, showError]);

  // Cuando cambia la empresa seleccionada en el dashboard, reseteamos el submódulo
  useEffect(() => {
    // Reset de búsqueda y datos de cotización
    setPlacaBusqueda("");
    setPlacaConsultada(null);
    setBodegaSeleccionada(null);
    setRevisionSeleccionada(null);
    setKilometrajeCliente("");
    setTelefonoCliente("");
    setEmailCliente("");
    setObservaciones("");
    setAgendarCita(false);
    setTipoMantenimiento("");
    setAdicionalSeleccionado("");
    setRepuestosState([]);
    setManoObraState([]);
    setOpenAdicionalModal(false);
    setAdicionalModalData(null);
    setAdicionalRepuestosSeleccionados({});
    setAdicionalManoSeleccionados({});
  }, [user?.empresa]);

  // Cuando cambia el tipo de mantenimiento, reseteamos selección y tablas
  useEffect(() => {
    // Si aún no hay vehículo cargado, no hacemos nada
    if (!vehiculo) return;

    setRevisionSeleccionada(null);
    setKilometrajeCliente("");
    setAgendarCita(false);
    setObservaciones("");
    setAdicionalSeleccionado("");
    setRepuestosState([]);
    setManoObraState([]);
  }, [tipoMantenimiento, vehiculo]);

  useEffect(() => {
    if (!detalle) {
      setRepuestosState([]);
      setManoObraState([]);
      return;
    }

    const repuestos = ((detalle as any).repuestos ?? []).map((r: any) => {
      const obligatorio =
        r.categoria === "MANDATORIO" || r.categoria === "MANDATORIO CODIESEL";
      return {
        ...r,
        obligatorio,
        autorizado: obligatorio,
      };
    });

    const manoObra = ((detalle as any).manoObra ?? []).map((m: any) => ({
      ...m,
      autorizado: true,
    }));

    setRepuestosState(repuestos);
    setManoObraState(manoObra);
  }, [detalle]);

  const bodegasOptions = useMemo(() => {
    const raw = initData?.bodegas ?? [];
    // En el legacy para livianos sólo se muestran estas bodegas con estos labels.
    const labels: Record<number, string> = {
      1: "Girón Gasolina",
      6: "Barranca",
      7: "Rosita",
      8: "Cúcuta",
    };

    const filtered = raw.filter((b: any) => [1, 6, 7, 8].includes(Number(b.bodega)));

    return filtered.map((b: any) => ({
      ...b,
      descripcion: labels[b.bodega] ?? b.descripcion,
    }));
  }, [initData?.bodegas]);

  const handleBuscarVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizada = placaBusqueda.trim().toUpperCase();
    if (!normalizada) return;
    setPlacaConsultada(normalizada);
    setBodegaSeleccionada(null);
    setRevisionSeleccionada(null);
    setKilometrajeCliente("");
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
    () =>
      (repuestosState ?? [])
        .filter((r: any) => r.autorizado)
        .reduce((acc: number, r: any) => acc + r.valor, 0),
    [repuestosState]
  );

  const totalManoObra = useMemo(
    () =>
      (manoObraState ?? [])
        .filter((m: any) => m.autorizado)
        .reduce((acc: number, m: any) => acc + m.valor_unitario, 0),
    [manoObraState]
  );

  const totalGeneral = totalRepuestos + totalManoObra;

  const handleToggleRepuesto = (seq: number) => {
    setRepuestosState((prev) =>
      prev.map((r: any) => {
        if (r.seq !== seq) return r;
        const nextAutorizado = !r.autorizado;
        if (r.obligatorio && !nextAutorizado) {
          // Deferimos el toast al siguiente tick para evitar
          // el warning de React sobre actualizar otro componente
          // (ToastProvider) mientras se renderiza esta página.
          setTimeout(() => {
            showError("Este repuesto es mandatorio y no puede ser desautorizado.");
          }, 0);
          return r;
        }
        return { ...r, autorizado: nextAutorizado };
      })
    );
  };

  const handleToggleManoObra = (operacion: string) => {
    setManoObraState((prev) =>
      prev.map((m: any) =>
        m.operacion === operacion ? { ...m, autorizado: !m.autorizado } : m
      )
    );
  };

  const handleAgregarAdicionalClick = async () => {
    if (tipoMantenimiento === "") {
      showError("Seleccione el tipo de mantenimiento.");
      return;
    }
    if (!adicionalSeleccionado) {
      showError("Seleccione el adicional.");
      return;
    }
    if (tipoMantenimiento === "0" && adicionalSeleccionado !== "2") {
      showError(
        "Solo puedes agregar Diagnóstico como adicional cuando el tipo de mantenimiento es MTTO GARANTÍA.",
      );
      return;
    }
    const v = vehiculo as any;
    if (!v?.clase || bodegaSeleccionada == null) {
      showError("Seleccione bodega y asegure tener datos del vehículo.");
      return;
    }
    setAdicionalModalLoading(true);
    try {
      const data = await cotizadorLivianosService.getAdicionalesModal({
        clase: v.clase,
        bodega: bodegaSeleccionada,
        adicional: Number(adicionalSeleccionado),
        year: v.year ?? new Date().getFullYear(),
      });
      setAdicionalModalData(data);
      setOpenAdicionalModal(true);
    } catch (e: any) {
      showError(e?.message ?? "No se pudieron cargar los datos del adicional.");
    } finally {
      setAdicionalModalLoading(false);
    }
  };

  const yearActual = new Date().getFullYear();
  const vehiculoYear = (vehiculo as any)?.year ?? yearActual;
  const usarValorMenos5 = yearActual - vehiculoYear <= 5;

  const handleAgregarManoObraAdicional = (mo: any) => {
    const valor = usarValorMenos5 ? Number(mo.valor_menos_5anos) : Number(mo.valor_mas_5anos);
    setManoObraState((prev) => [
      ...prev,
      {
        operacion: mo.operacion,
        descripcion_operacion: mo.operacion,
        valor_unitario: valor,
        cant_horas: Number(mo.tiempo) || 0,
        autorizado: true,
        adicional: mo.name_adicional ?? "Adicional",
      },
    ]);
    showSuccess(`Operación "${mo.operacion}" agregada a la cotización.`);
  };

  const [adicionalRepuestosSeleccionados, setAdicionalRepuestosSeleccionados] = useState<
    Record<string, boolean>
  >({});
  const [adicionalManoSeleccionados, setAdicionalManoSeleccionados] = useState<
    Record<string, boolean>
  >({});

  const totalModalRepuestos = useMemo(() => {
    if (!adicionalModalData?.repuestos?.length) return 0;
    return adicionalModalData.repuestos.reduce((acc: number, r: any) => {
      const key = String(r.codigo);
      if (!adicionalRepuestosSeleccionados[key]) return acc;
      const precio = Number(r.Valor ?? r.valor ?? 0);
      const desc = Number(r.descuento ?? 0) / 100;
      const precioConDesc = Math.round(precio * (1 - desc));
      return acc + precioConDesc;
    }, 0);
  }, [adicionalModalData?.repuestos, adicionalRepuestosSeleccionados]);

  const totalModalManoObra = useMemo(() => {
    if (!adicionalModalData?.manoObra?.length) return 0;
    return adicionalModalData.manoObra.reduce((acc: number, mo: any) => {
      const key = String(mo.id ?? mo.operacion);
      if (!adicionalManoSeleccionados[key]) return acc;
      const precioBase = usarValorMenos5
        ? Number(mo.valor_menos_5anos ?? 0)
        : Number(mo.valor_mas_5anos ?? 0);
      const desc = Number(mo.descuento ?? 0) / 100;
      const precioConDesc = Math.round(precioBase * (1 - desc));
      return acc + precioConDesc;
    }, 0);
  }, [adicionalModalData?.manoObra, adicionalManoSeleccionados, usarValorMenos5]);

  const handleAgregarAdicionalSeleccionados = () => {
    if (!adicionalModalData) return;

    const nuevosRepuestos = (adicionalModalData.repuestos ?? []).filter((r: any) =>
      adicionalRepuestosSeleccionados[String(r.codigo)],
    );
    const nuevosManos = (adicionalModalData.manoObra ?? []).filter((m: any) => {
      const key = String(m.id ?? m.operacion);
      return adicionalManoSeleccionados[key];
    });

    if (!nuevosRepuestos.length && !nuevosManos.length) {
      showError("Seleccione al menos un repuesto o una mano de obra del adicional.");
      return;
    }

    setRepuestosState((prev) => {
      const baseSeq =
        prev && prev.length && prev[prev.length - 1]?.seq != null
          ? Number(prev[prev.length - 1].seq)
          : 0;
      let offset = 1;
      const agregados = nuevosRepuestos.map((r: any) => {
        const precioBase = Number(r.Valor ?? r.valor ?? 0);
        const desc = Number(r.descuento ?? 0) / 100;
        const valor = Math.round(precioBase * (1 - desc));
        const seq = baseSeq + offset++;
        return {
          seq,
          codigo: r.codigo,
          descripcion: r.descripcion,
          cantidad: Number(r.cantidad ?? 1),
          categoria: r.categoria ?? "ADICIONAL",
          unidades_disponibles: Number(r.unidades_disponibles ?? 0),
          valor,
          autorizado: true,
          obligatorio: false,
          adicional: r.name_adicional ?? "Adicional",
        };
      });
      return [...prev, ...agregados];
    });

    setManoObraState((prev) => {
      const agregados = nuevosManos.map((mo: any) => {
        const precioBase = usarValorMenos5
          ? Number(mo.valor_menos_5anos ?? 0)
          : Number(mo.valor_mas_5anos ?? 0);
        const desc = Number(mo.descuento ?? 0) / 100;
        const valor = Math.round(precioBase * (1 - desc));
        return {
          operacion: mo.operacion,
          descripcion_operacion: mo.operacion,
          valor_unitario: valor,
          cant_horas: Number(mo.tiempo ?? mo.cant_horas ?? 0),
          autorizado: true,
          adicional: mo.name_adicional ?? "Adicional",
        };
      });
      return [...prev, ...agregados];
    });

    setAdicionalRepuestosSeleccionados({});
    setAdicionalManoSeleccionados({});
    setOpenAdicionalModal(false);
    setAdicionalModalData(null);
    showSuccess("Adicional agregado a la cotización.");
  };

  const guardarMutation = useMutation({
    mutationFn: async () => {
      if (!vehiculo || bodegaSeleccionada == null || revisionSeleccionada == null) {
        throw new Error("Faltan datos para guardar la cotización.");
      }

      // En MTTO GARANTÍA exigimos haber cargado la plantilla base.
      if (tipoMantenimiento === "0" && !detalle) {
        throw new Error(
          "No se pudo cargar el detalle base de la cotización. Verifique bodega, revisión y kilometraje.",
        );
      }

      // En MTTO A LA MEDIDA las tablas empiezan vacías y el cliente
      // debe agregar manualmente repuestos y/o mano de obra.
      if (
        tipoMantenimiento === "1" &&
        (!repuestosState?.length && !manoObraState?.length)
      ) {
        throw new Error(
          "En MTTO A LA MEDIDA debe agregar al menos un repuesto o una mano de obra antes de guardar.",
        );
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
        kilometraje_cliente: kmClienteNumber,
        bodega: bodegaSeleccionada,
        revision: revisionSeleccionada,
        emailCliente: emailCliente || v.mail || null,
        // En el legacy este campo viene de la sesión; aquí de momento usamos 0.
        usuario: 0,
        observaciones: observaciones || null,
        estado: agendarCita ? 1 : 0,
        tipoMantenimiento:
          tipoMantenimiento === "" ? null : Number(tipoMantenimiento),
      };

      const repuestos = (repuestosState ?? []).map((r: any) => ({
        codigo: r.codigo,
        descripcion: r.descripcion,
        cantidad: r.cantidad,
        categoria: r.categoria,
        uni_disponibles: r.unidades_disponibles,
        valor: r.valor,
        estado: r.autorizado ? 1 : 0,
        adicional: r.adicional ?? null,
      }));

      const manoObra = (manoObraState ?? []).map((m: any) => ({
        mtto: m.operacion,
        valor: m.valor_unitario,
        estado: m.autorizado ? 1 : 0,
        cant_horas: m.cant_horas ?? null,
        adicional: m.adicional ?? null,
      }));

      const { idCotizacion } = await cotizadorLivianosService.crearCotizacion({
        general,
        repuestos,
        manoObra,
      });

      // Enviar correo de cotización usando el servicio compartido
      const emailResult = await cotizadorLivianosService.enviarEmailCotizacion({
        idCotizacion,
        placa: v.placa,
        estado: agendarCita ? 1 : 0,
      });

      return { idCotizacion, emailResult };
    },
    onSuccess: (data) => {
      showSuccess(
        data.emailResult?.ok
          ? `Cotización guardada y correo enviado correctamente (ID #${data.idCotizacion}).`
          : `Cotización guardada (ID #${data.idCotizacion}). Aviso al enviar correo: ${data.emailResult?.message}`
      );
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
              <p className="text-gray-500">Doc. Cliente</p>
              <p className="font-medium text-gray-900">{(vehiculo as any).nit}</p>
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

          {/* Prepagado y tipo de mantenimiento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prepagado
              </label>
              <input
                type="text"
                readOnly
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                value={(vehiculo as any).prepagado ?? ""}
                placeholder="Sin información de prepagado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de mantenimiento
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={tipoMantenimiento}
                onChange={(e) => setTipoMantenimiento(e.target.value)}
              >
                <option value="">Seleccione una opción</option>
                <option value="0">MTTO GARANTÍA</option>
                <option value="1">MTTO A LA MEDIDA</option>
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => {
                  setPosibleRetornoPlaca((vehiculo as any)?.placa ?? "");
                  setPosibleRetornoBodega("");
                  setPosibleRetornoTipo("");
                  setPosibleRetornoObs("");
                  setOpenPosibleRetorno(true);
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-colors shadow-sm"
              >
                POSIBLE RETORNO
              </button>
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
                {(revisiones as any[] | undefined)?.map((r: any) => {
                  const revValue = r.revision;
                  const label =
                    revValue === 0 ? "REVISIÓN A LA MEDIDA" : String(revValue);
                  return (
                    <option key={revValue} value={revValue}>
                      {label}
                    </option>
                  );
                })}
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
                Kilometraje ingresado por el cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={kilometrajeCliente}
                onChange={(e) => setKilometrajeCliente(e.target.value)}
                placeholder="Ej: 50000 (debe ser mayor al km actual)"
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
                  className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
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
                  bodegaSeleccionada == null ||
                  revisionSeleccionada == null ||
                  !kmClienteValido ||
                  (tipoMantenimiento === "0"
                    ? !detalle
                    : !(repuestosState?.length || manoObraState?.length))
                }
                className="inline-flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{guardarMutation.isPending ? "Guardando..." : "Guardar cotización"}</span>
              </button>
            </div>
          </div>

          {/* Adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adicional
              </label>
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={adicionalSeleccionado}
                onChange={(e) => setAdicionalSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un adicional</option>
                {(initData as any)?.adicionales?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.adicional}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAgregarAdicionalClick}
                disabled={!adicionalSeleccionado || adicionalModalLoading}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-(--color-primary) brand-bg brand-bg-hover text-white shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adicionalModalLoading ? "Cargando..." : "Agregar adicional"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loader local: se muestra al traer detalle (bodega + revisión + km cliente válidos) */}
      {kmClienteValido &&
        tipoMantenimiento === "0" &&
        bodegaSeleccionada != null &&
        revisionSeleccionada != null &&
        loadingDetalle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]"
        >
          <div className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Cargando detalle de cotización (repuestos y mano de obra)...</p>
        </motion.div>
      )}

      {/* Tabla con detalle de repuestos y mano de obra.
          En MTTO GARANTÍA se alimenta desde la plantilla (detalle).
          En MTTO A LA MEDIDA se alimenta sólo con los adicionales que agregue el usuario. */}
      {!loadingDetalle &&
        (tipoMantenimiento === "0"
          ? !!detalle
          : !!(repuestosState?.length || manoObraState?.length)) && (
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
                <tr className="border-b-2 border-(--color-primary)">
                  <th className="text-left py-2 px-3">Código</th>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-center py-2 px-3">Cant.</th>
                  <th className="text-left py-2 px-3">Categoría</th>
                  <th className="text-center py-2 px-3">Und. disp.</th>
                  <th className="text-center py-2 px-3">Estado</th>
                  <th className="text-center py-2 px-3">Opción</th>
                  <th className="text-right py-2 px-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {(repuestosState ?? []).map((r: any) => (
                  <tr key={r.seq ?? r.codigo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{r.codigo}</td>
                    <td className="py-2 px-3">{r.descripcion}</td>
                    <td className="py-2 px-3 text-center">{r.cantidad}</td>
                    <td className="py-2 px-3">{r.categoria}</td>
                    <td className="py-2 px-3 text-center">{r.unidades_disponibles}</td>
                    <td className="py-2 px-3 text-center">
                      {r.autorizado ? "Autorizado" : "No autorizado"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                        checked={!!r.autorizado}
                        onChange={() => handleToggleRepuesto(r.seq)}
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(r.valor)}
                    </td>
                  </tr>
                ))}
                {!(repuestosState ?? []).length && (
                  <tr>
                    <td colSpan={8} className="py-3 px-3 text-center text-gray-500">
                      {tipoMantenimiento === "1"
                        ? "No hay repuestos agregados. Usa el panel de adicionales para añadirlos."
                        : "No hay repuestos configurados para esta revisión."}
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
                <tr className="border-b-2 border-(--color-primary)">
                  <th className="text-left py-2 px-3">Operación</th>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-center py-2 px-3">Horas</th>
                  <th className="text-center py-2 px-3">Estado</th>
                  <th className="text-center py-2 px-3">Opción</th>
                  <th className="text-right py-2 px-3">Valor (≤ 5 años)</th>
                </tr>
              </thead>
              <tbody>
                {(manoObraState ?? []).map((m: any) => (
                  <tr key={m.operacion} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{m.operacion}</td>
                    <td className="py-2 px-3">{m.descripcion_operacion}</td>
                    <td className="py-2 px-3 text-center">{m.cant_horas}</td>
                    <td className="py-2 px-3 text-center">
                      {m.autorizado ? "Autorizado" : "No autorizado"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                        checked={!!m.autorizado}
                        onChange={() => handleToggleManoObra(m.operacion)}
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(m.valor_unitario)}
                    </td>
                  </tr>
                ))}
                {!(manoObraState ?? []).length && (
                  <tr>
                    <td colSpan={6} className="py-3 px-3 text-center text-gray-500">
                      No hay mano de obra configurada para esta revisión.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </motion.div>
      )}

      {/* Error específico de búsqueda por placa */}
      {errorVehiculo && (
        <div className="text-sm text-red-500">
          {errorVehiculo}
        </div>
      )}

      {/* Modal Agregar adicionales */}
      {openAdicionalModal && adicionalModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar adicionales</h3>

            {/* Caso 1: adicionales solo de mano de obra (Diagnóstico u otros que no tienen repuestos) */}
            {(adicionalModalData.soloManoObra || adicionalSeleccionado === "2") &&
            adicionalModalData.manoObra?.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">MANO DE OBRA</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-2 px-3">Operación</th>
                        <th className="text-center py-2 px-3">Tiempo</th>
                        <th className="text-center py-2 px-3">Descuento</th>
                        <th className="text-right py-2 px-3">Precio</th>
                        <th className="text-right py-2 px-3">Precio con descuento</th>
                        <th className="text-center py-2 px-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {adicionalModalData.manoObra.map((mo: any) => {
                        const precio = usarValorMenos5
                          ? Number(mo.valor_menos_5anos ?? 0)
                          : Number(mo.valor_mas_5anos ?? 0);
                        const desc = Number(mo.descuento ?? 0) / 100;
                        const precioConDesc = Math.round(precio * (1 - desc));
                        return (
                          <tr
                            key={mo.id ?? mo.operacion}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-3">{mo.operacion}</td>
                            <td className="py-2 px-3 text-center">{Number(mo.tiempo)}</td>
                            <td className="py-2 px-3 text-center">
                              {Number(mo.descuento ?? 0)}%
                            </td>
                            <td className="py-2 px-3 text-right">
                              {new Intl.NumberFormat("es-CO", {
                                minimumFractionDigits: 0,
                              }).format(precio)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {new Intl.NumberFormat("es-CO", {
                                minimumFractionDigits: 0,
                              }).format(precioConDesc)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleAgregarManoObraAdicional(mo)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium brand-bg brand-bg-hover text-white"
                              >
                                Agregar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : adicionalModalData.repuestos?.length > 0 || adicionalModalData.manoObra?.length > 0 ? (
              // Caso 2: MTTO A LA MEDIDA (u otros adicionales con repuestos y/o mano de obra)
              <div className="space-y-6">
                {adicionalModalData.repuestos?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Repuestos del adicional</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-center">
                            <th className="py-2 px-3 text-left">Código</th>
                            <th className="py-2 px-3 text-left">Descripción</th>
                            <th className="py-2 px-3">Cantidad</th>
                            <th className="py-2 px-3">Descuento</th>
                            <th className="py-2 px-3 text-right">Precio</th>
                            <th className="py-2 px-3 text-right">Precio con descuento</th>
                            <th className="py-2 px-3">Und. disp.</th>
                            <th className="py-2 px-3">Agregar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adicionalModalData.repuestos.map((r: any) => {
                            const precio = Number(r.Valor ?? r.valor ?? 0);
                            const desc = Number(r.descuento ?? 0) / 100;
                            const precioConDesc = Math.round(precio * (1 - desc));
                            const key = String(r.codigo);
                            const checked = !!adicionalRepuestosSeleccionados[key];
                            return (
                              <tr
                                key={key}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-2 px-3">{r.codigo}</td>
                                <td className="py-2 px-3">{r.descripcion}</td>
                                <td className="py-2 px-3 text-center">
                                  {Number(r.cantidad ?? 1)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {Number(r.descuento ?? 0)}%
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {new Intl.NumberFormat("es-CO", {
                                    minimumFractionDigits: 0,
                                  }).format(precio)}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {new Intl.NumberFormat("es-CO", {
                                    minimumFractionDigits: 0,
                                  }).format(precioConDesc)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {Number(r.unidades_disponibles ?? 0)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                                    checked={checked}
                                    onChange={(e) =>
                                      setAdicionalRepuestosSeleccionados((prev) => ({
                                        ...prev,
                                        [key]: e.target.checked,
                                      }))
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th
                              colSpan={8}
                              className="py-2 px-3 text-right font-semibold text-gray-800"
                            >
                              Total:{" "}
                              {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              }).format(totalModalRepuestos)}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {adicionalModalData.manoObra?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Mano de obra del adicional</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-center">
                            <th className="py-2 px-3 text-left">Operación</th>
                            <th className="py-2 px-3">Tiempo</th>
                            <th className="py-2 px-3">Descuento</th>
                            <th className="py-2 px-3 text-right">Precio</th>
                            <th className="py-2 px-3 text-right">Precio con descuento</th>
                            <th className="py-2 px-3">Agregar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adicionalModalData.manoObra.map((mo: any) => {
                            const precioBase = usarValorMenos5
                              ? Number(mo.valor_menos_5anos ?? 0)
                              : Number(mo.valor_mas_5anos ?? 0);
                            const desc = Number(mo.descuento ?? 0) / 100;
                            const precioConDesc = Math.round(precioBase * (1 - desc));
                            const key = String(mo.id ?? mo.operacion);
                            const checked = !!adicionalManoSeleccionados[key];
                            return (
                              <tr
                                key={key}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="py-2 px-3">{mo.operacion}</td>
                                <td className="py-2 px-3 text-center">
                                  {Number(mo.tiempo ?? 0)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {Number(mo.descuento ?? 0)}%
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {new Intl.NumberFormat("es-CO", {
                                    minimumFractionDigits: 0,
                                  }).format(precioBase)}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {new Intl.NumberFormat("es-CO", {
                                    minimumFractionDigits: 0,
                                  }).format(precioConDesc)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-(--color-primary) focus:ring-(--color-primary)"
                                    checked={checked}
                                    onChange={(e) =>
                                      setAdicionalManoSeleccionados((prev) => ({
                                        ...prev,
                                        [key]: e.target.checked,
                                      }))
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th
                              colSpan={6}
                              className="py-2 px-3 text-right font-semibold text-gray-800"
                            >
                              Total:{" "}
                              {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              }).format(totalModalManoObra)}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAgregarAdicionalSeleccionados}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium brand-bg brand-bg-hover text-white"
                  >
                    Agregar seleccionados
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay datos disponibles para este adicional.</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpenAdicionalModal(false);
                  setAdicionalModalData(null);
                  setAdicionalRepuestosSeleccionados({});
                  setAdicionalManoSeleccionados({});
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Posible Retorno */}
      {openPosibleRetorno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Posible Retorno</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  type="text"
                  readOnly
                  className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-gray-50"
                  value={posibleRetornoPlaca}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
                <select
                  className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
                  value={posibleRetornoBodega}
                  onChange={(e) => setPosibleRetornoBodega(e.target.value)}
                >
                  <option value="">Seleccione bodega</option>
                  <option value="1">CODIESEL PRINCIPAL</option>
                  <option value="6">CHEVYEXPRESS BARRANCA</option>
                  <option value="7">CHEVYEXPRESS LA ROSITA</option>
                  <option value="8">CODIESEL VILLA DEL ROSARIO</option>
                  <option value="9">LAMINA Y PINTURA AUTOMOVILES-GIRON</option>
                  <option value="10">ACCESORIZACION</option>
                  <option value="11">DIESEL EXPRESS GIRON</option>
                  <option value="14">LAMINA Y PINTURA AUTOMOVILES-BOCONO</option>
                  <option value="16">BOCONO DIESEL EXPRESS</option>
                  <option value="19">DIESEL EXPRESS BARRANCA</option>
                  <option value="21">LAMINA Y PINTURA CAMIONES-GIRON</option>
                  <option value="22">LAMINA Y PINTURA CAMIONES-BOCONO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo posible retorno</label>
                <select
                  className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
                  value={posibleRetornoTipo}
                  onChange={(e) => setPosibleRetornoTipo(e.target.value)}
                >
                  <option value="">Seleccione un tipo de retorno</option>
                  {(initData as any)?.tiposRetorno?.map((t: any) => (
                    <option key={t.id_tipo_retorno ?? t.id} value={String(t.id_tipo_retorno ?? t.id)}>
                      {t.tipo_retorno ?? t.nombre ?? ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observación (mín. 30 caracteres)</label>
                <textarea
                  className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none min-h-[80px]"
                  value={posibleRetornoObs}
                  onChange={(e) => setPosibleRetornoObs(e.target.value)}
                  placeholder="Escriba la observación realizada por el cliente"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setOpenPosibleRetorno(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={posibleRetornoSubmitting || !posibleRetornoPlaca || !posibleRetornoTipo || posibleRetornoObs.trim().length < 30 || !posibleRetornoBodega}
                onClick={async () => {
                  setPosibleRetornoSubmitting(true);
                  try {
                    await cotizadorLivianosService.crearPosibleRetorno({
                      placa: posibleRetornoPlaca,
                      tipo_retorno: Number(posibleRetornoTipo),
                      observacion: posibleRetornoObs.trim(),
                      bodega: posibleRetornoBodega === "" ? null : Number(posibleRetornoBodega),
                    });
                    showSuccess("Posible retorno creado correctamente.");
                    setOpenPosibleRetorno(false);
                  } catch (e: any) {
                    showError(e?.message ?? "No se pudo crear el posible retorno.");
                  } finally {
                    setPosibleRetornoSubmitting(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium brand-bg brand-bg-hover text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {posibleRetornoSubmitting ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

