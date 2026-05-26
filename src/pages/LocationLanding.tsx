import { Navigate, Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileSearch, MapPin, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar, { emptyFilters, SearchFilters } from "@/components/SearchBar";
import Seo from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { locationBySlug } from "@/data/locationSeo";
import { useState } from "react";

const LocationLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = slug ? locationBySlug[slug] : null;
  const [filters, setFilters] = useState<SearchFilters>({
    ...emptyFilters,
    location: location?.city ?? "",
  });

  if (!location) return <Navigate to="/lands" replace />;

  const title = `Land for Sale in ${location.city} | Verified Plots & Investment Land`;
  const description = `Find verified land for sale in ${location.city}, including residential plots, NA plots, farmhouse land and investment land with MK Group Properties.`;
  const canonicalPath = `/land-for-sale-in-${location.slug}`;
  const landsUrl = `/lands?location=${encodeURIComponent(location.city)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How can I find verified land for sale in ${location.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Use MK Group Properties to browse land and plot opportunities in ${location.city}. Check location, price, road access, surrounding details, seller information and documents before finalizing any purchase.`,
        },
      },
      {
        "@type": "Question",
        name: `What types of plots are available in ${location.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${location.city} buyers commonly search for ${location.popularFor.join(", ")}.`,
        },
      },
      {
        "@type": "Question",
        name: "What should I verify before buying land in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Before buying land, verify title, ownership, survey details, access road, zoning, NA status where applicable, taxes, encumbrances and all legal documents with independent professional guidance.",
        },
      },
    ],
  };

  const submitSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/lands?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        keywords={`${location.buyerIntent.join(", ")}, land for sale in India, verified plots, MK Group Properties`}
        schema={schema}
      />
      <Navbar />
      <main>
        <section className="bg-secondary/50 py-14 sm:py-20">
          <div className="container">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4" /> {location.region}
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                Land for Sale in {location.city}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {location.intro}
              </p>
              <div className="mt-8 max-w-3xl">
                <SearchBar filters={filters} onChange={setFilters} onSubmit={submitSearch} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="brand" asChild>
                  <Link to={landsUrl}>View {location.city} Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Talk to MK Group</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-2xl font-bold text-foreground">Why buyers search land in {location.city}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  People searching for land in {location.city} usually want clear pricing, practical road access, reliable seller details and confidence that the property is suitable for residential, commercial, farmhouse or long-term investment use. MK Group Properties focuses on simple listing information, transparent enquiry support and location-led guidance so buyers can shortlist land with less confusion.
                </p>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-2xl font-bold text-foreground">Important checks before buying a plot</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    "Ownership and title documents",
                    "Survey number and land measurement",
                    "Road access and surrounding boundaries",
                    "NA permission or zoning where needed",
                    "Water, electricity and approach route",
                    "Encumbrance, tax and legal verification",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-xl bg-secondary/60 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Popular searches</h2>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {location.buyerIntent.map((term) => (
                    <Link key={term} to={`/lands?location=${encodeURIComponent(location.city)}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition hover:border-primary hover:text-primary">
                      {term}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <FileSearch className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Best suited for</h2>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {location.popularFor.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-xl font-bold text-foreground">Nearby search areas</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {location.nearby.map((item) => (
                    <span key={item} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">{item}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="container pb-16">
          <div className="rounded-2xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground shadow-[var(--shadow-elegant)] sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to explore land in {location.city}?</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/90">
              Browse current listings, compare locations and contact MK Group Properties for practical guidance before your site visit or purchase discussion.
            </p>
            <Button className="mt-6" variant="secondary" asChild>
              <Link to={landsUrl}>Browse {location.city} Land</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LocationLanding;
