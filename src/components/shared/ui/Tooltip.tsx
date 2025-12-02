'use client';
import { Portal } from "./Portal";

interface TooltipProps {
  x: number;
  y: number;
  content: React.ReactNode;
}

export function Tooltip({ x, y, content }: TooltipProps) {
  return (
    <Portal>
      <div
        className="fixed z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
        style={{ left: x, top: y - 10 }}
      >
        {content}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
      </div>
    </Portal>
  );
}
