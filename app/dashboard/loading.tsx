export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="flex gap-4 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 border rounded-xl shadow-sm bg-white h-64">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}