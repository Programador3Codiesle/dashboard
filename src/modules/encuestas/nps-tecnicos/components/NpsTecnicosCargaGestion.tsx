'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchWithAuth } from '@/utils/api';
import { EncuestasPageFrame } from '@/modules/encuestas/components/EncuestasPageFrame';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import {
  btnPrimaryClass,
  btnSecondaryClass,
} from '@/modules/encuestas/shared/constants/ui';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';
import { NPS_TECNICOS_INGRESO_SUBMENU_ID } from '@/utils/constants';

export function NpsTecnicosCargaGestion() {
  const { blocked } = useEncuestasPageGuard(NPS_TECNICOS_INGRESO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (f: File) => encuestasService.uploadNpsTecnicos(f),
    onSuccess: (r) => {
      showSuccess(
        `Se insertaron ${r.insertados} registros. Omitidos/fallidos: ${r.omitidos}.`,
      );
      setFile(null);
    },
    onError: (e) => {
      showError(getErrorMessage(e, ENCUESTAS_COPY.npsTecnicos.uploadError));
    },
  });

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
      showError(getErrorMessage(e, 'Error descarga'));
    }
  }

  function cargar() {
    if (!file) {
      showError('Seleccione un archivo');
      return;
    }
    uploadMutation.mutate(file);
  }

  return (
    <EncuestasPageFrame
      title={ENCUESTAS_COPY.npsTecnicos.title}
      description={ENCUESTAS_COPY.npsTecnicos.description}
      backHref="/dashboard/encuestas"
      backLabel={ENCUESTAS_COPY.npsTecnicos.backLabel}
    >
      <div className="max-w-xl space-y-4 rounded-lg border bg-card p-6">
        <label htmlFor="nps-tecnicos-file" className="block text-sm font-medium">
          Archivo Excel
          <input
            id="nps-tecnicos-file"
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
            disabled={uploadMutation.isPending}
            onClick={cargar}
            className={btnPrimaryClass}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? 'Cargando...' : 'Cargar'}
          </button>
          <button
            type="button"
            onClick={descargarPlantilla}
            className={btnSecondaryClass}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </button>
        </div>
      </div>
    </EncuestasPageFrame>
  );
}
