'use client';

import { useState, useEffect, useRef } from "react";
import Modal from "@/components/shared/ui/Modal";
import { gestionComprasService, MensajeCompra } from "@/modules/administracion/services/gestion-compras.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { Loader2, Send } from "lucide-react";

interface MensajesCompraModalProps {
  open: boolean;
  onClose: () => void;
  solicitudId: number;
}

export default function MensajesCompraModal({
  open,
  onClose,
  solicitudId,
}: MensajesCompraModalProps) {
  const [mensajes, setMensajes] = useState<MensajeCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);
  const { showSuccess, showError } = useToast();

  const cargarMensajes = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const data = await gestionComprasService.listarMensajes(solicitudId);
      setMensajes(data);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
      showError("Error al cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      cargarMensajes();
    }
  }, [open, solicitudId]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const mensaje = mensajeRef.current?.value.trim();
    if (!mensaje) {
      showError("Por favor ingrese un mensaje");
      return;
    }

    setEnviando(true);
    try {
      const result = await gestionComprasService.crearMensaje(solicitudId, mensaje);
      if (result.status) {
        showSuccess(result.message);
        if (mensajeRef.current) {
          mensajeRef.current.value = "";
        }
        await cargarMensajes();
      } else {
        showError(result.message || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      showError("Error al enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mensajes">
      <div className="space-y-4">
        <form onSubmit={handleEnviar} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escribir mensaje
            </label>
            <textarea
              ref={mensajeRef}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none resize-none"
              placeholder="Escribe tu mensaje aquí..."
              disabled={enviando}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white brand-btn rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>

        <hr className="border-gray-200" />

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : mensajes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay mensajes aún</p>
          ) : (
            mensajes.map((msg) => (
              <div key={msg.id_mensaje} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{msg.nombres}</span>
                  <span className="text-xs text-gray-500">
                    {msg.fecha}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{msg.mensaje}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
