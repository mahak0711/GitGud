import { cn } from "@/lib/utils";

// 1. Reusable Skeleton Component (looks like Shadcn/Aceternity)
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/50 dark:bg-zinc-800/50",
        className
      )}
      {...props}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-6 font-sans">
      
      {/* 2. Header Section */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* 3. Filter Bar */}
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-9 w-24 rounded-full"
          />
        ))}
      </div>

      {/* 4. Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black/40"
          >
            {/* Card Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Card Body / Description */}
            <div className="space-y-2 py-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>

            {/* Card Footer / Tags */}
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}