import { EMPRESAS, empresaIconSrc } from "@/utils/constants";

const FAVICON_LINK_ID = "empresa-favicon";

/** Icono de pestaña: empresa activa, o Codiesel si aún no hay sesión. */
export function empresaFaviconHref(empresaId?: number | null): string {
  return empresaIconSrc(empresaId) ?? empresaIconSrc(1) ?? "/iconos/icono-empresa-1.png";
}

/**
 * Next inyecta `app/icon.png` (Codiesel). Hay que quitar esos `<link>` y poner
 * el de la empresa; si no, Chrome se queda con el de Next.
 */
export function applyEmpresaFavicon(empresaId?: number | null): void {
  if (typeof document === "undefined") return;

  const href = empresaFaviconHref(empresaId);

  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
    .forEach((node) => node.remove());

  const link = document.createElement("link");
  link.id = FAVICON_LINK_ID;
  link.rel = "icon";
  link.type = "image/png";
  link.href = href;
  document.head.appendChild(link);
}

/** Corre en `<head>` para aplicar el favicon de la cookie `user` antes de React. */
export function getEmpresaFaviconBootstrapScript(): string {
  const iconsById: Record<string, string> = {};
  for (const empresa of EMPRESAS) {
    const src = empresaIconSrc(empresa.id);
    if (src) iconsById[String(empresa.id)] = src;
  }

  return `(function(){try{var I=${JSON.stringify(iconsById)};var F=${JSON.stringify(empresaFaviconHref(1))};var m=document.cookie.match(/(?:^|; )user=([^;]*)/);var id="";if(m){var u=JSON.parse(decodeURIComponent(m[1]));if(u&&u.empresa!=null)id=String(u.empresa);}var href=I[id]||F;document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"]').forEach(function(n){n.remove();});var l=document.createElement("link");l.id=${JSON.stringify(FAVICON_LINK_ID)};l.rel="icon";l.type="image/png";l.href=href;document.head.appendChild(l);}catch(e){}})();`;
}
