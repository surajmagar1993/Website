import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--color-border)]/30", className)}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3">
         <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-64" /> {/* Search bar */}
            <Skeleton className="h-8 w-24 ml-auto" /> {/* Filter */}
            <Skeleton className="h-8 w-32" /> {/* Button */}
         </div>
      </div>
      <div className="p-0">
        <div className="grid grid-cols-1 divide-y divide-[var(--color-border)]">
           {/* Header */}
           <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--color-bg)]/50">
              {Array.from({ length: columns }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full col-span-3" />
              ))}
           </div>
           {/* Rows */}
           {Array.from({ length: rows }).map((_, i) => (
             <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
                {Array.from({ length: columns }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full col-span-3" />
                ))}
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
           <Skeleton className="h-48 w-full rounded-lg" />
           <div className="space-y-2">
             <Skeleton className="h-6 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
           </div>
           <div className="mt-4 flex gap-2">
             <Skeleton className="h-8 w-20 rounded-full" />
             <Skeleton className="h-8 w-20 rounded-full" />
           </div>
        </div>
      ))}
    </div>
  )
}
