export function BibleBooksSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <div
          key={i}
          className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 animate-pulse"
        >
          {/* Icon placeholder */}
          <div className="w-12 h-12 bg-slate-700/50 rounded-xl mb-4"></div>
          
          {/* Title placeholder */}
          <div className="h-6 bg-slate-700/50 rounded-lg mb-3 w-3/4"></div>
          
          {/* Chapters info placeholder */}
          <div className="h-4 bg-slate-700/30 rounded-lg w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
