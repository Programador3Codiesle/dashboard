export function formatNombre(nombreCompleto: string): string {
  if (!nombreCompleto) return '';

  const palabras = nombreCompleto.trim().split(/\s+/).filter((p) => p.length > 0);
  if (palabras.length === 0) return nombreCompleto;

  const palabrasCapitalizadas = palabras.map(
    (palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase(),
  );

  if (palabrasCapitalizadas.length <= 2) {
    return palabrasCapitalizadas.join(' ');
  }

  if (palabrasCapitalizadas.length === 3) {
    const [apellido1, apellido2, nombre] = palabrasCapitalizadas;
    return `${nombre} ${apellido1} ${apellido2}`;
  }

  const mitad = Math.floor(palabrasCapitalizadas.length / 2);
  const apellidos = palabrasCapitalizadas.slice(0, mitad);
  const nombres = palabrasCapitalizadas.slice(mitad);

  return [...nombres, ...apellidos].join(' ');
}

export function nombreCompacto(nombreFormateado: string): string {
  const w = nombreFormateado.trim().split(/\s+/).filter(Boolean);
  if (w.length <= 2) return nombreFormateado.trim();
  if (w.length === 3) return `${w[0]} ${w[1]}`;
  return `${w[0]} ${w[2]}`;
}
