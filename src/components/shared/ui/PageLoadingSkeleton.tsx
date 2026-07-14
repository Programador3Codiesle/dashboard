export function PageLoadingSkeleton() {
  return (
    <div className="app-section-card w-full min-w-0 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded-lg w-48 max-w-full" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 bg-gray-100 rounded-lg flex-1 max-w-md" />
        <div className="h-10 bg-gray-100 rounded-lg w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
