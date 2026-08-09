import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

function EventSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3">
      {/* ヘッダー */}
      <section className="mt-5 mb-8 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div className="mt-5 flex items-center gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </section>

      <Separator />

      {/* 参加者一覧 */}
      <section className="mt-5 mb-8">
        <div className="bg-card rounded-xl border">
          <div className="flex items-center gap-3 p-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="divide-y border-y">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 予定一覧 */}
      <section className="mb-8">
        <div className="bg-card rounded-xl border">
          <div className="p-6">
            <Skeleton className="h-6 w-20" />
          </div>
          <Separator />
          <div className="flex flex-col gap-3 p-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </section>

      {/* 予定抽出 */}
      <section className="mb-8">
        <div className="bg-card rounded-xl border">
          <div className="flex flex-col gap-2 p-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Separator />
          <div className="flex flex-col gap-5 p-6 sm:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Skeleton className="h-72 w-full rounded-md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EventSkeleton;
