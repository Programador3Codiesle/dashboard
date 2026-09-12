'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/core/auth/services/auth.service';
import { validarNuevaPassword } from './password-policy';

type Props = {
  userId: string;
  changeToken: string;
  nit?: number;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

export function ActualizarPasswordPanel({
  userId,
  changeToken,
  nit,
  onSuccess,
  onCancel,
}: Props) {
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const local = validarNuevaPassword(pass1, pass2, nit);
    if (local) {
      setError(local);
      return;
    }
    setLoading(true);
    try {
      const message = await authService.actualizarPasswordForzado({
        userId,
        changeToken,
        pass1,
        pass2,
      });
      onSuccess(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Problemas con los datos enviados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-8 space-y-6">
      <p className="text-sm text-gray-600">
        Si te encuentras en esta parte, es debido a una de las siguientes tres
        causas: tu contraseña coincide con tu número de identidad, tu
        contraseña no se ajusta a las recomendaciones propuestas o tu
        contraseña ha permanecido sin ser actualizada durante más de 60 días.
      </p>
      <h2 className="text-xl font-semibold text-gray-900 text-center">
        Actualizar Contraseña
      </h2>
      {error && (
        <div role="alert" className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="passwordOne" className="text-sm font-medium text-gray-700">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              id="passwordOne"
              type={show1 ? 'text' : 'password'}
              value={pass1}
              onChange={(e) => setPass1(e.target.value)}
              className="w-full pr-12 py-3 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShow1((v) => !v)}
            >
              {show1 ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="passwordTwo" className="text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              id="passwordTwo"
              type={show2 ? 'text' : 'password'}
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              className="w-full pr-12 py-3 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShow2((v) => !v)}
            >
              {show2 ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full brand-bg-gradient text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-sm text-gray-600 hover:text-gray-800"
        >
          Volver al inicio de sesión
        </button>
      </form>
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-semibold">Recomendaciones de seguridad:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>La contraseña debe tener al menos 8 caracteres.</li>
          <li>Incluir letras mayúsculas y minúsculas.</li>
          <li>Agregar al menos un número y un símbolo especial (ej: !, @, #, $).</li>
          <li>No usar datos personales fáciles de adivinar (ej: cédula).</li>
        </ul>
      </div>
    </div>
  );
}
