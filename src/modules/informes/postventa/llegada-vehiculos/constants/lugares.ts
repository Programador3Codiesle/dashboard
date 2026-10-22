/** Nombres alineados al informe de Girón y a los combos de taller del legacy. */
export interface BodegaEntradaVh {
  id: number;
  nombre: string;
}

export interface LugarEntradaVh {
  id: string;
  nombre: string;
  bodegas: BodegaEntradaVh[];
}

export const LUGAR_ENTRADA_VH_DEFAULT = "giron";

export const LUGARES_ENTRADA_VH: LugarEntradaVh[] = [
  {
    id: "giron",
    nombre: "Girón",
    bodegas: [
      { id: 1, nombre: "Girón Gasolina" },
      { id: 11, nombre: "Girón Diesel" },
      { id: 9, nombre: "Girón Colisión Livianos" },
      { id: 21, nombre: "Girón Colisión Pesados" },
    ],
  },
  {
    id: "cucuta",
    nombre: "Cúcuta",
    bodegas: [
      { id: 8, nombre: "Cúcuta Gasolina" },
      { id: 16, nombre: "Cúcuta Diesel" },
      { id: 14, nombre: "Cúcuta Colisión Livianos" },
      { id: 22, nombre: "Cúcuta Colisión Pesados" },
    ],
  },
  {
    id: "barranca",
    nombre: "Barranca",
    bodegas: [
      { id: 6, nombre: "Barranca Gasolina" },
      { id: 19, nombre: "Barranca Diesel" },
    ],
  },
  {
    id: "rosita",
    nombre: "Rosita",
    bodegas: [{ id: 7, nombre: "La Rosita" }],
  },
];
