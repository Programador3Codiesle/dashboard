const LEGACY_BASE =
  process.env.NEXT_PUBLIC_LEGACY_POSTVENTA_URL?.replace(/\/$/, "") ??
  "https://intranet.codiesel.co/postventa";

export function openLegacySacyrEditor(idCotizacion: number): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${LEGACY_BASE}/Sacyr/EditarCotizacion`;
  form.target = "EditarCotizacion";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "id_cotizacion";
  input.value = String(idCotizacion);
  form.appendChild(input);

  document.body.appendChild(form);
  window.open("", "EditarCotizacion", "scrollbars=1,resizable=1");
  form.submit();
  document.body.removeChild(form);
}
