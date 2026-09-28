import { labelSede } from '@/modules/administracion/constants';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

/** Compras.php: perfiles que cambian estado, factura, autorización y Excel. */
export const PERFILES_OPERAN_COMPRAS = [1, 20, 28] as const;

export function operaGestionCompras(perfil: number): boolean {
  return (PERFILES_OPERAN_COMPRAS as readonly number[]).includes(perfil);
}

/** Valores que guarda Compras.php insert_solicitud (combo_area). */
export const AREAS_GESTION_COMPRAS = [
  { value: 'administracion', label: 'Administración' },
  { value: 'contaccenter', label: 'Contac Center' },
  { value: 'vhnuevos', label: 'Vehículos Nuevos' },
  { value: 'vhusados', label: 'Vehículos Usados' },
  { value: 'alistamiento', label: 'Alistamiento' },
  { value: 'mecanica_gasolina', label: 'Mecánica Gasolina' },
  { value: 'mecanica_diesel', label: 'Mecánica Diesel' },
  { value: 'lyp', label: 'Lámina y Pintura' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'repuestos', label: 'Repuestos' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'Negocios', label: 'Negocios' },
] as const;

const SEDES_CODIESEL = [
  { value: 'giron', label: 'Girón' },
  { value: 'rosita', label: 'Rosita' },
  { value: 'chevropartes', label: 'Chevropartes' },
  { value: 'solochevrolet', label: 'Dieselco Cúcuta' },
  { value: 'barranca', label: 'Barrancabermeja' },
  { value: 'malecon', label: 'Malecon' },
  { value: 'Bocono', label: 'Boconó' },
  { value: 'Dieselco', label: 'Dieselco' },
] as const;

export function labelAreaCompra(value: string): string {
  const area = AREAS_GESTION_COMPRAS.find((item) => item.value === value);
  return area?.label ?? value;
}

export function labelSedeCompra(value: string): string {
  const sede = SEDES_CODIESEL.find((item) => item.value === value);
  if (sede) return sede.label;
  return labelSede(value);
}

/** Codiesel usa los códigos del PHP. Las otras empresas conservan su lista. */
export function opcionesSedeCompra(
  empresaId: number,
  sedesEmpresa: string[],
): Array<{ value: string; label: string }> {
  if (empresaId === CODIESEL_EMPRESA_ID) {
    return SEDES_CODIESEL.map((sede) => ({
      value: sede.value,
      label: sede.label,
    }));
  }
  return sedesEmpresa.map((sede) => ({ value: sede, label: labelSede(sede) }));
}

export function etiquetaAutorizacion(estado: number, puedeOperar: boolean): string {
  if (estado === 1) return puedeOperar ? 'Enviar Autorización' : 'Sin Autorizar';
  if (estado === 2) return 'Autorización En Proceso';
  if (estado === 3) return 'Autorización Aprobada';
  if (estado === 4) return 'Autorización Negada';
  return 'Sin Autorizar';
}

/** Staff: enviar en 1 y 4; ver cotización en 3. En proceso queda bloqueado. */
export function puedePulsarAutorizacion(
  estado: number,
  puedeOperar: boolean,
): boolean {
  if (!puedeOperar || estado === 2) return false;
  return estado === 1 || estado === 3 || estado === 4;
}

export function puedeCambiarEstadoCompra(
  estado: number,
  puedeOperar: boolean,
): boolean {
  return puedeOperar && estado !== 4 && estado !== 5;
}

export function puedeMarcarFactura(
  estado: number,
  conFactura: boolean,
  puedeOperar: boolean,
): boolean {
  if (!puedeOperar || conFactura) return false;
  return estado === 3 || estado === 4;
}
