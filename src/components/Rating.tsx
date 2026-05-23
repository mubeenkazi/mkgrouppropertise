import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Rating = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        style={{ width: size, height: size }}
        className={cn(i <= Math.round(value) ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-muted-foreground/40")}
      />
    ))}
  </div>
);

export default Rating;
