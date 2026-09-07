/** Carga xlsx solo al exportar, fuera del bundle inicial de la página. */
export async function getXlsx() {
  return import('xlsx');
}
