import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import { Land } from "@/types/db";
import { api } from "@/lib/api";

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
      <Navbar />
      <section className="container py-10">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-foreground">Lands &amp; Properties</h1>
          <p className="mt-2 text-muted-foreground">Browse all available listings. Use filters to narrow your search.</p>
        </header>
        <SearchBar filters={filters} onChange={setFilters} onSubmit={onSubmit} />

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : lands.length === 0 ? (
          <div className="mt-16 rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
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
