'use client';

import { Plus, Trash2 } from 'lucide-react';
import { MantenimientoFileField } from '@/modules/mantenimiento/shared/components/MantenimientoFileField';
import {
  PERIODOS_MTTO,
  type DatosHidraulicosForm,
  type DatosTecnicosForm,
} from '../utils/hoja-vida';

function ListaDinamica({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => onChange([...items, ''])}
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-gray-500">Sin ítems. Agrega uno si aplica.</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-2 w-5 shrink-0 text-xs text-gray-400">{i + 1}.</span>
            <textarea
              className="min-h-[40px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={2}
              placeholder={placeholder}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
              aria-label="Quitar"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export type HojaVidaFormState = {
  fabricante: string;
  modelo: string;
  marca: string;
  ubicacion: string;
  sector: string;
  descripcion: string;
  periodo_mtto_preventivo: string;
  dist_nombre: string;
  dist_direccion: string;
  dist_telefono: string;
  dist_ciudad: string;
  dist_departamento: string;
  dist_redes_sociales: string;
  tiene_tecnicos: boolean;
  tiene_hidraulicos: boolean;
  tecnicos: DatosTecnicosForm;
  hidraulicos: DatosHidraulicosForm;
  elementos: string[];
  recomendaciones: string[];
  mtto_operativo: string[];
  file: File | null;
};

type Props = {
  value: HojaVidaFormState;
  onChange: (patch: Partial<HojaVidaFormState>) => void;
};

export function HojaVidaFormFields({ value, onChange }: Props) {
  const setTec = (patch: Partial<DatosTecnicosForm>) =>
    onChange({ tecnicos: { ...value.tecnicos, ...patch } });
  const setHid = (patch: Partial<DatosHidraulicosForm>) =>
    onChange({ hidraulicos: { ...value.hidraulicos, ...patch } });

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Identificación de ficha
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Fabricante"
            value={value.fabricante}
            onChange={(e) => onChange({ fabricante: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Marca"
            value={value.marca}
            onChange={(e) => onChange({ marca: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Modelo"
            value={value.modelo}
            onChange={(e) => onChange({ modelo: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Ubicación"
            value={value.ubicacion}
            onChange={(e) => onChange({ ubicacion: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Sector"
            value={value.sector}
            onChange={(e) => onChange({ sector: e.target.value })}
          />
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={value.periodo_mtto_preventivo}
            onChange={(e) =>
              onChange({ periodo_mtto_preventivo: e.target.value })
            }
          >
            {PERIODOS_MTTO.map((p) => (
              <option key={p.value || 'na'} value={p.value}>
                Periodo mtto preventivo: {p.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          rows={3}
          placeholder="Descripción del equipo"
          value={value.descripcion}
          onChange={(e) => onChange({ descripcion: e.target.value })}
        />
        <MantenimientoFileField
          label="Imagen del equipo"
          file={value.file}
          accept="image/*"
          placeholder="Foto del equipo (opcional)"
          onChange={(file) => onChange({ file })}
        />
      </section>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={value.tiene_tecnicos}
              onChange={(e) => onChange({ tiene_tecnicos: e.target.checked })}
            />
            Datos técnicos
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={value.tiene_hidraulicos}
              onChange={(e) =>
                onChange({ tiene_hidraulicos: e.target.checked })
              }
            />
            Datos hidráulicos
          </label>
        </div>

        {value.tiene_tecnicos && (
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="sm:col-span-2 text-xs font-semibold uppercase text-[var(--color-info)]">
              Datos técnicos
            </p>
            {(
              [
                ['alimentacion', 'Alimentación'],
                ['frecuencia_alimentacion', 'Frecuencia de alimentación'],
                ['anio_fabricacion', 'Año de fabricación'],
                ['numero_serie', 'Número de serie'],
                ['potencia_consumo', 'Potencia de consumo'],
                ['peso', 'Peso'],
                ['revolucion', 'Revolución'],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder={label}
                value={value.tecnicos[key]}
                onChange={(e) => setTec({ [key]: e.target.value })}
              />
            ))}
          </div>
        )}

        {value.tiene_hidraulicos && (
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="sm:col-span-2 text-xs font-semibold uppercase text-[var(--color-success)]">
              Datos hidráulicos
            </p>
            {(
              [
                ['capacidad_litros', 'Capacidad en litros'],
                ['capacidad_carga_tn', 'Capacidad de carga (tn)'],
                ['tipo_aceite', 'Tipo de aceite'],
                ['capacidad_maxima_carga', 'Capacidad máxima de carga'],
              ] as const
            ).map(([key, label]) => (
              <input
                key={key}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder={label}
                value={value.hidraulicos[key]}
                onChange={(e) => setHid({ [key]: e.target.value })}
              />
            ))}
          </div>
        )}
      </section>

      <ListaDinamica
        label="Elementos que componen el equipo"
        items={value.elementos}
        onChange={(elementos) => onChange({ elementos })}
        placeholder="Ej. Interruptor tipo gatillo"
      />
      <ListaDinamica
        label="Recomendaciones de uso"
        items={value.recomendaciones}
        onChange={(recomendaciones) => onChange({ recomendaciones })}
        placeholder="Recomendación de seguridad / uso"
      />
      <ListaDinamica
        label="Mantenimiento operativo"
        items={value.mtto_operativo}
        onChange={(mtto_operativo) => onChange({ mtto_operativo })}
        placeholder="Ej. Limpieza general (cada 3 meses)"
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Contacto del distribuidor
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Nombre"
            value={value.dist_nombre}
            onChange={(e) => onChange({ dist_nombre: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
            placeholder="Dirección"
            value={value.dist_direccion}
            onChange={(e) => onChange({ dist_direccion: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Teléfono"
            value={value.dist_telefono}
            onChange={(e) => onChange({ dist_telefono: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Ciudad"
            value={value.dist_ciudad}
            onChange={(e) => onChange({ dist_ciudad: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Departamento"
            value={value.dist_departamento}
            onChange={(e) => onChange({ dist_departamento: e.target.value })}
          />
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Enlace redes sociales"
            value={value.dist_redes_sociales}
            onChange={(e) => onChange({ dist_redes_sociales: e.target.value })}
          />
        </div>
      </section>
    </div>
  );
}

export function emptyHojaVidaForm(): HojaVidaFormState {
  return {
    fabricante: '',
    modelo: '',
    marca: '',
    ubicacion: '',
    sector: '',
    descripcion: '',
    periodo_mtto_preventivo: '',
    dist_nombre: '',
    dist_direccion: '',
    dist_telefono: '',
    dist_ciudad: '',
    dist_departamento: '',
    dist_redes_sociales: '',
    tiene_tecnicos: false,
    tiene_hidraulicos: false,
    tecnicos: {
      alimentacion: '',
      frecuencia_alimentacion: '',
      anio_fabricacion: '',
      numero_serie: '',
      potencia_consumo: '',
      peso: '',
      revolucion: '',
    },
    hidraulicos: {
      capacidad_litros: '',
      capacidad_carga_tn: '',
      tipo_aceite: '',
      capacidad_maxima_carga: '',
    },
    elementos: [],
    recomendaciones: [],
    mtto_operativo: [],
    file: null,
  };
}
