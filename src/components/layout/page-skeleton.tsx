export function PageSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-4">
      <div className="bg-muted h-4 w-40 rounded" />
      <div className="bg-muted h-9 w-2/3 rounded" />
      <div className="bg-muted h-24 rounded-xl" />
      <div className="bg-muted h-40 rounded-xl" />
    </div>
  );
}
