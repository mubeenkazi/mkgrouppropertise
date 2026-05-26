import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type SearchFilters = {
  location: string;
  minPrice: string;
  maxPrice: string;
  minSqft: string;
  maxSqft: string;
};

export const emptyFilters: SearchFilters = {
  location: "",
  minPrice: "",
  maxPrice: "",
  minSqft: "",
  maxSqft: "",
};

const SearchBar = ({
  filters,
  onChange,
  onSubmit,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  onSubmit?: () => void;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)] sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search city, area or nearby place..."
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="border-0 pl-10 focus-visible:ring-1"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] max-w-80 space-y-4" align="center">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Min price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={filters.minPrice}
                onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Max price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Min sq ft</Label>
              <Input
                type="number"
                min={0}
                value={filters.minSqft}
                onChange={(e) => onChange({ ...filters, minSqft: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Max sq ft</Label>
              <Input
                type="number"
                min={0}
                value={filters.maxSqft}
                onChange={(e) => onChange({ ...filters, maxSqft: e.target.value })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button type="submit" variant="brand" size="sm">
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
