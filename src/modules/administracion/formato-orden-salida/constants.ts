/** PHP `FormatosDigitales::ordenSalida` NIT `63369607`. */
export const AZUCENA_NIT = 63369607;

/**
 * PHP `ordenSalida()` `$jefes` — acceso al formato (además del submenu 154).
 */
export const FORMATO_OS_ACCESS_NITS = new Set<number>([
  91274670, 1005157209, 80872884, 1090449765, 1092358562, 91259929, 1095913265,
  1092355065, 1090484563, 13741590, 63368988, 91525308, 1098739531, 1095809978,
  91488149, 1007421380, 1093736472, 1095816177, 1091655270, 1098732475,
  1098625558, 1099367783, 1128465895, 28070692, 1090497067, 37579713,
  1094241876, 79145617, 1092338001, 1098679322, 63289710, 63369607, 91298113,
]);

/**
 * PHP vista `ordenSalida.php` — combo de Azucena (value = NIT).
 */
export const JEFES_COMBO_AZUCENA: { nit: number; nombre: string }[] = [
  { nit: 91274670, nombre: 'Carlos Enrique Lozano Galvis' },
  { nit: 1005157209, nombre: 'Johan Sebastian Garcia Plata' },
  { nit: 80872884, nombre: 'Juan Pablo Mier Avila' },
  { nit: 84109954, nombre: 'Luis Emilio Puche Aguirre' },
  { nit: 1065913432, nombre: 'Manuelita Baleta Mauris' },
  { nit: 1090449765, nombre: 'Karol Julieth Gomez Orozco' },
  { nit: 1092358562, nombre: 'Zulay Villalba Toloza' },
  { nit: 1094532250, nombre: 'Oscar Emilio Romero Urbina' },
  { nit: 91259929, nombre: 'Edgar Mauricio Galvis Tavera' },
  { nit: 1095913265, nombre: 'Cesar Augusto Caicedo Caycedo' },
  { nit: 1092355065, nombre: 'David Davila' },
  { nit: 1090484563, nombre: 'Karen Michelle Barbosa Carvajal' },
  { nit: 13741590, nombre: 'Juan Alexander Calderon Blanco' },
  { nit: 63368988, nombre: 'Liliana Cristancho Ferreira' },
  { nit: 91525308, nombre: 'Elkin Alexander Velasquez Albarracin' },
  { nit: 1014178302, nombre: 'Nelson Jose Diaz Rodriguez' },
  { nit: 1098739531, nombre: 'Andrea Patricia Parra Ayala' },
  { nit: 1095809978, nombre: 'Joseph Dayron Muñoz Gomez' },
  { nit: 91297508, nombre: 'Wilson Fiallo Santander' },
  { nit: 91510897, nombre: 'Cesar Augusto Dominguez Mosquera' },
  { nit: 1093736472, nombre: 'Deysi Lorena Leon Montañez' },
  { nit: 1095816177, nombre: 'Gomez Uribe Daniela' },
  { nit: 79984087, nombre: 'Oscar Mauricio Tapias Pinto' },
  { nit: 1091655270, nombre: 'Eneida Perez Rojas' },
  { nit: 1098625558, nombre: 'Zuly Nathalia Ramirez Burgos' },
  { nit: 1099367783, nombre: 'Erika Lizeth Aguilar Herrera' },
  { nit: 1128465895, nombre: 'Jaime Andres Martinez Barrios' },
  { nit: 1099372035, nombre: 'Darly Lizeth Cadena Regueros' },
  { nit: 1004967243, nombre: 'Garzon Castro Ingrid Lucero' },
  { nit: 28070692, nombre: 'Diana Lizette Hernandez Tovar' },
  { nit: 1093791359, nombre: 'Quintero Romero Estefany Yajaira' },
  { nit: 1090497067, nombre: 'Forero Carrero Heidy Esmeralda' },
  { nit: 37579713, nombre: 'Rueda Romero Irene Isabel' },
  { nit: 1094241876, nombre: 'Burgos Ramirez Gabriel Felipe' },
  { nit: 79145617, nombre: 'Jorge Humberto Franco Rugeles' },
  { nit: 1092338001, nombre: 'Andrea Paola Ramirez Ramirez' },
  { nit: 1098679322, nombre: 'Daniel Felipe Gonzalez Rueda' },
  { nit: 63289710, nombre: 'Yolanda Quintero Ortiz' },
  { nit: 63369607, nombre: 'Azucena Franco Gomez' },
  { nit: 91298113, nombre: 'Orlando Duran Serrano' },
];

/** PHP: value sin tilde en Vehículos; label con tilde. */
export const AREAS_FORMATO_ORDEN_SALIDA: { value: string; label: string }[] = [
  { value: 'Administración', label: 'Administración' },
  { value: 'Central de Beneficios', label: 'Central de Beneficios' },
  { value: 'Vehiculos Nuevos', label: 'Vehículos Nuevos' },
  { value: 'Vehiculos Usados', label: 'Vehículos Usados' },
  { value: 'Repuestos', label: 'Repuestos' },
  { value: 'Taller Gasolina', label: 'Taller Gasolina' },
  { value: 'Taller Diesel', label: 'Taller Diesel' },
  { value: 'Lamina y Pintura', label: 'Lamina y Pintura' },
  { value: 'Alistamiento', label: 'Alistamiento' },
  { value: 'Contact Center', label: 'Contact Center' },
  { value: 'Accesorios', label: 'Accesorios' },
];

export function comboJefesFormatoOrdenSalida(
  nitUsuario: number,
  nombreUsuario: string,
): { nit: number; nombre: string }[] {
  if (nitUsuario === AZUCENA_NIT) {
    return JEFES_COMBO_AZUCENA;
  }
  return [{ nit: nitUsuario, nombre: nombreUsuario }];
}
