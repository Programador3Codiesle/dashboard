'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';
import { CHECKLIST_HUB_ITEMS } from '@/modules/checklist/hub/items';

export function ChecklistHub() {
  return (
    <SubmodulosHub
      title={CHECKLIST_COPY.hub.title}
      description={CHECKLIST_COPY.hub.description}
      items={CHECKLIST_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
