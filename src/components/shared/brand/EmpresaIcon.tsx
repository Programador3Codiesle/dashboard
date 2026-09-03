import { EMPRESAS, empresaIconSrc } from "@/utils/constants";

interface EmpresaIconProps {
  empresaId?: number | null;
  size?: number;
  className?: string;
  /** Placa blanca para leer el isotipo sobre sidebar oscuro o header claro. */
  framed?: boolean;
}

export function EmpresaIcon({
  empresaId,
  size = 40,
  className = "",
  framed = false,
}: EmpresaIconProps) {
  const src = empresaIconSrc(empresaId);
  const empresa = empresaId != null ? EMPRESAS.find((item) => item.id === empresaId) : null;
  const isBowtie = empresa?.id === 1;
  const bowtieWidth = Math.round(size * 1.55);

  const fallback = (
    <span
      className={
        framed
          ? "flex h-full w-full items-center justify-center rounded-lg brand-bg-gradient font-bold text-white"
          : `inline-flex shrink-0 items-center justify-center rounded-xl brand-bg-gradient font-bold text-white ${className}`
      }
      style={framed ? undefined : { width: size, height: size }}
      aria-hidden
    >
      {empresa?.nombre?.charAt(0) ?? "C"}
    </span>
  );

  const mark =
    !src || !empresa ? (
      fallback
    ) : (
      // PNG en /public; next/image optimizer no sirve estos assets en dev.
      // src ya incluye basePath (`withNextBasePath`) para prod `/postventa2`.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={empresa.nombre}
        width={isBowtie ? bowtieWidth : size}
        height={size}
        className={
          framed
            ? `object-contain ${isBowtie ? "h-[70%] w-[92%]" : "h-[74%] w-[74%]"}`
            : isBowtie
              ? "shrink-0 object-contain"
              : `shrink-0 object-contain ${className}`
        }
        style={
          !framed && isBowtie
            ? { width: bowtieWidth, height: size }
            : undefined
        }
      />
    );

  if (!framed) return mark;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/10 ${className}`}
      style={className ? undefined : { width: size, height: size }}
      title={empresa?.nombre}
    >
      {mark}
    </span>
  );
}
