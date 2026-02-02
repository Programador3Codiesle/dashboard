'use client';

import React, { useRef, useCallback } from 'react';
import { FormSelect } from '@/components/shared/ui/FormSelect';
import { GENEROS_TALLA_DOTACION, TALLAS_CAMISA, TALLAS_PANTALON, TALLAS_BOTAS } from '@/modules/administracion/constants';
import { ActualizarTallaDotacionDTO } from '@/modules/administracion/types';
import { ChevronDown } from 'lucide-react';

interface TallaDotacionFormProps {
  formData: ActualizarTallaDotacionDTO;
  onFormDataChange: (data: ActualizarTallaDotacionDTO) => void;
}

/**
 * Componente de formulario optimizado para tallas dotación
 * Usa useRef para evitar re-renders innecesarios en los selects
 */
export const TallaDotacionForm = React.memo(({
  formData,
  onFormDataChange
}: TallaDotacionFormProps) => {
  const handleGeneroChange = useCallback((value: string) => {
    onFormDataChange({ ...formData, genero: value });
  }, [formData, onFormDataChange]);

  const handleTallaCamisaChange = useCallback((value: string) => {
    onFormDataChange({ ...formData, tallaCamisa: value });
  }, [formData, onFormDataChange]);

  const handleTallaPantalonChange = useCallback((value: string) => {
    onFormDataChange({ ...formData, tallaPantalon: value });
  }, [formData, onFormDataChange]);

  const handleTallaBotasChange = useCallback((value: string) => {
    onFormDataChange({ ...formData, tallaBotas: value });
  }, [formData, onFormDataChange]);

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormSelect
        label="Género"
        value={formData.genero}
        onChange={handleGeneroChange}
        options={GENEROS_TALLA_DOTACION}
        required
        labelClassName={labelClass}
      />
      <FormSelect
        label="Talla Camisa"
        value={formData.tallaCamisa}
        onChange={handleTallaCamisaChange}
        options={TALLAS_CAMISA.map(talla => ({ value: talla, label: talla }))}
        required
        labelClassName={labelClass}
      />
      <FormSelect
        label="Talla Pantalón"
        value={formData.tallaPantalon}
        onChange={handleTallaPantalonChange}
        options={TALLAS_PANTALON.map(talla => ({ value: talla, label: talla }))}
        required
        labelClassName={labelClass}
      />
      <FormSelect
        label="Talla Botas"
        value={formData.tallaBotas}
        onChange={handleTallaBotasChange}
        options={TALLAS_BOTAS.map(talla => ({ value: talla, label: talla }))}
        required
        labelClassName={labelClass}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian los datos del formulario
  return (
    prevProps.formData.genero === nextProps.formData.genero &&
    prevProps.formData.tallaCamisa === nextProps.formData.tallaCamisa &&
    prevProps.formData.tallaPantalon === nextProps.formData.tallaPantalon &&
    prevProps.formData.tallaBotas === nextProps.formData.tallaBotas &&
    prevProps.onFormDataChange === nextProps.onFormDataChange
  );
});

TallaDotacionForm.displayName = 'TallaDotacionForm';
