'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import NuevoTicketModal from './modals/NuevoTicketModal';
import {
  TICKETS_COPY,
  TICKETS_TAB_ITEMS,
  puedeVerTodosLosTickets,
} from '../constants';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

export function TicketsLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openNew, setOpenNew] = useState(false);

  const canSeeAllTickets = puedeVerTodosLosTickets(user?.perfil_postventa);
  const tabs = TICKETS_TAB_ITEMS.filter(
    (tab) => !tab.requiresVerTodos || canSeeAllTickets,
  );

  return (
    <div data-testid="tickets-module" className="space-y-4 sm:space-y-6">
      <PageTitleRow
        title={TICKETS_COPY.title}
        description={TICKETS_COPY.subtitle}
        className="min-w-0"
        actions={
          <div className="w-full sm:w-auto">
          <button
            type="button"
            data-testid="tickets-new"
            onClick={() => setOpenNew(true)}
            className="flex w-full sm:w-auto justify-center items-center gap-2 brand-bg brand-bg-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span>{TICKETS_COPY.nuevoTicket}</span>
          </button>
          </div>
        }
      />

      <div className="app-tabs-scroll border-b border-gray-200">
        <nav
          data-testid="tickets-tabs"
          className="-mb-px flex min-w-max gap-4 sm:gap-8"
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-[var(--color-primary)] brand-text'
                      : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[400px] animate-in fade-in duration-500">
        {children}
      </div>

      <NuevoTicketModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
