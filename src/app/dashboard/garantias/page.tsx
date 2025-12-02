'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/shared/atoms/Button';

const GarantiasPage: React.FC = () => (
  <div className="bg-white p-10 rounded-xl shadow-lg text-center">
    <ShieldCheck size={48} className="mx-auto text-green-400 mb-4" />
    <h2 className="text-2xl font-bold text-gray-800">Módulo de Garantías</h2>
    <p className="text-gray-600 mt-2">
      Aquí se integrará la lógica y componentes de `/modules/garantias`.
    </p>
    <Button variant="secondary" className="mt-6">Administrar Garantías</Button>
  </div>
);

export default GarantiasPage;
