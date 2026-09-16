/** PHP informe_taller/footer.php: 3 letras + 3 números (placaVeh). */

const LETRAS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMEROS = '1234567890';

export function filtrarPlacaAbc123(raw: string): string {
  let out = '';
  for (let i = 0; i < raw.length && out.length < 6; i += 1) {
    const ch = raw.charAt(i);
    if (out.length < 3) {
      if (LETRAS.includes(ch)) out += ch.toUpperCase();
    } else if (NUMEROS.includes(ch)) {
      out += ch;
    }
  }
  return out;
}

export function esPlacaAbc123(placa: string): boolean {
  return /^[A-Z]{3}[0-9]{3}$/.test(placa.trim().toUpperCase());
}
