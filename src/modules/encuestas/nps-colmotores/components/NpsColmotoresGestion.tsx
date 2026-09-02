'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { useToast } from '@/components/ui/use-toast';
import { EncuestasPageFrame } from '@/modules/encuestas/components/EncuestasPageFrame';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import { EncuestasQueryError } from '@/modules/encuestas/shared/components/EncuestasQueryError';
import { encuestasKeys } from '@/modules/encuestas/shared/constants/query-keys';
import {
  btnInfoClass,
  btnPrimaryClass,
  inputClass,
} from '@/modules/encuestas/shared/constants/ui';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';
import { NPS_COLMOTORES_SUBMENU_ID } from '@/utils/constants';

const SEDES_ALL = [
  'general',
  'prueba',
  'giron',
  'rosita',
  'barranca',
  'bocono',
] as const;

const SEDES_TEC = ['giron', 'rosita', 'barranca', 'bocono'] as const;

const TIPIFICACIONES = [
  'Ninguno',
  'Cumplimiento en cita',
  'Tiempos de entrega',
  'Precios acordados',
  'Atencion',
  'Demora en entrega',
  'Calidad del producto/reparación',
  'Disponibilidad de repuestos',
  'Instalaciones',
  'Horarios',
  'Costos',
] as const;

type Modo = 'sede' | 'tecnico' | null;

export function NpsColmotoresGestion() {
  const { user, blocked } = useEncuestasPageGuard(NPS_COLMOTORES_SUBMENU_ID);
  const { showError, showSuccess, showInfo } = useToast();
  const sesionLista = !!user && !blocked;
  const [modo, setModo] = useState<Modo>(null);
  const [tecnicoFilter, setTecnicoFilter] = useState('');

  const [sedeAll, setSedeAll] = useState('');
  const [fechaAll, setFechaAll] = useState('');
  const [calAll, setCalAll] = useState('');
  const [chk06, setChk06] = useState(false);
  const [chk78, setChk78] = useState(false);
  const [chk910, setChk910] = useState(false);
  const [cal06, setCal06] = useState('0');
  const [cal78, setCal78] = useState('0');
  const [cal910, setCal910] = useState('0');

  const [sedeTec, setSedeTec] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [fechaTec, setFechaTec] = useState('');
  const [vin, setVin] = useState('');
  const [calTec, setCalTec] = useState('');
  const [tipif, setTipif] = useState('Ninguno');
  const [tipoCal, setTipoCal] = useState<'0a6' | '7a8' | '9a10' | ''>('');

  const tecnicosQuery = useQuery({
    queryKey: encuestasKeys.tecnicosNps,
    queryFn: () => encuestasService.listarTecnicos(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const tecnicos = tecnicosQuery.data;
  const tecnicosFiltrados = useMemo(() => {
    const list = tecnicos ?? [];
    const t = tecnicoFilter.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (x) =>
        x.nombre.toLowerCase().includes(t) ||
        x.nit.toLowerCase().includes(t) ||
        (x.patio ?? '').toLowerCase().includes(t),
    );
  }, [tecnicos, tecnicoFilter]);

  const sedeMutation = useMutation({
    mutationFn: (body: {
      sede: string;
      fecha: string;
      calificacion: number;
      cal06: number;
      cal78: number;
      cal910: number;
    }) => encuestasService.insertNpsSede(body),
    onSuccess: () => {
      showSuccess('NPS sede guardado');
      setCalAll('');
      setCal06('0');
      setCal78('0');
      setCal910('0');
      setChk06(false);
      setChk78(false);
      setChk910(false);
    },
    onError: (err) => {
      showError(getErrorMessage(err, 'Error al guardar'));
    },
  });

  const tecnicoMutation = useMutation({
    mutationFn: (body: {
      sede: string;
      tecnico: string;
      fecha: string;
      calificacion: number;
      placa: string;
      tipificacion: string;
      tipo_cal: '0a6' | '7a8' | '9a10';
    }) => encuestasService.insertNpsTecnico(body),
    onSuccess: (result) => {
      if (result.skipped) {
        showInfo(ENCUESTAS_COPY.npsColmotores.tecnicoSkipped);
        return;
      }
      showSuccess('NPS técnico guardado');
      setVin('');
      setCalTec('');
      setTipoCal('');
      setTipif('Ninguno');
    },
    onError: (err) => {
      showError(getErrorMessage(err, 'Error al guardar'));
    },
  });

  const saving = sedeMutation.isPending || tecnicoMutation.isPending;

  if (blocked) return null;

  function onSubmitSede(e: FormEvent) {
    e.preventDefault();
    if (!chk06 && !chk78 && !chk910) {
      showInfo('Marque al menos un rango de calificación');
    }
    sedeMutation.mutate({
      sede: sedeAll,
      fecha: fechaAll,
      calificacion: Number(calAll),
      cal06: chk06 ? Number(cal06) || 0 : 0,
      cal78: chk78 ? Number(cal78) || 0 : 0,
      cal910: chk910 ? Number(cal910) || 0 : 0,
    });
  }

  function onSubmitTecnico(e: FormEvent) {
    e.preventDefault();
    if (!sedeTec || !tecnico || !fechaTec || !vin.trim() || !calTec || !tipoCal) {
      showError('Complete todos los campos requeridos (incluye VIN)');
      return;
    }
    tecnicoMutation.mutate({
      sede: sedeTec,
      tecnico,
      fecha: fechaTec,
      calificacion: Number(calTec),
      placa: vin.trim().toUpperCase(),
      tipificacion: tipif,
      tipo_cal: tipoCal,
    });
  }

  return (
    <EncuestasPageFrame
      title={ENCUESTAS_COPY.npsColmotores.title}
      description={ENCUESTAS_COPY.npsColmotores.description}
      backHref="/dashboard/encuestas"
      backLabel={ENCUESTAS_COPY.npsColmotores.backLabel}
    >
      {tecnicosQuery.isError ? (
        <EncuestasQueryError
          message={getErrorMessage(
            tecnicosQuery.error,
            ENCUESTAS_COPY.npsColmotores.loadError,
          )}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimaryClass}
          onClick={() => setModo('sede')}
        >
          NPS por sede
        </button>
        <button
          type="button"
          className={btnInfoClass}
          onClick={() => {
            if (fechaAll) {
              showError('No se puede: hay fecha en formulario de sede');
              return;
            }
            setModo('tecnico');
          }}
        >
          NPS por técnico
        </button>
      </div>

      {modo === 'sede' && (
        <form
          onSubmit={onSubmitSede}
          className="space-y-4 rounded-lg border bg-card p-4"
        >
          <h2 className="font-semibold">NPS por sede</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label htmlFor="nps-sede-all" className="text-sm">
              Sede
              <select
                id="nps-sede-all"
                required
                className={`mt-1 ${inputClass}`}
                value={sedeAll}
                onChange={(e) => setSedeAll(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {SEDES_ALL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="nps-fecha-all" className="text-sm">
              Fecha
              <input
                id="nps-fecha-all"
                required
                type="date"
                className={`mt-1 ${inputClass}`}
                value={fechaAll}
                onChange={(e) => setFechaAll(e.target.value)}
              />
            </label>
            <label htmlFor="nps-cal-all" className="text-sm">
              Calificación
              <input
                id="nps-cal-all"
                required
                type="number"
                step="0.01"
                className={`mt-1 ${inputClass}`}
                value={calAll}
                onChange={(e) => setCalAll(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <RangoCheck
              idPrefix="nps-rango-06"
              label="0-6"
              checked={chk06}
              onCheck={setChk06}
              value={cal06}
              onValue={setCal06}
            />
            <RangoCheck
              idPrefix="nps-rango-78"
              label="7-8"
              checked={chk78}
              onCheck={setChk78}
              value={cal78}
              onValue={setCal78}
            />
            <RangoCheck
              idPrefix="nps-rango-910"
              label="9-10"
              checked={chk910}
              onCheck={setChk910}
              value={cal910}
              onValue={setCal910}
            />
          </div>
          <button type="submit" disabled={saving} className={btnPrimaryClass}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      {modo === 'tecnico' && (
        <form
          onSubmit={onSubmitTecnico}
          className="space-y-4 rounded-lg border bg-card p-4"
        >
          <h2 className="font-semibold">NPS por técnico</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label htmlFor="nps-sede-tec" className="text-sm">
              Sede
              <select
                id="nps-sede-tec"
                required
                className={`mt-1 ${inputClass}`}
                value={sedeTec}
                onChange={(e) => setSedeTec(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {SEDES_TEC.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-sm sm:col-span-2">
              <label htmlFor="nps-tecnico-filter" className="block">
                Técnico
              </label>
              <input
                id="nps-tecnico-filter"
                className={`mt-1 ${inputClass} text-xs`}
                placeholder="Filtrar técnico..."
                value={tecnicoFilter}
                onChange={(e) => setTecnicoFilter(e.target.value)}
              />
              <label htmlFor="nps-tecnico" className="sr-only">
                Seleccionar técnico
              </label>
              <select
                id="nps-tecnico"
                required
                className={`mt-1 ${inputClass}`}
                value={tecnico}
                onChange={(e) => setTecnico(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {tecnicosFiltrados.map((t) => (
                  <option key={t.nit} value={t.nit}>
                    {t.nombre} ({t.nit}){t.patio ? ` — ${t.patio}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <label htmlFor="nps-fecha-tec" className="text-sm">
              Fecha
              <input
                id="nps-fecha-tec"
                required
                type="date"
                className={`mt-1 ${inputClass}`}
                value={fechaTec}
                onChange={(e) => setFechaTec(e.target.value)}
              />
            </label>
            <label htmlFor="nps-vin" className="text-sm">
              VIN / Placa
              <input
                id="nps-vin"
                required
                className={`mt-1 ${inputClass} uppercase`}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </label>
            <label htmlFor="nps-cal-tec" className="text-sm">
              Calificación
              <input
                id="nps-cal-tec"
                required
                type="number"
                step="0.01"
                className={`mt-1 ${inputClass}`}
                value={calTec}
                onChange={(e) => setCalTec(e.target.value)}
              />
            </label>
            <label htmlFor="nps-tipif" className="text-sm">
              Tipificación
              <select
                id="nps-tipif"
                className={`mt-1 ${inputClass}`}
                value={tipif}
                onChange={(e) => setTipif(e.target.value)}
              >
                {TIPIFICACIONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="nps-tipo-cal" className="text-sm">
              Tipo de rango
              <select
                id="nps-tipo-cal"
                required
                className={`mt-1 ${inputClass}`}
                value={tipoCal}
                onChange={(e) =>
                  setTipoCal(e.target.value as '0a6' | '7a8' | '9a10' | '')
                }
              >
                <option value="">Seleccione...</option>
                <option value="0a6">0-6</option>
                <option value="7a8">7-8</option>
                <option value="9a10">9-10</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving} className={btnInfoClass}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}
    </EncuestasPageFrame>
  );
}

function RangoCheck({
  idPrefix,
  label,
  checked,
  onCheck,
  value,
  onValue,
}: {
  idPrefix: string;
  label: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  value: string;
  onValue: (v: string) => void;
}) {
  const checkId = `${idPrefix}-chk`;
  const valueId = `${idPrefix}-val`;
  return (
    <div className="rounded border p-3 text-sm">
      <label htmlFor={checkId} className="flex items-center gap-2">
        <input
          id={checkId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
        />
        Cantidad {label}
      </label>
      {checked && (
        <input
          id={valueId}
          type="number"
          min={0}
          className={`mt-2 ${inputClass}`}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          aria-label={`Cantidad ${label}`}
        />
      )}
    </div>
  );
}
