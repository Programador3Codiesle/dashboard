'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import {
  encuestasService,
  type SatisfaccionDetalle,
} from '@/modules/encuestas/shared/services/encuestas.service';
import { SATISFACCION_SUBMENU_ID } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';

function colorNps(val: string | number | null | undefined): string {
  const n = Number(val);
  if (!Number.isFinite(n)) return 'bg-slate-500';
  if (n >= 9) return 'bg-emerald-600';
  if (n >= 7) return 'bg-amber-500';
  return 'bg-red-600';
}

function colorSn(val: string | number | null | undefined): string {
  const s = String(val ?? '').toUpperCase();
  if (s === 'SI') return 'bg-emerald-600';
  if (s === 'NO') return 'bg-red-600';
  return 'bg-slate-500';
}

export function SatisfaccionDetalleGestion() {
  const { blocked } = useEncuestasPageGuard(SATISFACCION_SUBMENU_ID);
  const searchParams = useSearchParams();
  const ot = searchParams.get('ot') ?? '';
  const { showError } = useToast();
  const [data, setData] = useState<SatisfaccionDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (blocked || !ot) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await encuestasService.detalleSatisfaccion(ot);
        if (!cancelled) setData(d);
      } catch (e) {
        showError(e instanceof Error ? e.message : 'No se pudo cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blocked, ot, showError]);

  if (blocked) return null;

  const r = data?.respuestas;
  const o = data?.orden;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">Detalle encuesta</h1>
        <Link
          href="/dashboard/encuestas/satisfaccion"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver al listado
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : !o ? (
        <p className="text-muted-foreground">No se encontró la orden {ot}</p>
      ) : (
        <>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <h2 className="mb-3 text-center text-lg font-semibold">
              Respuestas de: {o.cliente}
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <strong>N° Orden:</strong> {o.numero}
              </div>
              <div>
                <strong>Bodega:</strong> {o.descripcion}
              </div>
              <div>
                <strong>Técnico:</strong> {o.tecnico}
              </div>
            </div>
          </div>

          {!r ? (
            <p className="text-muted-foreground">Sin respuestas registradas</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Card
                title="Satisfacción con el concesionario"
                value={r.pregunta1}
                className={colorNps(r.pregunta1)}
              />
              <Card
                title="Satisfacción con el trabajo realizado"
                value={r.pregunta2}
                className={colorNps(r.pregunta2)}
              />
              <Card
                title="Explicación todo el trabajo realizado"
                value={r.pregunta3}
                className={colorSn(r.pregunta3)}
              />
              <Card
                title="Se cumplieron los compromisos pactados"
                value={r.pregunta4}
                className={colorSn(r.pregunta4)}
              />
              <div className="md:col-span-2 lg:col-span-4">
                <Card
                  title="Para nosotros es importante conocer tu opinión"
                  value={r.pregunta5}
                  className="bg-sky-600"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  className,
}: {
  title: string;
  value: string | number | null | undefined;
  className: string;
}) {
  return (
    <div className={`rounded-lg text-white shadow ${className}`}>
      <div className="border-b border-white/20 px-3 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="px-3 py-6 text-center text-3xl font-bold">
        {value == null || value === '' ? '—' : String(value)}
      </div>
    </div>
  );
}
