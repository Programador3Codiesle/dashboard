import {
  BriefcaseBusiness,
  Package,
  Paintbrush,
  Palette,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { NOMINA_HUB_NAV } from './nav';

export const NOMINA_HUB_ITEMS = attachHubIcons(NOMINA_HUB_NAV, {
  'comisiones-asesores-repuestos': UserCog,
  'comisiones-jefes': Users,
  'comisiones-lamina-pintura': Paintbrush,
  'comisiones-tecnicos': Wrench,
  'nomina-director-flotas': BriefcaseBusiness,
  'relacion-margen-materiales-colorista': Palette,
  'nomina-accesorios': Package,
});
