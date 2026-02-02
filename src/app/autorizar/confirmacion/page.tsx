'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AutorizarConfirmacionPage() {
  const searchParams = useSearchParams();
  const resultado = searchParams.get('resultado');
  const accion = searchParams.get('accion');
  const mensaje = searchParams.get('mensaje');

  const isOk = resultado === 'ok';
  const textoMensaje = isOk
    ? accion === 'rechazar'
      ? 'Ha rechazado la solicitud correctamente.'
      : 'Ha autorizado la solicitud correctamente.'
    : mensaje ? decodeURIComponent(mensaje) : 'Enlace inválido o expirado.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${isOk ? 'bg-green-100' : 'bg-red-100'}`}
        >
          {isOk ? (
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
          {isOk ? 'Respuesta registrada' : 'Error'}
        </h1>
        <p className="mt-2 text-center text-slate-600">{textoMensaje}</p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
