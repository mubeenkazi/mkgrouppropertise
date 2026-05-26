import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileCheck2, Handshake, Home, MapPin, Shield, TrendingUp } from "lucide-react";
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
import Seo from "@/lib/seo";
import { locationSeo } from "@/data/locationSeo";

const reviewSamples = [
  { name: "Sarah Mitchell", rating: 5, text: "Smooth process from browsing to purchase. The team was helpful at every step.", avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "David Chen", rating: 5, text: "Found the perfect lakeside plot. Photos and details were exactly as described.", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Amara Okafor", rating: 4, text: "Great selection and transparent pricing. Would highly recommend to investors.", avatar: "https://i.pravatar.cc/100?img=32" },
];

const services = [
  {
    icon: Home,
    title: "Land Sales",
    desc: "We sell carefully selected land and help people turn their dreams into reality. From a future home to a smart investment, we guide every buyer toward the right plot with confidence.",
  },
  {
    icon: Shield,
    title: "Verified Property Guidance",
    desc: "Our team checks important property details and shares clear information, so you can make decisions with peace of mind.",
  },
  {
    icon: FileCheck2,
    title: "Documentation Support",
    desc: "We assist with the purchase journey, including paperwork guidance, seller coordination, and the steps needed for a smooth deal.",
  },
  {
    icon: Handshake,
    title: "Buyer & Seller Connection",
    desc: "We connect genuine buyers with trusted sellers and keep the process simple, transparent, and respectful from first call to final discussion.",
  },
];

const propertyTypes = [
  "Residential plots",
  "NA plots",
  "Farmhouse land",
  "Commercial land",
  "Investment plots",
  "Coastal land",
  "Agricultural land",
  "Highway touch plots",
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
      <Seo
        title="Land for Sale in India | Buy Verified Plots & Investment Land | MK Group Properties"
        description="Buy verified land, plots, NA plots, farmhouse land, coastal land and investment properties across India with MK Group Properties."
        canonicalPath="/"
        keywords="land for sale in India, buy land in India, plots for sale India, NA plots Maharashtra, farmhouse land India, coastal land Konkan, investment land India"
      />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[640px] w-full overflow-hidden">
        <img src={heroImg} alt="Premium land for sale" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-[image:var(--gradient-overlay)]" />
        <div className="container relative z-10 flex min-h-[640px] flex-col justify-center py-20">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md ring-1 ring-white/20">
              <Shield className="h-3.5 w-3.5" /> Verified listings <span aria-hidden="true">&middot;</span> Trusted sellers
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Find Your <span className="bg-[image:var(--gradient-gold)] bg-clip-text text-transparent">Dream Land</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">
              Buy verified land, plots, NA plots, farmhouse land and investment properties across India with trusted guidance from MK Group Properties.
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

      {/* FEATURED */}
      <section className="container py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground sm:p-12">
            No lands listed yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => <PropertyCard key={l.id} land={l} />)}
          </div>
        )}
      </section>

      {/* CITY SEO */}
      <section className="container py-16">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Top Indian Locations</span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Land for Sale Across India</h2>
          <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
            Explore premium plots and investment land in Maharashtra, Goa, Mumbai, Pune, Dapoli and major Indian growth markets. MK Group Properties helps buyers, builders and long-term investors find verified land opportunities with clear guidance.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {locationSeo.slice(0, 8).map((c) => (
            <Link
              key={c.city}
              to={`/land-for-sale-in-${c.slug}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:border-primary hover:shadow-[var(--shadow-elegant)]"
            >
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary">Land for Sale in {c.city}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.intro}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                View {c.city} plots <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="container pb-16">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Property Search</span>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Buy verified land and plots in India</h2>
              <p className="mt-3 text-muted-foreground">
                Search land for sale in India by location, price and plot size. Our listings are built for buyers looking for residential plots, NA land, farmhouse plots, commercial land and long-term property investment opportunities.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {propertyTypes.map((type) => (
                <Link
                  key={type}
                  to="/lands"
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-secondary/50 py-20">
        <div className="container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Services</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">We sell land and help build dreams</h2>
            <p className="mt-3 text-muted-foreground">
              MK Group Properties brings together trusted land opportunities, honest guidance, and personal support for families, investors, and builders looking for the right place to begin their next chapter.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUY */}
      <section className="bg-secondary/50 py-20">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <img src={whyBuy} alt="Benefits of buying land" loading="lazy" width={1024} height={768} className="w-full rounded-2xl shadow-[var(--shadow-elegant)]" />
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
        <div className="overflow-hidden rounded-2xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-elegant)] sm:p-10 md:p-16">
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
