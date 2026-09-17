'use client';
import Modal from "@/components/shared/ui/Modal";
import { useMemo, useState } from "react";
import { AsignarJefeModalProps } from "@/modules/usuarios/types";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { EmpleadoSearchCombobox } from "@/modules/informes/shared/components/EmpleadoSearchCombobox";

export default function AsignarJefeModal(props: AsignarJefeModalProps) {
  if (!props.open || !props.usuario) return null;
  return <AsignarJefeModalBody key={props.usuario.id} {...props} />;
}

function AsignarJefeModalBody({
  open,
  usuario,
  onClose,
  onAsignar,
  onEliminar,
  jefesDisponibles,
  jefesUsuario,
}: AsignarJefeModalProps) {
  const [selectedJefe, setSelectedJefe] = useState("");
  const [jefeAEliminar, setJefeAEliminar] = useState<string | null>(null);

  const jefesDisponiblesParaAsignar = useMemo(() => {
    const idsAsignados = new Set(jefesUsuario.map((j) => String(j.id)));
    return [...jefesDisponibles]
      .filter((jefe) => !idsAsignados.has(String(jefe.id)))
      .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
  }, [jefesDisponibles, jefesUsuario]);

  const opcionesCombo = useMemo(
    () =>
      jefesDisponiblesParaAsignar.map((jefe) => ({
        nit: String(jefe.id),
        nombres: jefe.nombre,
      })),
    [jefesDisponiblesParaAsignar],
  );

  const handleAsignar = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJefe) {
      onAsignar(selectedJefe);
      setSelectedJefe("");
    }
  };

  const closeButtonClass =
    "w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors";

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Gestionar Jefes - ${usuario?.nombre}`}
        width="600px"
        overflowClassName="overflow-visible"
      >
        <div>
          {jefesUsuario.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-gray-800">
                Jefes asignados:
              </h3>
              <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                {jefesUsuario.map((jefe) => (
                  <div
                    key={jefe.id}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0 break-words text-sm font-medium">
                      {jefe.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => setJefeAEliminar(jefe.id.toString())}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full bg-[var(--color-danger-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:opacity-90 transition-opacity"
                    >
                      <Trash2 size={14} />
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jefesDisponiblesParaAsignar.length > 0 ? (
            <form onSubmit={handleAsignar} className="space-y-4">
              <label
                htmlFor="asignar-jefe-combo"
                className="mb-1.5 block text-sm text-gray-500"
              >
                Selecciona un jefe para asignar:
              </label>
              <EmpleadoSearchCombobox
                id="asignar-jefe-combo"
                name="jefe"
                empleados={opcionesCombo}
                value={selectedJefe}
                onChange={setSelectedJefe}
                required
                emptyOptionLabel={null}
                placeholder="Buscar por nombre..."
              />

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className={closeButtonClass}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={!selectedJefe}
                  className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium text-white brand-bg brand-bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            </form>
          ) : (
            <>
              {jefesUsuario.length === 0 && (
                <div className="mb-4 p-5 text-center text-sm text-gray-500">
                  <p>No hay jefes disponibles para asignar.</p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className={closeButtonClass}
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={!!jefeAEliminar}
        onConfirm={() => {
          if (jefeAEliminar) onEliminar(jefeAEliminar);
          setJefeAEliminar(null);
        }}
        onCancel={() => setJefeAEliminar(null)}
        title="Eliminar jefe"
        message="¿Estás seguro de que deseas eliminar este jefe del usuario?"
        variant="danger"
      />
    </>
  );
}
