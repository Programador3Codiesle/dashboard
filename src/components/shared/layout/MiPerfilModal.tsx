'use client';

import {
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  Phone,
  Ruler,
  User,
  Users,
  X,
} from 'lucide-react';
import Modal from '@/components/shared/ui/Modal';
import { useMiPerfil } from '@/modules/usuarios/hooks/useMiPerfil';
import { formatNombre } from '@/utils/format-nombre';

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function dash(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : '—';
}

function hora(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : 'No asignado';
}

function iniciales(nombre: string): string {
  const parts = nombre.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function HoraRow({ label, value }: { label: string; value: string | null | undefined }) {
  const asignado = Boolean(value?.trim());
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={asignado ? 'font-semibold tabular-nums text-gray-900' : 'text-gray-400'}>
        {hora(value)}
      </span>
    </div>
  );
}

export function MiPerfilModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { perfil, isLoading, error } = useMiPerfil(open);
  const nombre = perfil?.nombres ? formatNombre(perfil.nombres) : 'Mi perfil';
  const rol = perfil?.nom_perfil ? titleCase(perfil.nom_perfil) : '';
  const telefonos = [perfil?.telefono_1, perfil?.telefono_2]
    .map((t) => t?.trim())
    .filter(Boolean)
    .join(' · ');

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="42rem"
      maxWidthClassName="max-w-[95vw] sm:max-w-[40rem] md:max-w-[44rem] 2xl:max-w-[48rem]"
      contentClassName="p-0 sm:p-0 md:p-0"
      overflowClassName="overflow-hidden"
    >
      <div data-testid="mi-perfil-modal" className="flex max-h-[88vh] flex-col overflow-hidden">
        <div className="relative shrink-0 overflow-hidden brand-bg-gradient px-5 pb-6 pt-5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-black/10" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold tracking-wide shadow-inner ring-2 ring-white/30">
                {iniciales(nombre)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                  Mi perfil
                </p>
                <h3 className="text-xl font-semibold leading-tight sm:text-2xl">
                  {nombre}
                </h3>
                {rol ? (
                  <span className="mt-2 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                    {rol}
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar perfil"
              className="rounded-xl bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-5 pt-5 pb-10 sm:px-6 sm:pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin brand-text" />
              Cargando perfil...
            </div>
          ) : error ? (
            <p className="rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Building2 size={14} className="brand-text" />
                    Sede
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{dash(perfil?.sede)}</p>
                </article>
                <article className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Briefcase size={14} className="brand-text" />
                    Perfil
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{dash(rol)}</p>
                </article>
                <article className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:col-span-2">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <Users size={14} className="brand-text" />
                    Jefes
                  </div>
                  {perfil?.jefes?.length ? (
                    <ul className="space-y-2">
                      {perfil.jefes.map((jefe) => (
                        <li
                          key={`${jefe.nombres}-${jefe.nom_perfil ?? ''}`}
                          className="flex flex-wrap items-baseline gap-x-2 text-sm"
                        >
                          <span className="font-semibold text-gray-900">
                            {titleCase(jefe.nombres)}
                          </span>
                          {jefe.nom_perfil ? (
                            <span className="text-xs text-gray-500">
                              ({titleCase(jefe.nom_perfil)})
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No tiene jefes asignados</p>
                  )}
                </article>
                <article className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:col-span-2">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <User size={14} className="brand-text" />
                    Información de usuario
                  </div>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={12} /> Correo
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-gray-900">
                        {dash(perfil?.mail)}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={12} /> Teléfono
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-gray-900">
                        {dash(telefonos)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">NIT / cédula</dt>
                      <dd className="mt-0.5 text-sm font-medium tabular-nums text-gray-900">
                        {dash(perfil?.nit)}
                      </dd>
                    </div>
                  </dl>
                </article>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <Ruler size={14} className="brand-text" />
                  Tallas
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border brand-border-active brand-bg-light px-3 py-1.5 text-sm font-semibold brand-text">
                    Camiseta: {dash(perfil?.tallas?.talla_camisa)}
                  </span>
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--color-success)_35%,white)] bg-[var(--color-success-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--color-success)]">
                    Pantalón: {dash(perfil?.tallas?.talla_pantalon)}
                  </span>
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--color-info)_40%,white)] bg-[color-mix(in_srgb,var(--color-info)_12%,white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-info)]">
                    Zapatos: {dash(perfil?.tallas?.talla_botas)}
                  </span>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <CalendarDays size={14} className="brand-text" />
                  Horario
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <article className="rounded-2xl border border-gray-100 p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Clock size={13} /> Lunes a jueves
                    </h4>
                    <div className="space-y-2">
                      <HoraRow label="Entrada AM" value={perfil?.horario?.hora_ent_sem_am} />
                      <HoraRow label="Salida AM" value={perfil?.horario?.hora_sal_sem_am} />
                      <HoraRow label="Entrada PM" value={perfil?.horario?.hora_ent_sem_pm} />
                      <HoraRow label="Salida PM" value={perfil?.horario?.hora_sal_sem_pm} />
                    </div>
                  </article>
                  <article className="rounded-2xl border border-gray-100 p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Clock size={13} /> Viernes
                    </h4>
                    <div className="space-y-2">
                      <HoraRow label="Entrada AM" value={perfil?.horario?.hora_ent_am_viernes} />
                      <HoraRow label="Salida AM" value={perfil?.horario?.hora_sal_am_viernes} />
                      <HoraRow label="Entrada PM" value={perfil?.horario?.hora_ent_viernes_pm} />
                      <HoraRow label="Salida PM" value={perfil?.horario?.hora_sal_viernes} />
                    </div>
                  </article>
                  <article className="rounded-2xl border border-gray-100 p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Clock size={13} /> Sábado
                    </h4>
                    <div className="space-y-2">
                      <HoraRow label="Entrada" value={perfil?.horario?.hora_ent_fds} />
                      <HoraRow label="Salida" value={perfil?.horario?.hora_sal_fds} />
                    </div>
                  </article>
                </div>
              </section>
            </>
          )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
