'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { SelectorEmpresaModal } from './SelectorEmpresaModal';

export const LoginForm = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const { login, updateUser } = useAuth();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await login({ user, password });
      setShowEmpresaModal(true);
    } catch (error: any) {
      console.error('Error en login:', error);
      setErrorMsg(error?.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmpresaSelect = (empresaId: number) => {
    updateUser({ empresa: empresaId });
    setShowEmpresaModal(false);
    router.push('/dashboard');
  };


  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Header del Login */}
      <div className="text-center mb-2">

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 brand-bg-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <span className="text-white font-bold text-2xl">C</span>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Bienvenido
        </h1>
        <p className="text-gray-600">Ingresa a tu cuenta de Codiesel</p>

        {/* Mensaje de error */}
        {errorMsg && (
          <div className="mb-1 mt-1 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

      </div>

      {/* Formulario */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-8 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Campo Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-gray-400" />
            </div>
            <input
              id="user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 outline-none"
              placeholder="Usuario"
              required
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 outline-none"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={20} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Recordar contraseña */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
            />
            <span className="ml-2 text-sm text-gray-600">Recordar sesión</span>
          </label>
          <button
            type="button"
            className="text-sm brand-text brand-text-hover font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Botón de Login */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full brand-bg-gradient text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              <span>Iniciar Sesión</span>
            </>
          )}
        </motion.button>

      </motion.form>

      <SelectorEmpresaModal
        open={showEmpresaModal}
        onClose={() => setShowEmpresaModal(false)}
        onSelect={handleEmpresaSelect}
      />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-6"
      >
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button className="brand-text brand-text-hover font-medium">
            Solicitar acceso
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
};