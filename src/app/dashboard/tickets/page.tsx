'use client';

import React from 'react';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/shared/atoms/Button';

const TicketsPage: React.FC = () => (
  <div className="bg-white p-10 rounded-xl shadow-lg text-center">
    <Ticket size={48} className="mx-auto text-indigo-400 mb-4" />
    <h2 className="text-2xl font-bold text-gray-800">Módulo de tickets</h2>
    <p className="text-gray-600 mt-2">
      Aquí se integrará la lógica y componentes de `/modules/tickets`.
    </p>
    <Button variant="secondary" className="mt-6">Ver tickets</Button>
  </div>
);

export default TicketsPage;
