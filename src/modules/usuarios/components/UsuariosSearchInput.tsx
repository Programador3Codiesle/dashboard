"use client";

import { memo, useEffect, useState } from "react";
import { useDebouncedValue } from "@/components/shared/ui/hooks/useDebouncedValue";
import { USUARIOS_COPY } from "../constants";

export const UsuariosSearchInput = memo(function UsuariosSearchInput({
  onDebouncedChange,
}: {
  onDebouncedChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    onDebouncedChange(debouncedValue);
  }, [debouncedValue, onDebouncedChange]);

  return (
    <input
      className="w-full sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none brand-focus-ring"
      placeholder={USUARIOS_COPY.searchPlaceholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
});
