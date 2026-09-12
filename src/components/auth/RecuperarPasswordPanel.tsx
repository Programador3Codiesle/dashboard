'use client';

import { useState } from 'react';
import { authService } from '@/core/auth/services/auth.service';

type Props = {
  onBack: () => void;
};

export function RecuperarPasswordPanel({ onBack }: Props) {
  const [nit, setNit] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mail, setMail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = nit.trim();
    if (!trimmed) {
      setError('No puedes dejar campos vacios');
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n <= 0) {
      setError('El campo usuario debe ser un numero');
      return;
    }
    setLoading(true);
    try {
      const result = await authService.solicitarCodigoRecuperacion(n);
      setMail(result.mail);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'La cedula es incorrecta o no tienes correo corporativo',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!codigo.trim()) {
      setError('No puedes dejar campos vacios');
      return;
    }
    setLoading(true);
    try {
      await authService.validarCodigoRecuperacion(Number(nit), codigo.trim());
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El codigo es incorrecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center">
        Reestablecer contraseña Intranet POS-VENTA
      </h2>
      {error && (
        <div role="alert" className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleEnviar} className="space-y-4">
          <p className="text-sm text-gray-600">
            1- Por favor ingresa tu numero de identificacion o cedula
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="Número de Cedula"
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full brand-bg-gradient text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleValidar} className="space-y-4">
          <p className="text-sm text-gray-600">
            2- Un código fue enviado a tu correo electronico corporativo.
          </p>
          <input
            id="inputMail"
            type="text"
            readOnly
            value={mail}
            className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-sm"
          />
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Código"
            maxLength={10}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full brand-bg-gradient text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Validando…' : 'Validar código'}
          </button>
        </form>
      )}

      {step === 3 && (
        <p className="text-sm text-gray-700">
          3- Por favor ingresa con tu número de cedula en los campos de usuario
          y contraseña
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-600 hover:text-gray-800"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
}
