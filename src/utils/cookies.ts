// Utilidades para manejar cookies (equivalente a sesiones PHP)

import type { IUser } from '@/types/global';
import { toPermissionIdList } from '@/utils/permission-ids';

function isHttps(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setCookie(name: string, value: string, days?: number) {
  const expires =
    typeof days === 'number'
      ? `;expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}`
      : '';
  const secure = isHttps() ? ';Secure' : '';
  const encoded = encodeURIComponent(value);

  document.cookie = `${name}=${encoded}${expires};path=/;SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const raw = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

export function removeCookie(name: string) {
  const secure = isHttps() ? ';Secure' : '';
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${secure}`;
}

export function getUser(): IUser | null {
  const userStr = getCookie('user');
  if (!userStr) return null;
  try {
    const parsed: unknown = JSON.parse(userStr);
    if (!parsed || typeof parsed !== 'object') return null;
    const user = parsed as IUser;
    return {
      ...user,
      empresas_asignadas: Array.isArray(user.empresas_asignadas)
        ? toPermissionIdList(user.empresas_asignadas)
        : user.empresas_asignadas,
      menus_permitidos: Array.isArray(user.menus_permitidos)
        ? toPermissionIdList(user.menus_permitidos)
        : user.menus_permitidos,
      submenus_permitidos: Array.isArray(user.submenus_permitidos)
        ? toPermissionIdList(user.submenus_permitidos)
        : user.submenus_permitidos,
      trimenus_permitidos: Array.isArray(user.trimenus_permitidos)
        ? toPermissionIdList(user.trimenus_permitidos)
        : user.trimenus_permitidos,
    };
  } catch {
    return null;
  }
}

export function setUser(user: IUser, remember: boolean = true) {
  if (remember) {
    setCookie('user', JSON.stringify(user), 7); // 7 días
    setCookie('remember_session', '1', 7);
    return;
  }

  // Cookie de sesión: se elimina al cerrar el navegador.
  setCookie('user', JSON.stringify(user));
  setCookie('remember_session', '0');
}

export function removeUser() {
  removeCookie('user');
  removeCookie('remember_session');
}

export function getRememberSession(): boolean {
  return getCookie('remember_session') === '1';
}
