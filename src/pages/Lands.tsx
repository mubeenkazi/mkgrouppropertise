import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import { Land } from "@/types/db";
import { api } from "@/lib/api";
import Seo from "@/lib/seo";

const Lands = () => {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    location: params.get("location") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    minSqft: params.get("minSqft") ?? "",
    maxSqft: params.get("maxSqft") ?? "",
  });
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLands = useMemo(() => async (f: SearchFilters) => {
    setLoading(true);
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
    p.set("summary", "1");
    const data = await api<Land[]>(`/lands?${p.toString()}`, { auth: false });
    setLands(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLands(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    setParams(p);
    fetchLands(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Browse Verified Land & Plots for Sale in India | MK Group Properties"
        description="Search verified land, residential plots, NA plots, farmhouse land and investment properties by city, price and plot size with MK Group Properties."
        canonicalPath="/lands"
        keywords="browse land for sale India, verified plots India, residential plots, NA plots, farmhouse land, investment land"
      />
      <Navbar />
      <section className="container py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Lands &amp; Properties</h1>
          <p className="mt-2 text-muted-foreground">Search by city, area, nearby place, price or plot size to find the right land.</p>
        </header>
        <SearchBar filters={filters} onChange={setFilters} onSubmit={onSubmit} />

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : lands.length === 0 ? (
          <div className="mt-16 rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground sm:p-12">
            No lands match your filters. Try adjusting your search.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lands.map((l) => <PropertyCard key={l.id} land={l} />)}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Lands;
