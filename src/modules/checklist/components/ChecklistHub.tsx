'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CHECKLIST_HUB_ITEMS } from '@/modules/checklist/hub/items';

export function ChecklistHub() {
  return (
    <SubmodulosHub
      title="Checklist"
      description="Formatos de inspección preoperacional y permisos de trabajo"
      items={CHECKLIST_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
