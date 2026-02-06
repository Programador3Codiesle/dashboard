"use client";

import { memo } from "react";

function DashboardSkeletonInner() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-xl p-4 h-24" />
        <div className="bg-gray-100 rounded-xl p-4 h-24" />
      </div>
      <div className="bg-gray-100 rounded-xl p-6 h-32" />
    </div>
  );
}

export const DashboardSkeleton = memo(DashboardSkeletonInner);
