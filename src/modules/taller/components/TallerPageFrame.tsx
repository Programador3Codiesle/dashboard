import type { ReactNode } from "react";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

export function TallerPageFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageTitleRow title={title} description={description} />
      {children}
    </div>
  );
}
