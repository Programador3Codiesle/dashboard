'use client';

import React from 'react';
import { Button } from '@/components/shared/atoms/Button';

const LoginPage: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-10 bg-white rounded-xl shadow-2xl text-center">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Iniciar Sesión</h1>
      <p className="mb-6 text-gray-600">Por favor, ingresa tus credenciales.</p>
      <Button onClick={() => console.log('Simulando login...')}>Simular Login</Button>
    </div>
  </div>
);

export default LoginPage;
