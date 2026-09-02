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

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h1 className="mb-4 text-center text-lg font-bold">{CHECKLIST_COPY.trabajoCalienteTitulo}</h1>

        <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-4 rounded-xl border p-4">
          <ChecklistFormHeader
            tituloFormulario="PERMISO DE TRABAJO EN CALIENTE"
            codigoDocumento="CÓDIGO: GH-SST-F | Formato de permiso y checklist"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1" colSpan={2}>
                    Participante 1
                  </th>
                  <th className="border px-2 py-1">Cédula</th>
                  <th className="border px-2 py-1">ARL</th>
                  <th className="border px-2 py-1">EPS</th>
                  <th className="border px-2 py-1">AFP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1" colSpan={2}>
                    <input
                      aria-label="Nombre participante 1"
                      className={inputClass}
                      value={form.nombre_pa_1}
                      onChange={(e) => setField('nombre_pa_1', e.target.value.toUpperCase())}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="Cédula participante 1"
                      className={inputClass}
                      type="number"
                      value={form.cedula_pa_1}
                      onChange={(e) => setField('cedula_pa_1', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="ARL participante 1"
                      className={inputClass}
                      value={form.arl_pa_1}
                      onChange={(e) => setField('arl_pa_1', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="EPS participante 1"
                      className={inputClass}
                      value={form.eps_pa_1}
                      onChange={(e) => setField('eps_pa_1', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="AFP participante 1"
                      className={inputClass}
                      value={form.afp_pa_1}
                      onChange={(e) => setField('afp_pa_1', e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border px-2 py-1" colSpan={2}>
                    <input
                      aria-label="Nombre participante 2"
                      className={inputClass}
                      value={form.nombre_pa_2}
                      onChange={(e) => setField('nombre_pa_2', e.target.value.toUpperCase())}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="Cédula participante 2"
                      className={inputClass}
                      type="number"
                      value={form.cedula_pa_2}
                      onChange={(e) => setField('cedula_pa_2', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="ARL participante 2"
                      className={inputClass}
                      value={form.arl_pa_2}
                      onChange={(e) => setField('arl_pa_2', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="EPS participante 2"
                      className={inputClass}
                      value={form.eps_pa_2}
                      onChange={(e) => setField('eps_pa_2', e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      aria-label="AFP participante 2"
                      className={inputClass}
                      value={form.afp_pa_2}
                      onChange={(e) => setField('afp_pa_2', e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ChecklistField id="chk-fecha-calor" label="Fecha diligenciamiento">
            <input
              id="chk-fecha-calor"
              className={`${inputClass} max-w-xs text-center`}
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
