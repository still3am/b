export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="skeleton-shimmer rounded-lg h-8 w-8 mb-4" />
      <div className="skeleton-shimmer rounded h-5 w-3/4 mb-2" />
      <div className="skeleton-shimmer rounded h-4 w-full mb-1" />
      <div className="skeleton-shimmer rounded h-4 w-5/6 mb-4" />
      <div className="skeleton-shimmer rounded h-8 w-1/3" />
    </div>
  );
}