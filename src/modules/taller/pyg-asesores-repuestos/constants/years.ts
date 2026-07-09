const YEAR_MIN = 2015;

export function getYearUpload(): number {
  const yearActual = new Date().getFullYear();
  const yearsLoad = yearActual - 10;
  return yearsLoad < YEAR_MIN ? YEAR_MIN : yearsLoad;
}

/** Años para AÑO INFORME: desde actual hasta yearUpload+1 (excluye yearUpload) */
export function getYearOneOptions(): number[] {
  const yearActual = new Date().getFullYear();
  const yearUpload = getYearUpload();
  const options: number[] = [];
  for (let i = yearActual; i > yearUpload; i--) {
    options.push(i);
  }
  return options;
}

/** Años para AÑO A COMPARAR: desde actual-1 hasta yearUpload */
export function getYearTwoOptions(): number[] {
  const yearActual = new Date().getFullYear();
  const yearUpload = getYearUpload();
  const options: number[] = [];
  for (let i = yearActual - 1; i >= yearUpload; i--) {
    options.push(i);
  }
  return options;
}

/** Mes máximo permitido cuando el año informe es el año actual (legacy getMonth 0-indexed) */
export function getMaxMonthForCurrentYear(): string {
  const now = new Date();
  const monthActual = now.getMonth();
  const monthMax = monthActual < 10 ? `0${monthActual}` : String(monthActual);
  return monthMax;
}

export function buildMonthBounds(year: string): {
  min: string;
  max: string;
} | null {
  if (!year) return null;
  const yearNum = Number(year);
  if (!Number.isFinite(yearNum)) return null;

  const monthMin = `${year}-01`;
  let monthMax = `${year}-12`;

  const currentYear = new Date().getFullYear();
  if (yearNum === currentYear) {
    monthMax = `${year}-${getMaxMonthForCurrentYear()}`;
  }

  return { min: monthMin, max: monthMax };
}
