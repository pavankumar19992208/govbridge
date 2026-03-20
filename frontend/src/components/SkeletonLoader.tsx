export default function SkeletonLoader() {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 animate-pulse relative overflow-hidden" aria-hidden="true" role="progressbar">
      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start md:items-center gap-2 mb-2">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="h-6 bg-slate-100 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-4 mt-2">
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
      </div>
      <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-4">
        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
        <div className="h-5 bg-slate-200 rounded w-20"></div>
      </div>
    </div>
  );
}
