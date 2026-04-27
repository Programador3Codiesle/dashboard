// Utilidades para manejar cookies (equivalente a sesiones PHP)

export function setCookie(name: string, value: string, days?: number) {
  const expires = typeof days === 'number'
    ? `;expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}`
    : '';

  document.cookie = `${name}=${value}${expires};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getUser(): any | null {
  const userStr = getCookie('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: any, remember: boolean = true) {
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

