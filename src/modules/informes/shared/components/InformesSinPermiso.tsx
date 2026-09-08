import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { INFORMES_COPY } from '@/modules/informes/constants';

type Props = {
  backHref: string;
  backLabel: string;
};

export function InformesSinPermiso({ backHref, backLabel }: Props) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border brand-border-active bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 brand-border-active">
        <ShieldOff className="brand-text" size={32} aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        {INFORMES_COPY.noPermission}
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {INFORMES_COPY.noPermissionHint}
      </p>
      <Link
        href={backHref}
        className="mt-6 text-sm font-medium brand-text hover:underline"
      >
        {backLabel}
      </Link>
    </div>
  );
}
