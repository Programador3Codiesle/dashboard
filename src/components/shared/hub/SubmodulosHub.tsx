'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { filterHubItems } from './filter-hub-items';
import type { HubCardVariant, SubmodulosHubProps } from './types';
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

interface HubCardProps {
  item: SubmodulosHubProps['items'][number];
  variant: HubCardVariant;
}

const cardClassBorder =
  'group brand-card-elevated hover-lift flex min-h-[11rem] cursor-pointer flex-col rounded-2xl border brand-border-active bg-white p-4 transition-all duration-300 sm:min-h-[12.5rem] sm:p-6 3xl:min-h-[14rem] 3xl:p-7';
const cardClassGradient =
  'group brand-card-elevated hover-lift flex min-h-[11rem] cursor-pointer flex-col rounded-2xl border brand-border-active bg-white p-3 transition-all duration-300 sm:p-4 md:p-6';

function HubCard({ item, variant }: HubCardProps) {
  const Icon = item.icono;
  const isBorder = variant === 'border';
  const className = isBorder ? cardClassBorder : cardClassGradient;

  const content = (
    <>
      {isBorder ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 brand-border-active bg-white transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--color-primary)]">
          <Icon size={28} className="brand-text" />
        </div>
      ) : (
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br ${item.color ?? 'from-gray-600 to-gray-700'} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={28} className="text-white" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:brand-text">
        {item.nombre}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600">{item.descripcion}</p>
      <div className="mt-auto flex items-center pt-4 text-sm font-medium brand-text [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:group-hover:opacity-100">
        <span>Acceder</span>
        <ChevronRight size={16} className="ml-1" />
      </div>
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.ruta}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.ruta} prefetch className={className}>
      {content}
    </Link>
  );
}

const MemoHubCard = memo(HubCard);

function SubmodulosHubComponent({
  title,
  description,
  items,
  filter,
  variant = 'gradient',
  titleClassName = 'app-title-xl brand-text',
  gridClassName = 'app-hub-grid',
  emptyWhenFiltered = false,
}: SubmodulosHubProps) {
  const { user } = useAuth();

  const visibleItems = useMemo(
    () => filterHubItems(items, user, filter ?? {}),
    [items, user, filter],
  );

  if (emptyWhenFiltered && visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageTitleRow
        title={title}
        description={description}
        headingClassName={titleClassName}
        descriptionClassName="mt-1 text-gray-500"
      />

      <div className={gridClassName}>
        {visibleItems.map((item) => (
          <MemoHubCard key={item.id} item={item} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export const SubmodulosHub = memo(SubmodulosHubComponent);
