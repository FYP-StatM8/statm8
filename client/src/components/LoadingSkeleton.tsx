import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingSkeleton() {
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" /> {/* Welcome back */}
                <Skeleton className="h-4 w-80" /> {/* Subtitle */}
            </div>

            {/* Top Feature Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>

            {/* Explore Features Title */}
            <Skeleton className="h-6 w-40" />

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="border rounded-xl p-6 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-9 w-32 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}
