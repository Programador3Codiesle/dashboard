'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado izquierdo - Branding */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Codiesel Postventa
                  </h1>
                  <p className="text-sm text-gray-600">Sistema Interno de Gestión</p>
                </div>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Optimiza tus procesos <br />
                en  
                <span className="ml-3 bg-gradient-to-br from-amber-500 to-amber-600 bg-clip-text text-transparent">
                POSTVENTA 
                </span>
              </h2>

              <p className="text-xl text-gray-600 max-w-lg">
                Accede a las herramientas diseñadas para asesoría de servicio, garantías,
                citas, CRM técnico y gestión operativa del área postventa de Chevrolet.
              </p>

              {/* Estadísticas */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">+80</div>
                  <div className="text-sm text-gray-600">Colaboradores Postventa</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">12.000+</div>
                  <div className="text-sm text-gray-600">Servicios al mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">100%</div>
                  <div className="text-sm text-gray-600">Soporte interno</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="flex justify-center lg:justify-end">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}