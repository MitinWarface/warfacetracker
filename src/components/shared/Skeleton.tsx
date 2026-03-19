// src/components/shared/Skeleton.tsx
// Скелетон загрузки для слабого интернета

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function Skeleton({
  className = "",
  width,
  height,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div
      className={`animate-pulse bg-wf-muted/20 rounded ${className}`}
      style={style}
    />
  );
}

// Пресеты скелетонов
export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
