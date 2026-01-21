export function ChapterContentSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-8">
      {/* Verse of the Day Skeleton */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 animate-pulse">
        <div className="h-4 bg-slate-700/30 rounded-lg w-32 mb-4"></div>
        <div className="h-6 bg-slate-700/50 rounded-lg mb-2"></div>
        <div className="h-6 bg-slate-700/50 rounded-lg w-4/5 mb-4"></div>
        <div className="h-4 bg-slate-700/30 rounded-lg w-24"></div>
      </div>

      {/* Title Skeleton */}
      <div className="text-center animate-pulse">
        <div className="h-14 bg-slate-700/50 rounded-lg mb-2 w-64 mx-auto"></div>
        <div className="h-4 bg-slate-700/30 rounded-lg w-48 mx-auto"></div>
      </div>

      {/* Featured Card Skeleton */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-pulse">
        <div className="aspect-[21/9] bg-gradient-to-br from-slate-700/50 to-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Chapter Navigation Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="h-10 bg-slate-700/50 rounded-lg w-32"></div>
        <div className="h-10 bg-slate-700/50 rounded-lg w-32"></div>
      </div>

      {/* Verses Skeleton */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-slate-700/50">
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-700/50 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-700/50 rounded-lg"></div>
                <div className="h-6 bg-slate-700/50 rounded-lg w-5/6"></div>
                {i % 3 === 0 && (
                  <div className="h-6 bg-slate-700/50 rounded-lg w-4/6"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section Skeleton */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded-lg w-48 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/30 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-700/30 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-700/30 rounded-lg w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
