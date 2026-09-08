/** Cookie/JSON a veces serializa IDs como string; los Set de permisos deben comparar número. */
export function toPermissionIdSet(
  ids: Array<number | string> | undefined | null,
): Set<number> {
  if (!Array.isArray(ids)) return new Set();
  const set = new Set<number>();
  for (const id of ids) {
    const n = Number(id);
    if (Number.isFinite(n)) set.add(n);
  }
  return set;
}

export function toPermissionIdList(
  ids: Array<number | string> | undefined | null,
): number[] {
  return Array.from(toPermissionIdSet(ids));
}

/**
 * true si hay lista de permisos y el id no está.
 * Si no hay lista (sesión vieja / sin campo), no bloquea.
 */
export function isMissingListedPermission(
  ids: Array<number | string> | undefined | null,
  requiredId: number,
): boolean {
  if (!Array.isArray(ids)) return false;
  return !toPermissionIdSet(ids).has(requiredId);
}
