// src/app/profile/[nickname]/loading.tsx

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-wf-bg text-wf-text animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-56 bg-wf-surface border-b border-wf-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-6 gap-6">
          <div className="w-24 h-24 rounded-full bg-wf-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-8 w-48 rounded bg-wf-muted" />
            <div className="h-4 w-32 rounded bg-wf-muted" />
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-wf-card border border-wf-border"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
