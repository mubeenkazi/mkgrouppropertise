import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Mail, MapPin, Maximize2, Phone, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Rating from "@/components/Rating";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Land, Review, Seller, formatPrice, getYoutubeEmbedUrl } from "@/types/db";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState<Land | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const l = await api<Land>(`/lands/${id}`, { auth: false }).catch(() => null);
      if (!l) { setLoading(false); return; }
      setLand(l);
      if (l.seller_id) {
        const s = await api<Seller>(`/sellers/${l.seller_id}`, { auth: false }).catch(() => null);
        setSeller(s);
      }
      const r = await api<Review[]>(`/lands/${id}/reviews`, { auth: false });
      setReviews(r ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-20 text-center text-muted-foreground">Loading...</div></div>;
  if (!land) return <Navigate to="/lands" replace />;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/auth?mode=login&redirect=/lands/${id}`);
      return;
    }
    if (!reviewText.trim()) return toast.error("Please write a review");
    try {
      await api(`/lands/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, text: reviewText.trim() }),
      });
    } catch (error) {
      return toast.error(error instanceof Error ? error.message : "Review failed");
    }
    toast.success("Review posted");
    setReviewText("");
    setRating(5);
    const r = await api<Review[]>(`/lands/${id}/reviews`, { auth: false });
    setReviews(r ?? []);
  };

  const mapSrc =
    land.latitude && land.longitude
      ? `https://www.google.com/maps?q=${land.latitude},${land.longitude}&z=14&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(land.location)}&z=13&output=embed`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="container py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            {(() => {
              const embedUrl = getYoutubeEmbedUrl(land.video_url);
              if (embedUrl) {
                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <img
                      src={land.image_url || "/placeholder.svg"}
                      alt={land.title}
                      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]"
                    />
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)]">
                      <iframe
                        title={`${land.title} video`}
                        src={embedUrl}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }
              return (
                <img
                  src={land.image_url || "/placeholder.svg"}
                  alt={land.title}
                  className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]"
                />
              );
            })()}
            {land.gallery && land.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {land.gallery.slice(0, 4).map((g, i) => (
                  <img key={i} src={g} alt="" className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{land.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {land.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-5">
              <div>
                <p className="text-xs text-muted-foreground">Total price</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(Number(land.price))}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Square feet</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                  <Maximize2 className="h-5 w-5" />
                  {land.square_feet.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price per sq ft</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatPrice(Number(land.price_per_sqft ?? Number(land.price) / Math.max(1, land.square_feet)))}
                </p>
              </div>
            </div>

            <p className="leading-relaxed text-foreground/80">{land.description}</p>

            {land.nearby_places && land.nearby_places.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Nearby</h3>
                <div className="flex flex-wrap gap-2">
                  {land.nearby_places.map((p) => (
                    <span key={p} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {seller && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Seller</h2>
                <div className="flex items-center gap-3">
                  {seller.photo_url ? (
                    <img src={seller.photo_url} alt={seller.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{seller.name}</p>
                    {seller.rating != null && <Rating value={Number(seller.rating)} />}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {seller.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{seller.phone}</p>}
                  {seller.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{seller.email}</p>}
                </div>
                {user ? (
                  seller.phone && (
                    <Button variant="brand" className="mt-4 w-full" asChild>
                      <a href={`tel:${seller.phone}`}>Call seller</a>
                    </Button>
                  )
                ) : (
                  <Button variant="brand" className="mt-4 w-full" onClick={() => navigate(`/auth?mode=login&redirect=/lands/${id}`)}>
                    Log in to contact seller
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MAP */}
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Location</h2>
          <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <iframe
              title="map"
              src={mapSrc}
              width="100%"
              height="400"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full"
            />
          </div>
        </section>

        {/* REVIEWS */}
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Reviews</h2>
          {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet. Be the first!</p>}
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  {r.author_avatar ? (
                    <img src={r.author_avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{r.author_name || "Anonymous"}</div>
                    <Rating value={r.rating} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground/80">{r.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={submitReview} className="mt-6 rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Leave a review</h3>
            <div>
              <Label>Rating</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl" aria-label={`${n} stars`}>
                    <span className={n <= rating ? "text-[hsl(var(--gold))]" : "text-muted-foreground/40"}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review">Your review</Label>
              <Textarea id="review" rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={1000} />
            </div>
            <Button type="submit" variant="brand">{user ? "Post review" : "Log in to review"}</Button>
          </form>
        </section>
      </article>
      <Footer />
    </div>
  );
};

export default Details;
