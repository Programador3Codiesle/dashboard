'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { ChecklistBreadcrumb } from '@/modules/checklist/components/ChecklistBreadcrumb';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';
import { CHECKLIST_SEDES, todayIsoDate } from '@/modules/checklist/shared/constants/sedes';
import {
  btnPrimaryClass,
  checklistSectionBannerClass,
  inputClass,
} from '@/modules/checklist/shared/constants/ui';
import {
  LABOR_CALOR_ALL_CRITERIOS,
  LABOR_CALOR_ANTES,
  LABOR_CALOR_DESPUES,
  LABOR_CALOR_DURANTE,
  LABOR_CALOR_EPP,
} from '@/modules/checklist/shared/definitions/labor-calor-config';
import { ChecklistCriterioItem } from '@/modules/checklist/shared/components/ChecklistCriterioItem';
import { ChecklistField } from '@/modules/checklist/shared/components/ChecklistField';
import { ChecklistFormHeader } from '@/modules/checklist/shared/components/ChecklistFormHeader';
import { useChecklistFormSubmit } from '@/modules/checklist/shared/hooks/useChecklistFormSubmit';
import { checklistService } from '@/modules/checklist/shared/services/checklist.service';
import { getErrorMessage } from '@/modules/checklist/shared/utils/parse-api-error';

function buildInitial(): Record<string, string> {
  const state: Record<string, string> = {
    area_trabajo: '',
    proposito_trabajo: '',
    sede: 'Giron',
    fecha: todayIsoDate(),
    nombre_pa_1: '',
    cedula_pa_1: '',
    arl_pa_1: '',
    eps_pa_1: '',
    afp_pa_1: '',
    nombre_pa_2: '',
    cedula_pa_2: '',
    arl_pa_2: '',
    eps_pa_2: '',
    afp_pa_2: '',
    observacion_general: '',
  };
  for (const c of LABOR_CALOR_ALL_CRITERIOS) {
    state[c.field] = '';
  }
  return state;
}

function Section({
  title,
  items,
  form,
  setField,
  startIndex,
}: {
  title: string;
  items: typeof LABOR_CALOR_ANTES;
  form: Record<string, string>;
  setField: (f: string, v: string) => void;
  startIndex: number;
}) {
  return (
    <div className="space-y-3">
      <div className={checklistSectionBannerClass}>{title}</div>
      {items.map((criterio, i) => (
        <ChecklistCriterioItem
          key={criterio.field}
          numero={startIndex + i}
          criterio={criterio}
          value={form[criterio.field]}
          onChange={setField}
        />
      ))}
    </div>
  );
}

function ParticipanteBlock({
  n,
  form,
  setField,
}: {
  n: 1 | 2;
  form: Record<string, string>;
  setField: (field: string, value: string) => void;
}) {
  const nombre = n === 1 ? 'nombre_pa_1' : 'nombre_pa_2';
  const cedula = n === 1 ? 'cedula_pa_1' : 'cedula_pa_2';
  const arl = n === 1 ? 'arl_pa_1' : 'arl_pa_2';
  const eps = n === 1 ? 'eps_pa_1' : 'eps_pa_2';
  const afp = n === 1 ? 'afp_pa_1' : 'afp_pa_2';

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-gray-800">Participante {n}</h3>
      <div className="app-form-grid-2">
        <ChecklistField id={`chk-nombre-pa-${n}`} label="Nombre" className="md:col-span-2">
          <input
            id={`chk-nombre-pa-${n}`}
            aria-label={`Nombre participante ${n}`}
            className={inputClass}
            value={form[nombre]}
            onChange={(e) => setField(nombre, e.target.value.toUpperCase())}
          />
        </ChecklistField>
        <ChecklistField id={`chk-cedula-pa-${n}`} label="Cédula">
          <input
            id={`chk-cedula-pa-${n}`}
            aria-label={`Cédula participante ${n}`}
            className={inputClass}
            type="number"
            value={form[cedula]}
            onChange={(e) => setField(cedula, e.target.value)}
          />
        </ChecklistField>
        <ChecklistField id={`chk-arl-pa-${n}`} label="ARL">
          <input
            id={`chk-arl-pa-${n}`}
            aria-label={`ARL participante ${n}`}
            className={inputClass}
            value={form[arl]}
            onChange={(e) => setField(arl, e.target.value)}
          />
        </ChecklistField>
        <ChecklistField id={`chk-eps-pa-${n}`} label="EPS">
          <input
            id={`chk-eps-pa-${n}`}
            aria-label={`EPS participante ${n}`}
            className={inputClass}
            value={form[eps]}
            onChange={(e) => setField(eps, e.target.value)}
          />
        </ChecklistField>
        <ChecklistField id={`chk-afp-pa-${n}`} label="AFP">
          <input
            id={`chk-afp-pa-${n}`}
            aria-label={`AFP participante ${n}`}
            className={inputClass}
            value={form[afp]}
            onChange={(e) => setField(afp, e.target.value)}
          />
        </ChecklistField>
      </div>
    </div>
  );
}

export function LaborCalorForm() {
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState(buildInitial);

  const guardar = useMutation({
    mutationFn: () => {
      const data: Record<string, string | number> = { ...form };
      if (data.cedula_pa_1) data.cedula_pa_1 = Number(data.cedula_pa_1);
      if (data.cedula_pa_2) data.cedula_pa_2 = Number(data.cedula_pa_2);
      return checklistService.guardar({ check: 0, data });
    },
    onSuccess: () => {
      showSuccess(CHECKLIST_COPY.saveSuccess);
      setForm(buildInitial());
    },
    onError: (e: unknown) => showError(getErrorMessage(e, CHECKLIST_COPY.saveError)),
  });

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = useChecklistFormSubmit(() => guardar.mutate());

  return (
    <div className="space-y-4">
      <ChecklistBreadcrumb current={CHECKLIST_COPY.trabajoCalienteBreadcrumb} />

      <div className="app-section-card w-full min-w-0">
        <h1 className="app-title-xl brand-text mb-4 text-center">{CHECKLIST_COPY.trabajoCalienteTitulo}</h1>

        <form onSubmit={onSubmit} className="mx-auto w-full min-w-0 max-w-5xl space-y-4">
          <ChecklistFormHeader
            tituloFormulario="PERMISO DE TRABAJO EN CALIENTE"
            codigoDocumento="CÓDIGO: GH-SST-F | Formato de permiso y checklist"
          />

          <div className="app-form-grid-2">
            <ChecklistField id="chk-area-trabajo" label="Área de trabajo">
              <input
                id="chk-area-trabajo"
                className={inputClass}
                value={form.area_trabajo}
                onChange={(e) => setField('area_trabajo', e.target.value)}
                required
              />
            </ChecklistField>
            <ChecklistField id="chk-sede-calor" label="Sede">
              <select
                id="chk-sede-calor"
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
            <ChecklistField
              id="chk-proposito"
              label="Propósito del trabajo"
              className="md:col-span-2"
            >
              <input
                id="chk-proposito"
                className={inputClass}
                value={form.proposito_trabajo}
                onChange={(e) => setField('proposito_trabajo', e.target.value)}
                required
              />
            </ChecklistField>
          </div>

          <div className="space-y-3">
            <ParticipanteBlock n={1} form={form} setField={setField} />
            <ParticipanteBlock n={2} form={form} setField={setField} />
          </div>

          <ChecklistField id="chk-fecha-calor" label="Fecha diligenciamiento">
            <input
              id="chk-fecha-calor"
              className={`${inputClass} w-full sm:max-w-xs text-center`}
              type="date"
              value={form.fecha}
              readOnly
            />
          </ChecklistField>

          <Section
            title="ANTES DE INICIAR"
            items={LABOR_CALOR_ANTES}
            form={form}
            setField={setField}
            startIndex={1}
          />
          <Section
            title="ELEMENTOS DE PROTECCIÓN PERSONAL"
            items={LABOR_CALOR_EPP}
            form={form}
            setField={setField}
            startIndex={7}
          />
          <Section
            title="DURANTE LA EJECUCIÓN"
            items={LABOR_CALOR_DURANTE}
            form={form}
            setField={setField}
            startIndex={18}
          />
          <Section
            title="AL TERMINAR"
            items={LABOR_CALOR_DESPUES}
            form={form}
            setField={setField}
            startIndex={31}
          />

          <ChecklistField id="chk-obs-general" label="Observaciones generales">
            <textarea
              id="chk-obs-general"
              className={`${inputClass} min-h-[96px]`}
              value={form.observacion_general}
              onChange={(e) => setField('observacion_general', e.target.value)}
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
