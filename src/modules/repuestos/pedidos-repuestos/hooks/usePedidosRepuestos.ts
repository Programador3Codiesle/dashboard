import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import {
  pedidosRepuestosService,
  type PedidoRepuestoItem,
} from '../services/pedidos-repuestos.service';

export const pedidosRepuestosKeys = {
  all: ['repuestos', 'pedidos'] as const,
  list: (q: string) => ['repuestos', 'pedidos', q] as const,
};

export function usePedidosRepuestos(enabled: boolean, q: string) {
  const termino = q.trim();
  return useQuery<PedidoRepuestoItem[]>({
    queryKey: pedidosRepuestosKeys.list(termino),
    queryFn: () => pedidosRepuestosService.listar(termino),
    enabled,
    placeholderData: keepPreviousData,
    ...transactionalQueryOptions,
  });
}
