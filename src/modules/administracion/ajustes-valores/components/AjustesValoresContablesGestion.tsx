'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Search, Save } from 'lucide-react';
import ValoresCruceModal from '@/components/administracion/modals/ValoresCruceModal';
import { useToast } from '@/components/shared/ui/ToastContext';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import {
  ajusteValoresService,
  type FormaPagoLinea,
} from '@/modules/administracion/services/ajuste-valores.service';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type {
  AjusteValoresResponse,
  ValoresCruce,
  ActualizarValoresDTO,
  ActualizarValoresCruceDTO,
} from '@/modules/administracion/types';
import { AJUSTES_VALORES_CONTABLES_SUBMENU_ID } from '@/utils/constants';

const inputClass =
  'block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const MENSAJE_CERRADO = 'La fecha del documento ya se encuentra cerrada';
const FORMAS_PAGO = ['0', '1', '2', '3', '4', '5', '6', '7'] as const;
const CAMPOS_EDICION = [
  'retencion',
  'retencion_iva',
  'retencion_ica',
  'iva',
  'Retencion_estampilla2',
  'Retencion_estampilla1',
  'valor_aplicado',
  'valor_total',
] as const;

type CampoEdicion = (typeof CAMPOS_EDICION)[number];

const EDICION_VACIA: Record<CampoEdicion, string> = {
  retencion: '',
  retencion_iva: '',
  retencion_ica: '',
  iva: '',
  Retencion_estampilla2: '',
  Retencion_estampilla1: '',
  valor_aplicado: '',
  valor_total: '',
};

const ETIQUETAS_EDICION: Record<CampoEdicion, string> = {
  retencion: 'Retención en la Fuente',
  retencion_iva: 'Reteiva',
  retencion_ica: 'Reteica',
  iva: 'IVA',
  Retencion_estampilla2: 'Avisos y Tableros',
  Retencion_estampilla1: 'Sobretasa Bomberil',
  valor_aplicado: 'Valor Aplicado',
  valor_total: 'Valor Total',
};

function formatoValor(valor: number | null | undefined): string {
  const numero =
    valor == null || Number.isNaN(Number(valor)) ? 0 : Number(valor);
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
}

function valorPagoEntero(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(Number(valor))) return '';
  return String(Math.round(Number(valor)));
}

export function AjustesValoresContablesGestion() {
  const { blocked } = useAdministracionPageGuard(
    AJUSTES_VALORES_CONTABLES_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const [tipoAjuste1, setTipoAjuste1] = useState('');
  const [numeroAjuste1, setNumeroAjuste1] = useState('');
  const [valoresActuales, setValoresActuales] =
    useState<AjusteValoresResponse | null>(null);
  const [edicion, setEdicion] =
    useState<Record<CampoEdicion, string>>(EDICION_VACIA);
  const [loading, setLoading] = useState(false);

  const [tipoAjuste2, setTipoAjuste2] = useState('');
  const [numeroAjuste2, setNumeroAjuste2] = useState('');
  const [pagos, setPagos] = useState<FormaPagoLinea[]>([]);
  const [loading2, setLoading2] = useState(false);
  const [formaPago, setFormaPago] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [formaPago2, setFormaPago2] = useState('');
  const [valorPago2, setValorPago2] = useState('');

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

      if (cerrado) {
        setValoresActuales(null);
        setEdicion(EDICION_VACIA);
        showError(MENSAJE_CERRADO);
        return;
      }

      setValoresActuales(valores);
      setEdicion(EDICION_VACIA);
      showSuccess('Datos obtenidos correctamente');
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

      if (!valores?.lineas.length) {
        showError(
          'No se encontraron valores para el tipo y número especificados',
        );
        setPagos([]);
        return;
      }

      if (valores.ano == null || valores.mes == null) {
        setPagos([]);
        showError('No se pudo validar la fecha del documento');
        return;
      }

      const cerrado = await ajusteValoresService.validarDocumentosCerrados(
        valores.ano,
        valores.mes,
      );

      if (cerrado) {
        setPagos([]);
        setFormaPago('');
        setValorPago('');
        setFormaPago2('');
        setValorPago2('');
        showError(MENSAJE_CERRADO);
        return;
      }

      aplicarPagos(valores.lineas);
      showSuccess('Datos obtenidos correctamente');
    } catch (error: unknown) {
      showError(getErrorMessage(error, 'Error al obtener los datos'));
      setPagos([]);
    } finally {
      setLoading2(false);
    }
  };

  const handleValorAplicadoBlur = async () => {
    if (!valoresActuales || edicion.valor_aplicado.trim() === '') {
      return;
    }

    try {
      const cruce = await ajusteValoresService.obtenerValoresCruce(
        tipoAjuste1,
        parseInt(numeroAjuste1),
      );
      setValoresCruce(cruce);
      setModalCruceOpen(true);
    } catch {
      setValoresCruce(null);
      setModalCruceOpen(true);
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
    if (!valoresActuales) {
      showError('Debe llenar al menos un campo!');
      return;
    }

    const dto: ActualizarValoresDTO = {};
    for (const campo of CAMPOS_EDICION) {
      const texto = edicion[campo].trim();
      if (texto === '') continue;
      dto[campo] = Number(texto);
    }
    if (!Object.keys(dto).length) {
      showError('Debe llenar al menos un campo!');
      return;
    }

    setLoading(true);
    try {
      const numero = parseInt(numeroAjuste1);
      const actualizado = await ajusteValoresService.actualizarValores(
        numero,
        tipoAjuste1,
        dto,
      );
      setValoresActuales(actualizado);
      setEdicion(EDICION_VACIA);
      showSuccess('Los datos se guardaron correctamente');
    } catch (error: unknown) {
      showError(getErrorMessage(error, 'Error al actualizar los valores'));
    } finally {
      setLoading(false);
    }
  };

  const aplicarPagos = (lineas: FormaPagoLinea[]) => {
    const primera = lineas[0];
    const segunda = lineas.length === 2 ? lineas[1] : undefined;
    setPagos(lineas);
    setFormaPago(primera?.forma_pago != null ? String(primera.forma_pago) : '');
    setValorPago(valorPagoEntero(primera?.valor));
    setFormaPago2(
      segunda?.forma_pago != null ? String(segunda.forma_pago) : '',
    );
    setValorPago2(valorPagoEntero(segunda?.valor));
  };

  const handleActualizarValores2 = async () => {
    if (!pagos.length || formaPago === '') {
      showError('Debe llenar al menos un campo!');
      return;
    }
    if (valorPago.trim() === '') {
      showError('Debe llenar el valor de la forma de pago');
      return;
    }
    const segundaIncompleta =
      (formaPago2 !== '' && valorPago2.trim() === '') ||
      (formaPago2 === '' && valorPago2.trim() !== '');
    if (segundaIncompleta) {
      showError('Debe llenar el valor de la segunda forma de pago');
      return;
    }

    const segundaVacia = formaPago2 === '' && valorPago2.trim() === '';
    const lineas = pagos.map((linea, index) => {
      if (index === 0) {
        return {
          id: linea.id,
          forma_pago: Number(formaPago),
          valor: Number(valorPago),
        };
      }
      if (index === 1 && !segundaVacia) {
        return {
          id: linea.id,
          forma_pago: Number(formaPago2),
          valor: Number(valorPago2),
        };
      }
      return { id: linea.id, forma_pago: null, valor: null };
    });

    setLoading2(true);
    try {
      const numero = parseInt(numeroAjuste2);
      const actualizado = await ajusteValoresService.actualizarValores2(
        numero,
        tipoAjuste2,
        { lineas },
      );
      aplicarPagos(actualizado.lineas);
      showSuccess('Los datos se guardaron correctamente');
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
                  {CAMPOS_EDICION.map((campo) => (
                    <td key={campo} className="py-3 px-4">
                      {formatoValor(valoresActuales[campo])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAMPOS_EDICION.map((campo) => (
              <div key={campo}>
                <label className={labelClass} htmlFor={`adm-ajuste-${campo}`}>
                  {ETIQUETAS_EDICION[campo]}
                </label>
                <input
                  id={`adm-ajuste-${campo}`}
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={edicion[campo]}
                  onChange={(e) =>
                    setEdicion((prev) => ({ ...prev, [campo]: e.target.value }))
                  }
                  onBlur={
                    campo === 'valor_aplicado'
                      ? handleValorAplicadoBlur
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex">
            <button
              type="button"
              onClick={handleActualizarValores}
              disabled={loading}
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
        {pagos.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelClass} htmlFor="adm-ajuste-forma-pago">
                  Forma de Pago
                </label>
                <select
                  id="adm-ajuste-forma-pago"
                  className={inputClass}
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  {FORMAS_PAGO.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="adm-ajuste-valor-pago">
                  Valor
                </label>
                <input
                  id="adm-ajuste-valor-pago"
                  type="number"
                  className={inputClass}
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="adm-ajuste-forma-pago-2">
                  Forma de Pago
                </label>
                <select
                  id="adm-ajuste-forma-pago-2"
                  className={inputClass}
                  value={formaPago2}
                  onChange={(e) => setFormaPago2(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  {FORMAS_PAGO.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="adm-ajuste-valor-pago-2">
                  Valor
                </label>
                <input
                  id="adm-ajuste-valor-pago-2"
                  type="number"
                  className={inputClass}
                  value={valorPago2}
                  onChange={(e) => setValorPago2(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex">
              <button
                type="button"
                onClick={handleActualizarValores2}
                disabled={loading2}
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
