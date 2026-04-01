import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface InformeHorarioAPI {
  empleado: string;
  nombres: string;
  sede: string;
  dia: string;
  fecha: string;
  horario_entrada_am: string | null;
  horario_salida_am: string | null;
  horario_entrada_pm: string | null;
  horario_salida_pm: string | null;
  inicio_ausentismo: string | null;
  fin_ausentismo: string | null;
  llegada_am: string | null;
  salida_am: string | null;
  llegada_pm: string | null;
  salida_pm: string | null;
  dif_entrada_am: number | null;
  dif_salida_am: number | null;
  dif_entrada_pm: number | null;
  dif_salida_pm: number | null;
}

export interface InformeHorario {
  documento: string;
  nombres: string;
  sede: string;
  dia: string;
  fecha: string;
  horarioEntradaAm: string | null;
  horarioSalidaAm: string | null;
  horarioEntradaPm: string | null;
  horarioSalidaPm: string | null;
  inicioAusentismo: string | null;
  finAusentismo: string | null;
  llegadaAm: string | null;
  salidaAm: string | null;
  llegadaPm: string | null;
  salidaPm: string | null;
  difEntradaAm: number | null;
  difSalidaAm: number | null;
  difEntradaPm: number | null;
  difSalidaPm: number | null;
}

export interface FiltrosInformeHorario {
  sede?: string;
  fechaIni: string;
  fechaFin: string;
  empleado?: string;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 10);
}

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").slice(0, 16);
}

function mapItem(item: InformeHorarioAPI): InformeHorario {
  return {
    documento: item.empleado ? String(item.empleado) : "N/A",
    nombres: item.nombres || "N/A",
    sede: item.sede || "N/A",
    dia: item.dia || "",
    fecha: formatDate(item.fecha) ?? "",
    horarioEntradaAm: item.horario_entrada_am,
    horarioSalidaAm: item.horario_salida_am,
    horarioEntradaPm: item.horario_entrada_pm,
    horarioSalidaPm: item.horario_salida_pm,
    inicioAusentismo: item.inicio_ausentismo,
    finAusentismo: item.fin_ausentismo,
    llegadaAm: formatDateTime(item.llegada_am),
    salidaAm: formatDateTime(item.salida_am),
    llegadaPm: formatDateTime(item.llegada_pm),
    salidaPm: formatDateTime(item.salida_pm),
    difEntradaAm: item.dif_entrada_am,
    difSalidaAm: item.dif_salida_am,
    difEntradaPm: item.dif_entrada_pm,
    difSalidaPm: item.dif_salida_pm,
  };
}

export const informeHorarioService = {
  async listar(filtros: FiltrosInformeHorario): Promise<InformeHorario[]> {
    const params = new URLSearchParams();
    params.append("fechaIni", filtros.fechaIni);
    params.append("fechaFin", filtros.fechaFin);
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.empleado) params.append("empleado", filtros.empleado);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-horario?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el informe de ingreso de empleados.");
    }

    const data: InformeHorarioAPI[] = await response.json();
    return (data || []).map(mapItem);
  },
};

