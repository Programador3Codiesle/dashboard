export type RankingTrimestralFila = {
  operario: string;
  tecnico: string;
  mes1: number;
  mes2: number;
  mes3: number;
  total: number;
};

export type RankingTrimestralResponse = {
  ano: number;
  trimestre: 1 | 2 | 3 | 4;
  meses: [number, number, number];
  filas: RankingTrimestralFila[];
};
