import { nextPublicAssetSrc } from '@/config/next-base-path';
import {
  BYD_EMPRESA_ID,
  CODIESEL_EMPRESA_ID,
  DIESELCO_EMPRESA_ID,
  EMPRESAS,
  MITSUBISHI_EMPRESA_ID,
  type EmpresaId,
} from '@/utils/constants';

const LOGO_BY_EMPRESA: Record<EmpresaId, string> = {
  [CODIESEL_EMPRESA_ID]: '/logos/empresa1.png',
  [DIESELCO_EMPRESA_ID]: '/logos/empresa2.png',
  [MITSUBISHI_EMPRESA_ID]: '/logos/empresa3.png',
  [BYD_EMPRESA_ID]: '/logos/empresa4.png',
};

function toEmpresaId(empresaId?: number | null): EmpresaId {
  const match = EMPRESAS.find((e) => e.id === empresaId);
  return match?.id ?? CODIESEL_EMPRESA_ID;
}

export function getChecklistEmpresaLogo(empresaId?: number | null): {
  src: string;
  nombre: string;
  color: string;
} {
  const id = toEmpresaId(empresaId);
  const empresa = EMPRESAS.find((e) => e.id === id) ?? EMPRESAS[0];
  const relative =
    LOGO_BY_EMPRESA[empresa.id] ?? LOGO_BY_EMPRESA[CODIESEL_EMPRESA_ID];
  return {
    src: nextPublicAssetSrc(relative),
    nombre: empresa.nombre,
    color: empresa.color,
  };
}

