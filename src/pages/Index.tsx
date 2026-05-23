import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MapPin, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchBar, { SearchFilters, emptyFilters } from "@/components/SearchBar";
import Rating from "@/components/Rating";
import { Button } from "@/components/ui/button";
import { Land } from "@/types/db";
import heroImg from "@/assets/hero.jpg";
import whyBuy from "@/assets/why-buy.jpg";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const reviewSamples = [
  { name: "Sarah Mitchell", rating: 5, text: "Smooth process from browsing to purchase. The team was helpful at every step.", avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "David Chen", rating: 5, text: "Found the perfect lakeside plot. Photos and details were exactly as described.", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Amara Okafor", rating: 4, text: "Great selection and transparent pricing. Would highly recommend to investors.", avatar: "https://i.pravatar.cc/100?img=32" },
];

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [featured, setFeatured] = useState<Land[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api<Land[]>("/lands?limit=6", { auth: false }).then((data) => setFeatured(data ?? []));
  }, []);

  const submitSearch = () => {
    const p = new URLSearchParams();
    if (filters.location) p.set("location", filters.location);
    if (filters.minPrice) p.set("minPrice", filters.minPrice);
    if (filters.maxPrice) p.set("maxPrice", filters.maxPrice);
    if (filters.minSqft) p.set("minSqft", filters.minSqft);
    if (filters.maxSqft) p.set("maxSqft", filters.maxSqft);
    navigate(`/lands?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[640px] w-full overflow-hidden">
        <img src={heroImg} alt="Premium land for sale" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-[image:var(--gradient-overlay)]" />
        <div className="container relative z-10 flex min-h-[640px] flex-col justify-center py-20">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md ring-1 ring-white/20">
              <Shield className="h-3.5 w-3.5" /> Verified listings · Trusted sellers
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Find Your <span className="bg-[image:var(--gradient-gold)] bg-clip-text text-transparent">Dream Land</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">
              Premium plots, investment opportunities, and buildable lots in the world's most desirable locations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/lands">Explore Lands <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 backdrop-blur hover:bg-white/20 hover:text-white" asChild>
                <Link to="/contact">Contact</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 max-w-3xl">
            <SearchBar filters={filters} onChange={setFilters} onSubmit={submitSearch} />
          </div>
        </div>
      </section>

      {/* CITY SEO */}
      <section className="container py-16">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Top Locations</span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Land for Sale in Mumbai, Pune & Goa</h2>
          <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
            Explore premium plots and investment lands in Mumbai, Pune and Goa — handpicked by MK Group Properties for buyers, builders and long-term investors across Maharashtra and Goa.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { city: "Mumbai", desc: "Buy land in Mumbai & MMR — high-growth residential and commercial plots near upcoming infrastructure." },
            { city: "Pune", desc: "NA plots and investment land in Pune — close to IT hubs, expressways and fast-developing suburbs." },
            { city: "Goa", desc: "Beachside and hinterland land in Goa — perfect for villas, resorts and lifestyle investments." },
          ].map((c) => (
            <Link
              key={c.city}
              to={`/lands?location=${c.city}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:border-primary hover:shadow-[var(--shadow-elegant)]"
            >
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary">Land for Sale in {c.city}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                View {c.city} plots <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Featured</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Handpicked Lands</h2>
            <p className="mt-2 text-muted-foreground">A curated selection of our finest available properties.</p>
          </div>
          <Button variant="outline" asChild className="hidden md:inline-flex">
            <Link to="/lands">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            No lands listed yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => <PropertyCard key={l.id} land={l} />)}
          </div>
        )}
      </section>

      {/* WHY BUY */}
      <section className="bg-secondary/50 py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <img src={whyBuy} alt="Benefits of buying land" loading="lazy" width={1024} height={768} className="rounded-2xl shadow-[var(--shadow-elegant)]" />
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Why buy land</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">A smart, tangible investment</h2>
            <p className="mt-4 text-muted-foreground">
              Land is one of the most durable stores of value. Whether you're building your dream home or securing long-term growth, owning prime land gives you options.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: TrendingUp, title: "Appreciation", desc: "Prime locations steadily grow in value over time." },
                { icon: MapPin, title: "Location matters", desc: "Near infrastructure, schools, and commerce centers." },
                { icon: Shield, title: "Verified listings", desc: "Every seller is vetted for your peace of mind." },
              ].map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{title}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {featured.length > 0 && (
        <section className="container py-20">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Gallery</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">A look at our properties</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featured.slice(0, 8).map((l, i) => (
              <Link
                key={l.id}
                to={`/lands/${l.id}`}
                className={`group relative overflow-hidden rounded-xl ${i % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
              >
                <img src={l.image_url || heroImg} alt={l.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-3 left-3 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {l.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section className="bg-secondary/50 py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Reviews</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">What our customers say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviewSamples.map((r) => (
              <div key={r.name} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <img src={r.avatar} alt={r.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                  <div>
                    <div className="font-semibold text-foreground">{r.name}</div>
                    <Rating value={r.rating} />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)] p-10 text-primary-foreground shadow-[var(--shadow-elegant)] md:p-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to find your piece of land?</h2>
            <p className="mt-3 text-primary-foreground/90">Browse verified listings and talk to trusted sellers today.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/lands">Browse Lands</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/contact">Get in touch</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/90">
              {["Secure transactions", "Verified sellers", "24/7 support"].map((x) => (
                <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
