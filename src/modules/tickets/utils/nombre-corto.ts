export function getNombreCorto(nombreCompleto: string): string {
  if (!nombreCompleto) return "";
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length === 0) return nombreCompleto;
  if (partes.length === 1) return partes[0];

  // Si tiene 2 o más partes, asumimos formato: APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2
  // Extraemos: PRIMER APELLIDO + PRIMER NOMBRE (desde el final)
  const primerApellido = partes[0];
  const primerNombre = partes[partes.length - 2] || partes[partes.length - 1];

  if (partes.length === 2) {
    return `${partes[0]} ${partes[1]}`;
  }

  return `${primerNombre} ${primerApellido}`;
}
