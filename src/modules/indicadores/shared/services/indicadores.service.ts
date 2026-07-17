import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/indicadores`;

export type PresupuestoConsolidado = {
  modo: 'consolidado';
  totalVendido: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  manoObra: number;
  tot: number;
  repuestosTaller: number;
  repuestosMostrador: number;
};

export type PresupuestoSede = {
  sede: string;
  totalDia: number;
  metaMes: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  metaHoy: number;
  porcentajeObjetivo: number;
  porcentajeObjetivoRestante: number;
  tot: number;
  manoObra: number;
  repuestos: number;
};

export type PresupuestoSedes = {
  modo: 'sedes';
  sedes: PresupuestoSede[];
};

export type PresupuestoPosventa = PresupuestoConsolidado | PresupuestoSedes;

export type SedeDetalle = {
  sede: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  tot: number;
  manoObra: number;
  repuestosTaller: number;
  repuestosMostrador: number;
  conDetalleTaller: boolean;
};

export type TallerDetalle = {
  nombre: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  esMostrador: boolean;
};

export type TipoOperacion = {
  operacion: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
};

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  const message = (json as { message?: string | string[] }).message;
  const text = Array.isArray(message) ? message.join(', ') : message;
  throw new Error(text || fallback);
}

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function num(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = row[key];
    if (v != null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function str(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v != null && v !== '') return String(v);
  }
  return '';
}

function bool(row: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const v = row[key];
    if (typeof v === 'boolean') return v;
    if (v === 'true' || v === 1 || v === '1') return true;
  }
  return false;
}

function mapConsolidado(row: Record<string, unknown>): PresupuestoConsolidado {
  return {
    modo: 'consolidado',
    totalVendido: num(row, 'totalVendido', 'total_vendido'),
    metaMes: num(row, 'metaMes', 'meta_mes'),
    metaHoy: num(row, 'metaHoy', 'meta_hoy'),
    porcentajeHoy: num(row, 'porcentajeHoy', 'porcentaje_hoy'),
    porcentajeHoyRestante: num(
      row,
      'porcentajeHoyRestante',
      'porcentaje_hoy_restante',
    ),
    porcentajeMes: num(row, 'porcentajeMes', 'porcentaje_mes'),
    porcentajeMesRestante: num(
      row,
      'porcentajeMesRestante',
      'porcentaje_mes_restante',
    ),
    manoObra: num(row, 'manoObra', 'mano_obra'),
    tot: num(row, 'tot'),
    repuestosTaller: num(row, 'repuestosTaller', 'repuestos_taller'),
    repuestosMostrador: num(row, 'repuestosMostrador', 'repuestos_mostrador'),
  };
}

function mapSede(row: Record<string, unknown>): PresupuestoSede {
  return {
    sede: str(row, 'sede'),
    totalDia: num(row, 'totalDia', 'total_dia'),
    metaMes: num(row, 'metaMes', 'meta_mes'),
    porcentajeMes: num(row, 'porcentajeMes', 'porcentaje_mes'),
    porcentajeMesRestante: num(
      row,
      'porcentajeMesRestante',
      'porcentaje_mes_restante',
    ),
    metaHoy: num(row, 'metaHoy', 'meta_hoy'),
    porcentajeObjetivo: num(row, 'porcentajeObjetivo', 'porcentaje_objetivo'),
    porcentajeObjetivoRestante: num(
      row,
      'porcentajeObjetivoRestante',
      'porcentaje_objetivo_restante',
    ),
    tot: num(row, 'tot'),
    manoObra: num(row, 'manoObra', 'mano_obra'),
    repuestos: num(row, 'repuestos'),
  };
}

function mapSedeDetalle(row: Record<string, unknown>): SedeDetalle {
  return {
    sede: str(row, 'sede'),
    totalDia: num(row, 'totalDia', 'total_dia'),
    metaMes: num(row, 'metaMes', 'meta_mes'),
    metaHoy: num(row, 'metaHoy', 'meta_hoy'),
    porcentajeHoy: num(row, 'porcentajeHoy', 'porcentaje_hoy'),
    porcentajeHoyRestante: num(
      row,
      'porcentajeHoyRestante',
      'porcentaje_hoy_restante',
    ),
    porcentajeMes: num(row, 'porcentajeMes', 'porcentaje_mes'),
    porcentajeMesRestante: num(
      row,
      'porcentajeMesRestante',
      'porcentaje_mes_restante',
    ),
    tot: num(row, 'tot'),
    manoObra: num(row, 'manoObra', 'mano_obra'),
    repuestosTaller: num(row, 'repuestosTaller', 'repuestos_taller'),
    repuestosMostrador: num(row, 'repuestosMostrador', 'repuestos_mostrador'),
    conDetalleTaller: bool(row, 'conDetalleTaller', 'con_detalle_taller'),
  };
}

function mapTaller(row: Record<string, unknown>): TallerDetalle {
  return {
    nombre: str(row, 'nombre'),
    totalDia: num(row, 'totalDia', 'total_dia'),
    metaMes: num(row, 'metaMes', 'meta_mes'),
    metaHoy: num(row, 'metaHoy', 'meta_hoy'),
    porcentajeHoy: num(row, 'porcentajeHoy', 'porcentaje_hoy'),
    porcentajeHoyRestante: num(
      row,
      'porcentajeHoyRestante',
      'porcentaje_hoy_restante',
    ),
    porcentajeMes: num(row, 'porcentajeMes', 'porcentaje_mes'),
    porcentajeMesRestante: num(
      row,
      'porcentajeMesRestante',
      'porcentaje_mes_restante',
    ),
    esMostrador: bool(row, 'esMostrador', 'es_mostrador'),
  };
}

function mapTipoOp(row: Record<string, unknown>): TipoOperacion {
  return {
    operacion: str(row, 'operacion'),
    totalDia: num(row, 'totalDia', 'total_dia'),
    metaMes: num(row, 'metaMes', 'meta_mes'),
    metaHoy: num(row, 'metaHoy', 'meta_hoy'),
    porcentajeHoy: num(row, 'porcentajeHoy', 'porcentaje_hoy'),
    porcentajeHoyRestante: num(
      row,
      'porcentajeHoyRestante',
      'porcentaje_hoy_restante',
    ),
    porcentajeMes: num(row, 'porcentajeMes', 'porcentaje_mes'),
    porcentajeMesRestante: num(
      row,
      'porcentajeMesRestante',
      'porcentaje_mes_restante',
    ),
  };
}

export const indicadoresService = {
  async presupuestoPosventa(): Promise<PresupuestoPosventa> {
    const resp = await fetchWithAuth(`${BASE}/presupuesto-posventa`);
    if (!resp.ok) {
      await parseError(resp, 'No se pudo cargar el presupuesto posventa');
    }
    const raw = await resp.json();
    const row = asRecord(raw);
    if (str(row, 'modo') === 'sedes') {
      const sedesRaw = Array.isArray(row.sedes) ? row.sedes : [];
      return {
        modo: 'sedes',
        sedes: sedesRaw.map((s) => mapSede(asRecord(s))),
      };
    }
    return mapConsolidado(row);
  },

  async presupuestoSedes(): Promise<SedeDetalle[]> {
    const resp = await fetchWithAuth(`${BASE}/presupuesto-posventa/sedes`);
    if (!resp.ok) {
      await parseError(resp, 'No se pudo cargar el detalle por sedes');
    }
    const raw = await resp.json();
    const list = Array.isArray(raw) ? raw : [];
    return list.map((s) => mapSedeDetalle(asRecord(s)));
  },

  async presupuestoTalleres(
    sede: string,
  ): Promise<{ sede: string; talleres: TallerDetalle[] }> {
    const qs = new URLSearchParams({ sede });
    const resp = await fetchWithAuth(
      `${BASE}/presupuesto-posventa/talleres?${qs.toString()}`,
    );
    if (!resp.ok) {
      await parseError(resp, 'No se pudo cargar el detalle por talleres');
    }
    const raw = asRecord(await resp.json());
    const list = Array.isArray(raw.talleres) ? raw.talleres : [];
    return {
      sede: str(raw, 'sede') || sede,
      talleres: list.map((t) => mapTaller(asRecord(t))),
    };
  },

  async presupuestoTipoOperaciones(
    bodega: string,
  ): Promise<{ bodega: string; operaciones: TipoOperacion[] }> {
    const qs = new URLSearchParams({ bodega });
    const resp = await fetchWithAuth(
      `${BASE}/presupuesto-posventa/tipo-operaciones?${qs.toString()}`,
    );
    if (!resp.ok) {
      await parseError(resp, 'No se pudo cargar el detalle por tipo de operación');
    }
    const raw = asRecord(await resp.json());
    const list = Array.isArray(raw.operaciones) ? raw.operaciones : [];
    return {
      bodega: str(raw, 'bodega') || bodega,
      operaciones: list.map((o) => mapTipoOp(asRecord(o))),
    };
  },
};
