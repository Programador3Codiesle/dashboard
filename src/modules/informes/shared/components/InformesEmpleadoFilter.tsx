"use client";

import { EmpleadoSearchCombobox } from "@/modules/informes/shared/components/EmpleadoSearchCombobox";
import { useEmpleadosInformesCombo } from "@/modules/informes/shared/hooks/useEmpleadosInformesCombo";

type InformesEmpleadoFilterProps = {
  id: string;
  value: string;
  onChange: (nit: string) => void;
};

export function InformesEmpleadoFilter({
  id,
  value,
  onChange,
}: InformesEmpleadoFilterProps) {
  const { data: empleados = [], isPending: cargando } =
    useEmpleadosInformesCombo();

  return (
    <div className="flex flex-col min-w-0">
      <label
        htmlFor={id}
        className="text-xs font-medium text-gray-600 mb-1"
      >
        Empleado
      </label>
      <EmpleadoSearchCombobox
        id={id}
        empleados={empleados}
        value={value}
        onChange={onChange}
        cargando={cargando}
        placeholder="Opcional: buscar por nombre"
      />
    </div>
  );
}
