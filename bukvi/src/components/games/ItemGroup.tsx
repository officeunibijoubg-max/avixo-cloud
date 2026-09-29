import { cn } from "@/lib/cn";
import { Illustration } from "@/components/illustrations/Illustration";

/** Група предмети за броене; последните `gone` са задраскани (отлетели/изядени). */
export function ItemGroup({ item, count, gone = 0, size = 52, className }: { item: string; count: number; gone?: number; size?: number; className?: string }) {
  return (
    <div className={cn("flex max-w-72 flex-wrap items-center justify-center gap-1", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cn("relative", i >= count - gone && "opacity-30")}>
          <Illustration name={item} size={size} />
          {i >= count - gone && <span className="absolute inset-0 flex items-center justify-center text-4xl text-rose-500">✕</span>}
        </span>
      ))}
    </div>
  );
}
