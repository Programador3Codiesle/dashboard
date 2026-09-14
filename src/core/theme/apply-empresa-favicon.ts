import { empresaIconSrc } from "@/utils/constants";

export const EMPRESA_FAVICON_LINK_ID = "empresa-favicon";

/** Icono de pestaña: empresa activa, o Codiesel si aún no hay sesión. */
export function empresaFaviconHref(empresaId?: number | null): string {
  return empresaIconSrc(empresaId) ?? empresaIconSrc(1) ?? "/iconos/icono-empresa-1.png";
}

/**
 * Solo actualiza el href del `<link id="empresa-favicon">`.
 * No borrar ni recrear nodos en `<head>`: Next App Router trata eso como
 * recarga completa y el primer clic se pierde (parece doble clic).
 */
export function applyEmpresaFavicon(empresaId?: number | null): void {
  if (typeof document === "undefined") return;

  const href = empresaFaviconHref(empresaId);
  const link = document.getElementById(EMPRESA_FAVICON_LINK_ID);

  if (!(link instanceof HTMLLinkElement)) return;
  if (link.getAttribute("href") === href) return;

  link.setAttribute("href", href);
}
