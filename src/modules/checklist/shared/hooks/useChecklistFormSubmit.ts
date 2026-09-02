'use client';

import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';

export function useChecklistFormSubmit(mutate: () => void) {
  const { showError } = useToast();

  return (e: FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    if (!formEl.checkValidity()) {
      showError(CHECKLIST_COPY.saveValidation);
      formEl.reportValidity();
      return;
    }
    mutate();
  };
}
