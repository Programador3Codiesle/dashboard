import { EMPRESAS, type EmpresaId } from '@/utils/constants';

const LOGO_BY_EMPRESA: Record<EmpresaId, string> = {
  1: '/logos/empresa1.png',
  2: '/logos/empresa2.png',
  3: '/logos/empresa3.png',
  4: '/logos/empresa4.png',
};

export function getChecklistEmpresaLogo(empresaId?: number | null): {
  src: string;
  nombre: string;
  color: string;
} {
  const id = (empresaId ?? 1) as EmpresaId;
  const empresa = EMPRESAS.find((e) => e.id === id) ?? EMPRESAS[0];
  return {
    src: LOGO_BY_EMPRESA[empresa.id] ?? LOGO_BY_EMPRESA[1],
    nombre: empresa.nombre,
    color: empresa.color,
  };
}
