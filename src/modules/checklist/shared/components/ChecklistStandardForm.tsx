'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { ChecklistBreadcrumb } from '@/modules/checklist/components/ChecklistBreadcrumb';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';
import {
  btnPrimaryClass,
  checklistHeroBannerClass,
  checklistSectionBannerClass,
  inputClass,
} from '@/modules/checklist/shared/constants/ui';
import { CHECKLIST_SEDES, todayIsoDate } from '../constants/sedes';
import type { FormularioChecklistConfig } from '../definitions/form-configs';
import { useChecklistFormSubmit } from '../hooks/useChecklistFormSubmit';
import { checklistService } from '../services/checklist.service';
import { getErrorMessage } from '../utils/parse-api-error';
import { ChecklistCriterioItem } from './ChecklistCriterioItem';
import { ChecklistField } from './ChecklistField';
import { ChecklistFormHeader } from './ChecklistFormHeader';

type Props = {
  config: FormularioChecklistConfig;
};

function buildInitialState(config: FormularioChecklistConfig): Record<string, string> {
  const state: Record<string, string> = {
    responsable: '',
    equipo: '',
    codigo: '',
    area: '',
    sede: 'Giron',
    fecha: todayIsoDate(),
    obs_seguimiento: '',
  };
  for (const c of config.criterios) {
    state[c.field] = '';
    if (c.obsField) state[c.obsField] = '';
  }
  return state;
}

export function ChecklistStandardForm({ config }: Props) {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState(() => buildInitialState(config));

  const guardar = useMutation({
    mutationFn: () => {
      const data: Record<string, string | number> = { ...form };
      if (config.codigoNumerico && data.codigo !== '') {
        data.codigo = Number(data.codigo);
      }
      return checklistService.guardar({ check: config.check, data });
    },
    onSuccess: () => {
      showSuccess(CHECKLIST_COPY.saveSuccess);
      setForm(buildInitialState(config));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (e: unknown) => showError(getErrorMessage(e, CHECKLIST_COPY.saveError)),
  });

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = useChecklistFormSubmit(() => guardar.mutate());

  return (
    <div className="space-y-4">
      <ChecklistBreadcrumb current={config.tituloPagina} />

      <div className="app-section-card w-full min-w-0">
        <h1 className="app-title-xl brand-text mb-4 text-center">{config.tituloPagina}</h1>

        <form
          data-testid="checklist-form"
          onSubmit={onSubmit}
          className="mx-auto w-full min-w-0 max-w-4xl space-y-4"
        >
          <ChecklistFormHeader
            tituloFormulario={config.tituloFormulario}
            codigoDocumento={config.codigoDocumento}
          />

          <div className="app-form-grid-2">
            <ChecklistField id="chk-responsable" label="Responsable">
              <input
                id="chk-responsable"
                className={inputClass}
                value={form.responsable}
                onChange={(e) => setField('responsable', e.target.value)}
                required
              />
            </ChecklistField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChecklistField id="chk-equipo" label="Equipo">
                <input
                  id="chk-equipo"
                  className={inputClass}
                  value={form.equipo}
                  onChange={(e) => setField('equipo', e.target.value)}
                  required
                />
              </ChecklistField>
              <ChecklistField id="chk-codigo" label="Código">
                <input
                  id="chk-codigo"
                  className={inputClass}
                  type={config.codigoNumerico ? 'number' : 'text'}
                  value={form.codigo}
                  onChange={(e) => setField('codigo', e.target.value)}
                  required
                />
              </ChecklistField>
            </div>
            {config.incluirArea !== false && (
              <ChecklistField id="chk-area" label="Área">
                <input
                  id="chk-area"
                  className={inputClass}
                  value={form.area}
                  onChange={(e) => setField('area', e.target.value)}
                  required
                />
              </ChecklistField>
            )}
            <ChecklistField id="chk-sede" label="Sede">
              <select
                id="chk-sede"
                className={inputClass}
                value={form.sede}
                onChange={(e) => setField('sede', e.target.value)}
                required
              >
                {CHECKLIST_SEDES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </ChecklistField>
            <ChecklistField id="chk-fecha" label="Fecha diligenciamiento">
              <input
                id="chk-fecha"
                className={`${inputClass} text-center`}
                type="date"
                value={form.fecha}
                readOnly
              />
            </ChecklistField>
          </div>

          <div className={checklistHeroBannerClass}>
            <h5 className="text-base font-bold tracking-wide sm:text-lg">{CHECKLIST_COPY.criteriosTitulo}</h5>
            <p className="text-sm opacity-90">
              {config.notaCriterios ??
                'Para el caso de algún ítem que no le aplique colocar NA en las casillas'}
            </p>
          </div>

          {config.criterios.map((criterio, idx) => (
            <div key={criterio.field}>
              {criterio.section && (
                <div className={`mb-3 ${checklistSectionBannerClass}`}>{criterio.section}</div>
              )}
              <ChecklistCriterioItem
                numero={idx + 1}
                criterio={criterio}
                value={form[criterio.field]}
                obsValue={criterio.obsField ? form[criterio.obsField] : ''}
                onChange={setField}
                onObsChange={setField}
              />
            </div>
          ))}

          <ChecklistField id="chk-seguimiento" label="Seguimiento">
            <textarea
              id="chk-seguimiento"
              className={`${inputClass} min-h-[96px]`}
              rows={3}
              value={form.obs_seguimiento}
              onChange={(e) => setField('obs_seguimiento', e.target.value)}
            />
          </ChecklistField>

          <div className="flex justify-end">
            <button type="submit" className={btnPrimaryClass} disabled={guardar.isPending}>
              {guardar.isPending ? CHECKLIST_COPY.saving : CHECKLIST_COPY.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
