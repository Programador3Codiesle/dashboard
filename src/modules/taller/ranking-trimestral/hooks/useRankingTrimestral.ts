import { useQuery } from "@tanstack/react-query";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";
import { rankingTrimestralService } from "../services/ranking-trimestral.service";
import type { RankingTrimestralResponse } from "../types";

export const rankingTrimestralKeys = {
  all: ["taller", "ranking-trimestral"] as const,
  list: (ano: number, trimestre: 1 | 2 | 3 | 4) =>
    ["taller", "ranking-trimestral", ano, trimestre] as const,
};

export function useRankingTrimestral(
  ano: number,
  trimestre: 1 | 2 | 3 | 4,
  enabled: boolean,
) {
  return useQuery<RankingTrimestralResponse>({
    queryKey: rankingTrimestralKeys.list(ano, trimestre),
    queryFn: () => rankingTrimestralService.listar(ano, trimestre),
    enabled,
    ...catalogQueryOptions,
  });
}
