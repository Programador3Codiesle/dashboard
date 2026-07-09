"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/ui/Portal";
import { useToast } from "@/components/shared/ui/ToastContext";
import type {
  CatalogosPosiblesRetornos,
  DetallePlacaResponse,
  GuardarDefinicionParams,
} from "../../types";
import { validarGestionRetorno } from "../../utils/validaciones-gestion";

interface ModalGestionRetornoProps {
  open: boolean;
  catalogos: CatalogosPosiblesRetornos | undefined;
  detalle: DetallePlacaResponse | null;
  ordenOrigen: number | null;
  guardando?: boolean;
  onClose: () => void;
  onGuardar: (params: GuardarDefinicionParams) => Promise<void>;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function ModalGestionRetorno({
  open,
  catalogos,
  detalle,
  ordenOrigen,
  guardando = false,
  onClose,
  onGuardar,
}: ModalGestionRetornoProps) {
  const { showError } = useToast();
  const [definicion, setDefinicion] = useState<"1" | "0">("1");
  const [selectRazon, setSelectRazon] = useState("");
  const [selectRazonNo, setSelectRazonNo] = useState("");
  const [obsRazon, setObsRazon] = useState("");
  const [selectSistInv, setSelectSistInv] = useState("");
  const [obsSistInv, setObsSistInv] = useState("");
  const [ordenR, setOrdenR] = useState("");
  const [tecnicoR, setTecnicoR] = useState("");
  const [selectPlan, setSelectPlan] = useState("");
  const [obsPlan, setObsPlan] = useState("");
  const [precio1, setPrecio1] = useState("");
  const [precio2, setPrecio2] = useState("");
  const [precio3, setPrecio3] = useState("");
  const [obsCostos, setObsCostos] = useState("");

  const esSi = definicion === "1";

  useEffect(() => {
    if (open) {
      setDefinicion("1");
      setSelectRazon("");
      setSelectRazonNo("");
      setObsRazon("");
      setSelectSistInv("");
      setObsSistInv("");
      setOrdenR("");
      setTecnicoR("");
      setSelectPlan("");
      setObsPlan("");
      setPrecio1("");
      setPrecio2("");
      setPrecio3("");
      setObsCostos("");
    }
  }, [open]);

  if (!open || !catalogos || ordenOrigen == null) return null;

  const razonesSi = catalogos.razones.filter((r) => r.definicion > 0);
  const razonesNo = catalogos.razones.filter((r) => r.definicion < 1);
  const ordenes = detalle?.array_ordenes ?? [];
  const tecnicos = detalle?.array_tecnicos ?? [];

  const handleGuardar = async () => {
    const params: GuardarDefinicionParams = {
      definicion: Number(definicion),
      ordenR_origen: ordenOrigen,
      selectRazon: esSi ? Number(selectRazon) : Number(selectRazonNo),
      obs_razon: esSi ? obsRazon : undefined,
      select_sist_inv: esSi ? Number(selectSistInv) : undefined,
      obs_sist_inv: esSi ? obsSistInv : undefined,
      ordenR: esSi ? Number(ordenR) : undefined,
      tecnicoR: esSi ? tecnicoR : undefined,
      selectPlan: Number(selectPlan),
      obs_plan: obsPlan,
      precio_costo_1: Number(precio1),
      precio_costo_2: Number(precio2),
      precio_costo_3: Number(precio3),
      obs_costos: obsCostos,
    };

    const error = validarGestionRetorno(params);
    if (error) {
      showError(error);
      return;
    }

    await onGuardar(params);
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Definición Retorno
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="definicion"
                    value="1"
                    checked={definicion === "1"}
                    onChange={() => setDefinicion("1")}
                  />
                  SI
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="definicion"
                    value="0"
                    checked={definicion === "0"}
                    onChange={() => setDefinicion("0")}
                  />
                  NO
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {esSi ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    RAZÓN RETORNO
                  </label>
                  <select
                    className={inputClass}
                    value={selectRazon}
                    onChange={(e) => setSelectRazon(e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    {razonesSi.map((r) => (
                      <option key={r.id_razon} value={r.id_razon}>
                        {r.razon}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    RAZÓN RETORNO
                  </label>
                  <select
                    className={inputClass}
                    value={selectRazonNo}
                    onChange={(e) => setSelectRazonNo(e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    {razonesNo.map((r) => (
                      <option key={r.id_razon} value={r.id_razon}>
                        {r.razon}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {esSi && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Observación razón
                  </label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={obsRazon}
                    onChange={(e) => setObsRazon(e.target.value)}
                    placeholder="Escriba aquí las observación de la razón del retorno"
                  />
                </div>
              )}
            </div>

            {esSi && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    SISTEMA INTERVENIDO
                  </label>
                  <select
                    className={inputClass}
                    value={selectSistInv}
                    onChange={(e) => setSelectSistInv(e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    {catalogos.sistemas.map((s) => (
                      <option key={s.id_sistema_inv} value={s.id_sistema_inv}>
                        {s.sistema_inv}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Observación sistema
                  </label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={obsSistInv}
                    onChange={(e) => setObsSistInv(e.target.value)}
                    placeholder="Escriba aquí las observaciones para el sistema de inventario."
                  />
                </div>
              </div>
            )}

            {esSi && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ORDEN</label>
                  <select
                    className={inputClass}
                    value={ordenR}
                    onChange={(e) => setOrdenR(e.target.value)}
                  >
                    <option value="">Seleccione una Orden</option>
                    {ordenes.map((o, index) => (
                      <option key={`orden-opt-${o}-${index}`} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">TÉCNICO</label>
                  <select
                    className={inputClass}
                    value={tecnicoR}
                    onChange={(e) => setTecnicoR(e.target.value)}
                  >
                    <option value="">Seleccione un Técnico</option>
                    {tecnicos.map((t, index) => (
                      <option key={`tecnico-opt-${t}-${index}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  PLAN DE ACCIÓN
                </label>
                <select
                  className={inputClass}
                  value={selectPlan}
                  onChange={(e) => setSelectPlan(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  {catalogos.planes.map((p) => (
                    <option key={p.id_plan} value={p.id_plan}>
                      {p.plan_accion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Observación plan
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={obsPlan}
                  onChange={(e) => setObsPlan(e.target.value)}
                  placeholder="Escriba aquí las observaciones del plan de acción"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">COSTOS</label>
              <div className="grid grid-cols-2 gap-3 items-center">
                <span className="text-sm text-gray-600">REPUESTOS</span>
                <input
                  type="number"
                  className={inputClass}
                  value={precio1}
                  onChange={(e) => setPrecio1(e.target.value)}
                  placeholder="Precio repuestos"
                />
                <span className="text-sm text-gray-600">MANO DE OBRA</span>
                <input
                  type="number"
                  className={inputClass}
                  value={precio2}
                  onChange={(e) => setPrecio2(e.target.value)}
                  placeholder="Precio mano de obra"
                />
                <span className="text-sm text-gray-600">TOT</span>
                <input
                  type="number"
                  className={inputClass}
                  value={precio3}
                  onChange={(e) => setPrecio3(e.target.value)}
                  placeholder="Precio TOT"
                />
              </div>
              <textarea
                className={inputClass}
                rows={3}
                value={obsCostos}
                onChange={(e) => setObsCostos(e.target.value)}
                placeholder="Escriba aquí las observaciones de los costos"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
              disabled={guardando}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
