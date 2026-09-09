'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Search, Save } from 'lucide-react';
import ValoresCruceModal from '@/components/administracion/modals/ValoresCruceModal';
import { useToast } from '@/components/shared/ui/ToastContext';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { ajusteValoresService } from '@/modules/administracion/services/ajuste-valores.service';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type {
  AjusteValoresResponse,
  Valores2Response,
  ValoresCruce,
  ActualizarValoresDTO,
  ActualizarValores2DTO,
  ActualizarValoresCruceDTO,
} from '@/modules/administracion/types';
import { AJUSTES_VALORES_CONTABLES_SUBMENU_ID } from '@/utils/constants';

const inputClass =
  'block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export function AjustesValoresContablesGestion() {
  const { blocked } = useAdministracionPageGuard(
    AJUSTES_VALORES_CONTABLES_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const [tipoAjuste1, setTipoAjuste1] = useState('');
  const [numeroAjuste1, setNumeroAjuste1] = useState('');
  const [valoresActuales, setValoresActuales] =
    useState<AjusteValoresResponse | null>(null);
  const [documentosCerrados, setDocumentosCerrados] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tipoAjuste2, setTipoAjuste2] = useState('');
  const [numeroAjuste2, setNumeroAjuste2] = useState('');
  const [valores2, setValores2] = useState<Valores2Response | null>(null);
  const [documentosCerrados2, setDocumentosCerrados2] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [formaPago, setFormaPago] = useState<number | string>('');
  const [valorPago, setValorPago] = useState<string>('');

  const [modalCruceOpen, setModalCruceOpen] = useState(false);
  const [valoresCruce, setValoresCruce] = useState<ValoresCruce | null>(null);

  const handleObtenerDatos1 = async () => {
    if (!tipoAjuste1 || !numeroAjuste1) {
      showError('Por favor complete tipo y número');
      return;
    }

    setLoading(true);
    try {
      const numero = parseInt(numeroAjuste1);
      if (isNaN(numero)) {
        showError('El número debe ser un valor numérico');
        return;
      }

      const valores = await ajusteValoresService.obtenerValores(
        tipoAjuste1,
        numero,
      );

      if (!valores) {
        showError(
          'No se encontraron valores para el tipo y número especificados',
        );
        setValoresActuales(null);
        return;
      }

      const cerrado = await ajusteValoresService.validarDocumentosCerrados(
        valores.ano,
        valores.mes,
      );
      setDocumentosCerrados(cerrado);

      if (cerrado) {
        showError(
          'Los documentos para este mes y año están cerrados. No se pueden modificar.',
        );
      } else {
        showSuccess('Datos obtenidos correctamente');
      }

      setValoresActuales(valores);
    } catch (error: unknown) {
      showError(getErrorMessage(error, 'Error al obtener los datos'));
      setValoresActuales(null);
    } finally {
      setLoading(false);
    }
  };

  const handleObtenerDatos2 = async () => {
    if (!tipoAjuste2 || !numeroAjuste2) {
      showError('Por favor complete tipo y número');
      return;
    }

    setLoading2(true);
    try {
      const numero = parseInt(numeroAjuste2);
      if (isNaN(numero)) {
        showError('El número debe ser un valor numérico');
        return;
      }

      const valores = await ajusteValoresService.obtenerValores2(
        tipoAjuste2,
        numero,
      );

      if (!valores) {
        showError(
          'No se encontraron valores para el tipo y número especificados',
        );
        setValores2(null);
        return;
      }

      const cerrado = await ajusteValoresService.validarDocumentosCerrados(
        valores.ano,
        valores.mes,
      );
      setDocumentosCerrados2(cerrado);

      if (cerrado) {
        showError(
          'Los documentos para este mes y año están cerrados. No se pueden modificar.',
        );
      } else {
        showSuccess('Datos obtenidos correctamente');
      }

      setValores2(valores);
      setFormaPago(valores.forma_pago || '');
      setValorPago(valores.valor?.toString() || '');
    } catch (error: unknown) {
      showError(getErrorMessage(error, 'Error al obtener los datos'));
      setValores2(null);
    } finally {
      setLoading2(false);
    }
  };

  const handleValorChange = (
    field: keyof AjusteValoresResponse,
    value: number,
  ) => {
    if (!valoresActuales || documentosCerrados) return;

    const nuevosValores: AjusteValoresResponse = {
      ...valoresActuales,
      [field]: value,
    };

    nuevosValores.valor_total =
      (nuevosValores.retencion || 0) +
      (nuevosValores.retencion_iva || 0) +
      (nuevosValores.retencion_ica || 0) +
      (nuevosValores.iva || 0) +
      (nuevosValores.Retencion_estampilla2 || 0) +
      (nuevosValores.Retencion_estampilla1 || 0);

    setValoresActuales(nuevosValores);
  };

  const handleValorAplicadoBlur = async () => {
    if (
      !valoresActuales ||
      !valoresActuales.valor_aplicado ||
      valoresActuales.valor_aplicado === 0
    ) {
      return;
    }

    try {
      const cruce = await ajusteValoresService.obtenerValoresCruce(
        tipoAjuste1,
        parseInt(numeroAjuste1),
      );
      if (cruce) {
        setValoresCruce(cruce);
        setModalCruceOpen(true);
      }
    } catch {
      console.log('No hay valores de cruce disponibles');
    }
  };

  const handleGuardarCruce = async (data: ActualizarValoresCruceDTO) => {
    try {
      const numero = parseInt(numeroAjuste1);
      await ajusteValoresService.actualizarValorCruce(
        numero,
        tipoAjuste1,
        data,
      );
      showSuccess('Valor de cruce actualizado correctamente');
      setModalCruceOpen(false);
    } catch (error: unknown) {
      showError(
        getErrorMessage(error, 'Error al actualizar el valor de cruce'),
      );
      throw error;
    }
  };

  const handleActualizarValores = async () => {
    if (!valoresActuales || documentosCerrados) {
      showError(
        'No se pueden actualizar valores. Los documentos están cerrados.',
      );
      return;
    }

    setLoading(true);
    try {
      const numero = parseInt(numeroAjuste1);
      const dto: ActualizarValoresDTO = {
        retencion: valoresActuales.retencion,
        retencion_iva: valoresActuales.retencion_iva,
        retencion_ica: valoresActuales.retencion_ica,
        iva: valoresActuales.iva,
        Retencion_estampilla2:
          valoresActuales.Retencion_estampilla2 ?? undefined,
        Retencion_estampilla1:
          valoresActuales.Retencion_estampilla1 ?? undefined,
        valor_aplicado: valoresActuales.valor_aplicado ?? undefined,
        valor_total: valoresActuales.valor_total,
      };

      const actualizado = await ajusteValoresService.actualizarValores(
        numero,
        tipoAjuste1,
        dto,
      );
      setValoresActuales(actualizado);
      showSuccess('Valores actualizados correctamente');
    } catch (error: unknown) {
      showError(getErrorMessage(error, 'Error al actualizar los valores'));
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarValores2 = async () => {
    if (!valores2 || documentosCerrados2) {
      showError(
        'No se pueden actualizar valores. Los documentos están cerrados.',
      );
      return;
    }

    if (!formaPago || !valorPago) {
      showError('Por favor complete la forma de pago y el valor');
      return;
    }

    setLoading2(true);
    try {
      const numero = parseInt(numeroAjuste2);
      const dto: ActualizarValores2DTO = {
        forma_pago:
          typeof formaPago === 'string' ? parseInt(formaPago) : formaPago,
        valor: parseFloat(valorPago),
      };

      const actualizado = await ajusteValoresService.actualizarValores2(
        numero,
        tipoAjuste2,
        dto,
      );
      setValores2(actualizado);
      setFormaPago(actualizado.forma_pago || '');
      setValorPago(actualizado.valor?.toString() || '');
      showSuccess('Valores de pago actualizados correctamente');
    } catch (error: unknown) {
      showError(
        getErrorMessage(error, 'Error al actualizar los valores de pago'),
      );
    } finally {
      setLoading2(false);
    }
  };

  const concepto = valoresActuales
    ? `${valoresActuales.tipo} - ${valoresActuales.numero}`
    : '';

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.ajustesValores.title}
      description={ADMINISTRACION_COPY.ajustesValores.description}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calculator className="text-blue-600" size={20} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ajuste de Valores Contabilidad
          </h2>
        </div>
        <div className="app-form-grid-3">
          <div>
            <label className={labelClass}>Tipo</label>
            <input
              type="text"
              data-testid="adm-ajuste-tipo"
              className={inputClass}
              value={tipoAjuste1}
              onChange={(e) => setTipoAjuste1(e.target.value.toUpperCase())}
              placeholder="Ej: DSA"
            />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input
              type="text"
              data-testid="adm-ajuste-numero"
              className={inputClass}
              value={numeroAjuste1}
              onChange={(e) => setNumeroAjuste1(e.target.value)}
              placeholder="Ej: 5293"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              data-testid="adm-ajuste-obtener"
              onClick={handleObtenerDatos1}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={18} />
              <span>{loading ? 'Cargando...' : 'Obtener Datos'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {valoresActuales && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6"
        >
          {documentosCerrados && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Los documentos para este mes y año están cerrados. No se pueden
              modificar.
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Calculator className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Valores Actuales
            </h2>
          </div>
          <div className="app-table-scroll">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b-2 border-[var(--color-primary)]">
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Concepto
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Retención en la Fuente
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    ReteIVA
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    ReteICA
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    IVA
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Avisos y Tableros
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Sobretasa Bomberil
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Valor Aplicado
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-900">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{concepto}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.retencion || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'retencion',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.retencion_iva || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'retencion_iva',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.retencion_ica || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'retencion_ica',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.iva || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'iva',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.Retencion_estampilla2 || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'Retencion_estampilla2',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.Retencion_estampilla1 || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'Retencion_estampilla1',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={valoresActuales.valor_aplicado || 0}
                      onChange={(e) =>
                        handleValorChange(
                          'valor_aplicado',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={handleValorAplicadoBlur}
                      disabled={documentosCerrados}
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(valoresActuales.valor_total || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex">
            <button
              type="button"
              onClick={handleActualizarValores}
              disabled={loading || documentosCerrados}
              className="flex w-full sm:w-auto items-center justify-center gap-2 brand-bg hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{loading ? 'Guardando...' : 'Actualizar'}</span>
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calculator className="text-purple-600" size={20} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Forma de Pago</h2>
        </div>
        <div className="app-form-grid-3 mb-6">
          <div>
            <label className={labelClass}>Tipo</label>
            <input
              type="text"
              className={inputClass}
              value={tipoAjuste2}
              onChange={(e) => setTipoAjuste2(e.target.value.toUpperCase())}
              placeholder="Ej: RV"
            />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input
              type="text"
              className={inputClass}
              value={numeroAjuste2}
              onChange={(e) => setNumeroAjuste2(e.target.value)}
              placeholder="Ej: 77117"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleObtenerDatos2}
              disabled={loading2}
              className="w-full flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={18} />
              <span>{loading2 ? 'Cargando...' : 'Obtener Datos'}</span>
            </button>
          </div>
        </div>
        {valores2 && (
          <>
            {documentosCerrados2 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Los documentos para este mes y año están cerrados. No se pueden
                modificar.
              </div>
            )}
            <div className="app-form-grid-2">
              <div>
                <label className={labelClass}>Forma de Pago</label>
                <input
                  type="number"
                  className={inputClass}
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                  disabled={documentosCerrados2}
                  placeholder="Ej: 5"
                />
              </div>
              <div>
                <label className={labelClass}>Valor</label>
                <input
                  type="number"
                  className={inputClass}
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  disabled={documentosCerrados2}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-6 flex">
              <button
                type="button"
                onClick={handleActualizarValores2}
                disabled={loading2 || documentosCerrados2}
                className="flex w-full sm:w-auto items-center justify-center gap-2 brand-bg hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                <span>{loading2 ? 'Guardando...' : 'Actualizar'}</span>
              </button>
            </div>
          </>
        )}
      </motion.div>

      <ValoresCruceModal
        open={modalCruceOpen}
        onClose={() => setModalCruceOpen(false)}
        valoresCruce={valoresCruce}
        tipo={tipoAjuste1}
        numero={parseInt(numeroAjuste1) || 0}
        onSave={handleGuardarCruce}
      />
    </AdministracionPageFrame>
  );
}
