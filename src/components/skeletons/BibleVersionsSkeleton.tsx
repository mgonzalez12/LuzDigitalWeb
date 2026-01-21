export function BibleVersionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="group bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse"
        >
          {/* Image placeholder */}
          <div className="relative mb-4 aspect-[4/3] bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer"></div>
          </div>
          
          {/* Title placeholder */}
          <div className="h-6 bg-slate-700/50 rounded-lg mb-2 w-3/4"></div>
          
          {/* Subtitle placeholder */}
          <div className="h-4 bg-slate-700/30 rounded-lg w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
