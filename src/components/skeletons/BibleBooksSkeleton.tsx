export function BibleBooksSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div
          key={i}
          className="group bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all animate-pulse"
        >
          {/* Book number and icon placeholder */}
          <div className="flex items-start justify-between mb-4">
            <div className="h-4 w-20 bg-slate-700/50 rounded"></div>
            <div className="w-10 h-10 bg-slate-700/50 rounded-lg"></div>
          </div>
          
          {/* Title placeholder */}
          <div className="h-6 bg-slate-700/50 rounded-lg mb-2 w-3/4"></div>
          
          {/* Chapters info placeholder */}
          <div className="h-4 bg-slate-700/30 rounded-lg w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
