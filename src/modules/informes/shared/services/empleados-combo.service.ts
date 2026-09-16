import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

export type EmpleadoInformeCombo = { nit: string; nombres: string };

/** Catálogo PHP Usuarios::getUserAlls (nit + nombres), compartido entre informes GH. */
export async function listarEmpleadosInformesCombo(): Promise<
  EmpleadoInformeCombo[]
> {
  const response = await fetchWithAuth(
    `${API_URL}/administracion/informe-entradas-salidas/empleados`,
    { method: "GET" },
  );
  if (!response.ok) {
    throw new Error("Error al cargar empleados.");
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) return [];
  return data
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as { nit?: unknown; nombres?: unknown };
      const nit = String(item.nit ?? "").trim();
      const nombres = String(item.nombres ?? "").trim();
      if (!nit || !nombres) return null;
      return { nit, nombres };
    })
    .filter((row): row is EmpleadoInformeCombo => row != null);
}
