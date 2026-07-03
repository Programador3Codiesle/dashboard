'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/atoms/Button';
import Modal from '@/components/shared/ui/Modal';
import { useMpviFirmaActions, useMpviValidarToken } from '@/modules/taller/mpvi/hooks/useMpviFirma';

type FirmaTab = 0 | 1 | 2;

function MpviFirmaInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? searchParams.get('llave') ?? '';

  const { tokenData, loading, error, pdfUrl } = useMpviValidarToken(token);
  const { firmar } = useMpviFirmaActions();

  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<FirmaTab>(0);
  const [firmaNombre, setFirmaNombre] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleGuardarFirma = () => {
    if (!token) return;

    const dataForm =
      tab === 0 && firmaNombre.trim()
        ? new URLSearchParams({ firma_nombre: firmaNombre.trim() }).toString()
        : undefined;

    let imgFirmaBase64: string | undefined;
    let imgFirmaFile: File | undefined;

    if (tab === 1 && canvasRef.current) {
      imgFirmaBase64 = canvasRef.current.toDataURL('image/png');
    } else if (tab === 2) {
      imgFirmaFile = fileRef.current?.files?.[0];
      if (!imgFirmaFile) return;
    }

    firmar.mutate(
      {
        opcion: tab,
        llave: token,
        dataForm,
        imgFirmaBase64,
        imgFirmaFile,
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            setModalOpen(false);
            window.location.reload();
          }
        },
      },
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-xl font-semibold text-slate-900">Enlace inválido</h1>
          <p className="mt-2 text-slate-600">No se encontró un token de firma válido en la URL.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="animate-spin text-amber-600" size={32} />
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-xl font-semibold text-red-700">Error</h1>
          <p className="mt-2 text-slate-600">{error ?? 'Token inválido o expirado.'}</p>
          <div className="mt-6">
            <Link href="/login" className="brand-btn inline-block px-4 py-2 rounded-lg text-white text-sm">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-600">
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="Cotización MPVI"
          className="w-full border-0"
          style={{ height: 'min(800px, 70vh)' }}
        />
      )}

      <div className="flex justify-center py-6 bg-slate-600">
        <Button className="brand-btn" onClick={() => setModalOpen(true)}>
          Adjuntar firma
        </Button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Elija el método de firma" width="520px">
        <div className="flex gap-2 mb-4 border-b pb-2">
          {([
            { id: 0 as FirmaTab, label: 'Firmar' },
            { id: 1 as FirmaTab, label: 'Dibujar' },
            { id: 2 as FirmaTab, label: 'Subir imagen' },
          ]).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tab === t.id ? 'brand-bg text-white' : 'bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Nombre para firma</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={firmaNombre}
              onChange={(e) => setFirmaNombre(e.target.value)}
            />
            <p
              className="text-4xl text-center py-4 border rounded-lg"
              style={{ fontFamily: "'Bonheur Royale', cursive" }}
            >
              {firmaNombre || 'Firma'}
            </p>
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Dibuje su firma</label>
            <canvas
              ref={canvasRef}
              width={436}
              height={70}
              className="w-full border border-gray-800 rounded-lg touch-none bg-white"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            <Button variant="secondary" onClick={clearCanvas}>
              Limpiar
            </Button>
          </div>
        )}

        {tab === 2 && (
          <div>
            <label className="block text-sm font-medium mb-1">Imagen de la firma</label>
            <input ref={fileRef} type="file" accept="image/*" className="w-full text-sm" />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button className="brand-btn" disabled={firmar.isPending} onClick={handleGuardarFirma}>
            {firmar.isPending ? 'Guardando...' : 'Guardar firma'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function MpviFirmaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <MpviFirmaInner />
    </Suspense>
  );
}
