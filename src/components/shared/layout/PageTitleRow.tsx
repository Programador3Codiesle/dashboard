import type { ReactNode } from "react";
import { EmpresaBadge } from "@/components/shared/brand/EmpresaBadge";

interface PageTitleRowProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingAs?: "h1" | "h2";
  headingClassName?: string;
  descriptionClassName?: string;
  className?: string;
}

export function PageTitleRow({
  title,
  description,
  actions,
  headingAs: Tag = "h1",
  headingClassName = "app-title-xl brand-text",
  descriptionClassName = "mt-1 text-gray-500",
  className = "",
}: PageTitleRowProps) {
  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      {title != null && title !== "" ? (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Tag className={headingClassName}>{title}</Tag>
            <EmpresaBadge />
          </div>
          {description != null && description !== "" ? (
            <p className={descriptionClassName}>{description}</p>
          ) : null}
        </div>
      ) : (
        <div />
      )}
      {actions}
    </div>
  );
}
