'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import {
  encuestasService,
  type TecnicoNps,
} from '@/modules/encuestas/shared/services/encuestas.service';
import { NPS_COLMOTORES_SUBMENU_ID } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';

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
  const { blocked } = useEncuestasPageGuard(NPS_COLMOTORES_SUBMENU_ID);
  const { showError, showSuccess, showInfo } = useToast();
  const [modo, setModo] = useState<Modo>(null);
  const [tecnicos, setTecnicos] = useState<TecnicoNps[]>([]);
  const [tecnicoFilter, setTecnicoFilter] = useState('');
  const [saving, setSaving] = useState(false);

  // sede form
  const [sedeAll, setSedeAll] = useState('');
  const [fechaAll, setFechaAll] = useState('');
  const [calAll, setCalAll] = useState('');
  const [chk06, setChk06] = useState(false);
  const [chk78, setChk78] = useState(false);
  const [chk910, setChk910] = useState(false);
  const [cal06, setCal06] = useState('0');
  const [cal78, setCal78] = useState('0');
  const [cal910, setCal910] = useState('0');

  // tecnico form
  const [sedeTec, setSedeTec] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [fechaTec, setFechaTec] = useState('');
  const [vin, setVin] = useState('');
  const [calTec, setCalTec] = useState('');
  const [tipif, setTipif] = useState('Ninguno');
  const [tipoCal, setTipoCal] = useState<'0a6' | '7a8' | '9a10' | ''>('');

  useEffect(() => {
    if (blocked) return;
    encuestasService
      .listarTecnicos()
      .then(setTecnicos)
      .catch((e) =>
        showError(e instanceof Error ? e.message : 'Error técnicos'),
      );
  }, [blocked, showError]);

  const tecnicosFiltrados = useMemo(() => {
    const t = tecnicoFilter.trim().toLowerCase();
    if (!t) return tecnicos;
    return tecnicos.filter(
      (x) =>
        x.nombre.toLowerCase().includes(t) ||
        x.nit.toLowerCase().includes(t) ||
        (x.patio ?? '').toLowerCase().includes(t),
    );
  }, [tecnicos, tecnicoFilter]);

  if (blocked) return null;

  async function onSubmitSede(e: FormEvent) {
    e.preventDefault();
    if (!chk06 && !chk78 && !chk910) {
      showInfo('Marque al menos un rango de calificación');
    }
    setSaving(true);
    try {
      await encuestasService.insertNpsSede({
        sede: sedeAll,
        fecha: fechaAll,
        calificacion: Number(calAll),
        cal06: chk06 ? Number(cal06) || 0 : 0,
        cal78: chk78 ? Number(cal78) || 0 : 0,
        cal910: chk910 ? Number(cal910) || 0 : 0,
      });
      showSuccess('NPS sede guardado');
      setCalAll('');
      setCal06('0');
      setCal78('0');
      setCal910('0');
      setChk06(false);
      setChk78(false);
      setChk910(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function onSubmitTecnico(e: FormEvent) {
    e.preventDefault();
    if (!sedeTec || !tecnico || !fechaTec || !vin.trim() || !calTec || !tipoCal) {
      showError('Complete todos los campos requeridos (incluye VIN)');
      return;
    }
    setSaving(true);
    try {
      await encuestasService.insertNpsTecnico({
        sede: sedeTec,
        tecnico,
        fecha: fechaTec,
        calificacion: Number(calTec),
        placa: vin.trim().toUpperCase(),
        tipificacion: tipif,
        tipo_cal: tipoCal,
      });
      showSuccess('NPS técnico guardado');
      setVin('');
      setCalTec('');
      setTipoCal('');
      setTipif('Ninguno');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title-xl brand-text">Ingreso NPS Colmotores</h1>
          <p className="text-sm text-muted-foreground">
            Registro manual de NPS por sede o por técnico
          </p>
        </div>
        <Link href="/dashboard/encuestas" className="text-sm text-amber-700 hover:underline">
          ← Volver a Encuestas
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          onClick={() => setModo('sede')}
        >
          NPS por sede
        </button>
        <button
          type="button"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
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
            <label className="text-sm">
              Sede
              <select
                required
                className="mt-1 w-full rounded border px-2 py-2"
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
            <label className="text-sm">
              Fecha
              <input
                required
                type="date"
                className="mt-1 w-full rounded border px-2 py-2"
                value={fechaAll}
                onChange={(e) => setFechaAll(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Calificación
              <input
                required
                type="number"
                step="0.01"
                className="mt-1 w-full rounded border px-2 py-2"
                value={calAll}
                onChange={(e) => setCalAll(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <RangoCheck
              label="0-6"
              checked={chk06}
              onCheck={setChk06}
              value={cal06}
              onValue={setCal06}
            />
            <RangoCheck
              label="7-8"
              checked={chk78}
              onCheck={setChk78}
              value={cal78}
              onValue={setCal78}
            />
            <RangoCheck
              label="9-10"
              checked={chk910}
              onCheck={setChk910}
              value={cal910}
              onValue={setCal910}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
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
            <label className="text-sm">
              Sede
              <select
                required
                className="mt-1 w-full rounded border px-2 py-2"
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
            <label className="text-sm sm:col-span-2">
              Técnico
              <input
                className="mt-1 w-full rounded border px-2 py-1 text-xs"
                placeholder="Filtrar técnico..."
                value={tecnicoFilter}
                onChange={(e) => setTecnicoFilter(e.target.value)}
              />
              <select
                required
                className="mt-1 w-full rounded border px-2 py-2"
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
            </label>
            <label className="text-sm">
              Fecha
              <input
                required
                type="date"
                className="mt-1 w-full rounded border px-2 py-2"
                value={fechaTec}
                onChange={(e) => setFechaTec(e.target.value)}
              />
            </label>
            <label className="text-sm">
              VIN / Placa
              <input
                required
                className="mt-1 w-full rounded border px-2 py-2 uppercase"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </label>
            <label className="text-sm">
              Calificación
              <input
                required
                type="number"
                step="0.01"
                className="mt-1 w-full rounded border px-2 py-2"
                value={calTec}
                onChange={(e) => setCalTec(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Tipificación
              <select
                className="mt-1 w-full rounded border px-2 py-2"
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
            <label className="text-sm">
              Tipo de rango
              <select
                required
                className="mt-1 w-full rounded border px-2 py-2"
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
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}
    </div>
  );
}

function RangoCheck({
  label,
  checked,
  onCheck,
  value,
  onValue,
}: {
  label: string;
  checked: boolean;
  onCheck: (v: boolean) => void;
  value: string;
  onValue: (v: string) => void;
}) {
  return (
    <div className="rounded border p-3 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
        />
        Cantidad {label}
      </label>
      {checked && (
        <input
          type="number"
          min={0}
          className="mt-2 w-full rounded border px-2 py-1"
          value={value}
          onChange={(e) => onValue(e.target.value)}
        />
      )}
    </div>
  );
}
