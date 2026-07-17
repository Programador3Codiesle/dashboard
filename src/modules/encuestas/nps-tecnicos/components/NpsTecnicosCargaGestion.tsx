'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Upload } from 'lucide-react';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { NPS_TECNICOS_INGRESO_SUBMENU_ID } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';
import { fetchWithAuth } from '@/utils/api';

export function NpsTecnicosCargaGestion() {
  const { blocked } = useEncuestasPageGuard(NPS_TECNICOS_INGRESO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (blocked) return null;

  async function descargarPlantilla() {
    try {
      const resp = await fetchWithAuth(encuestasService.plantillaUrl());
      if (!resp.ok) throw new Error('No se pudo descargar la plantilla');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formato_nps.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error descarga');
    }
  }

  async function cargar() {
    if (!file) {
      showError('Seleccione un archivo');
      return;
    }
    setLoading(true);
    try {
      const r = await encuestasService.uploadNpsTecnicos(file);
      showSuccess(
        `Se insertaron ${r.insertados} registros. Omitidos/fallidos: ${r.omitidos}.`,
      );
      setFile(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title-xl brand-text">Ingreso NPS Técnicos</h1>
          <p className="text-sm text-muted-foreground">
            Carga masiva desde archivo Excel GM
          </p>
        </div>
        <Link href="/dashboard/encuestas" className="text-sm text-amber-700 hover:underline">
          ← Volver a Encuestas
        </Link>
      </div>

      <div className="max-w-xl space-y-4 rounded-lg border bg-card p-6">
        <label className="block text-sm font-medium">
          Archivo Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            className="mt-2 block w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file && (
          <p className="text-xs text-muted-foreground">Seleccionado: {file.name}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={cargar}
            className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {loading ? 'Cargando...' : 'Cargar'}
          </button>
          <button
            type="button"
            onClick={descargarPlantilla}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Descargar plantilla
          </button>
        </div>
      </div>
    </div>
  );
}
