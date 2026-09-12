export function formatCurrency(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

export function formatNumberEs(value: number, fractionDigits = 0): string {
  return Number(value || 0).toLocaleString("es-CO", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatMoneyEs(value: number, fractionDigits = 0): string {
  return `$ ${formatNumberEs(value, fractionDigits)}`;
}

export function formatPercent(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error == null || !("response" in error)) {
    return fallback;
  }
  const message = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message;
  if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  if (typeof message === "string" && message) return message;
  return fallback;
}

