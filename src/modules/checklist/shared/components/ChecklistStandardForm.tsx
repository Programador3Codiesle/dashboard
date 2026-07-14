'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { CHECKLIST_SEDES, todayIsoDate } from '../constants/sedes';
import { FormularioChecklistConfig } from '../definitions/form-configs';
import { checklistService } from '../services/checklist.service';
import { ChecklistCriterioItem } from './ChecklistCriterioItem';
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
      showSuccess('Los datos se guardaron correctamente');
      setForm(buildInitialState(config));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (e: Error) => showError(e.message),
  });

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    if (!formEl.checkValidity()) {
      showError('Por favor verifique que haya diligenciado todos los campos');
      formEl.reportValidity();
      return;
    }
    guardar.mutate();
  };

  return (
    <div className="space-y-4">
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/checklist" className="hover:underline">
          Checklist
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{config.tituloPagina}</span>
      </nav>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h1 className="mb-4 text-center text-lg font-bold text-gray-800">{config.tituloPagina}</h1>

        <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-4 rounded-xl border p-4 shadow-sm">
          <ChecklistFormHeader
            tituloFormulario={config.tituloFormulario}
            codigoDocumento={config.codigoDocumento}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Responsable</label>
              <input className={inputClass} value={form.responsable} onChange={(e) => setField('responsable', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Equipo</label>
                <input className={inputClass} value={form.equipo} onChange={(e) => setField('equipo', e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Código</label>
                <input
                  className={inputClass}
                  type={config.codigoNumerico ? 'number' : 'text'}
                  value={form.codigo}
                  onChange={(e) => setField('codigo', e.target.value)}
                  required
                />
              </div>
            </div>
            {config.incluirArea !== false && (
              <div>
                <label className="text-sm font-medium text-gray-700">Área</label>
                <input className={inputClass} value={form.area} onChange={(e) => setField('area', e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Sede</label>
              <select className={inputClass} value={form.sede} onChange={(e) => setField('sede', e.target.value)} required>
                {CHECKLIST_SEDES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha diligenciamiento</label>
              <input className={`${inputClass} text-center`} type="date" value={form.fecha} readOnly />
            </div>
          </div>

          <div
            className="rounded-xl p-4 text-center text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }}
          >
            <h5 className="text-lg font-bold tracking-wide">CRITERIOS DE INSPECCIÓN</h5>
            <p className="text-sm opacity-90">
              {config.notaCriterios ??
                'Para el caso de algún ítem que no le aplique colocar NA en las casillas'}
            </p>
          </div>

          {config.criterios.map((criterio, idx) => (
            <div key={criterio.field}>
              {criterio.section && (
                <div
                  className="mb-3 rounded-lg p-2 text-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }}
                >
                  {criterio.section}
                </div>
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

          <div>
            <label className="text-sm font-medium text-gray-700">Seguimiento</label>
            <textarea
              className={`${inputClass} min-h-[96px]`}
              rows={3}
              value={form.obs_seguimiento}
              onChange={(e) => setField('obs_seguimiento', e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className={btnPrimaryClass} disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
