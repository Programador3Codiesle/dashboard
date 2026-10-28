import { apiClient } from "@/lib/api-client";
import { getVentasBaseUrl, getVentasLoginUrl } from "@/config/public-env";

type AccesoVentasResponse = {
  listo: boolean;
  nit?: number;
  contra?: string;
};

function irAlLogin(ventana: Window) {
  try {
    ventana.location.href = getVentasLoginUrl();
  } catch {
    // La pestaña se cerró antes de cargar el login.
  }
}

function enviarFormulario(ventana: Window, nit: number, contra: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${getVentasBaseUrl()}/Login/sesion`;
  form.target = ventana.name;
  form.hidden = true;
  form.autocomplete = "off";

  const campos: Record<string, string> = {
    nit: String(nit),
    contra,
    op: "1",
  };
  for (const [name, value] of Object.entries(campos)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

/** La pestaña ya está abierta por el clic. Ventas decide Home o su login. */
export async function completarAccesoVentas(ventana: Window): Promise<void> {
  try {
    const { data } = await apiClient.get<AccesoVentasResponse>(
      "/auth/acceso-ventas",
    );
    if (!data.listo || data.nit == null || !data.contra) {
      irAlLogin(ventana);
      return;
    }
    enviarFormulario(ventana, data.nit, data.contra);
  } catch {
    irAlLogin(ventana);
  }
}

export function abrirPestañaVentas(): Window | null {
  const ventana = window.open("about:blank", "_blank");
  if (!ventana || ventana.closed) return null;
  ventana.name = `ventas-${Date.now()}`;
  return ventana;
}
