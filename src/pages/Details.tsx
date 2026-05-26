import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Clipboard, Compass, Mail, MapPin, Maximize2, MessageCircle, Phone, PlayCircle, Route, Send, User as UserIcon, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Rating from "@/components/Rating";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { Land, Review, Seller, formatPrice, getYoutubeEmbedUrl, getYoutubeVideoId } from "@/types/db";
import { toast } from "sonner";
import { api } from "@/lib/api";

const DEFAULT_CONTACT_PHONE = "+919921552486";
const DEFAULT_CONTACT_EMAIL = "Mubeenkazi.mk@gmail.com";
const PUBLIC_SITE_URL = "https://mkgroupproperties.in";

const getAbsoluteUrl = (url: string | null | undefined) => {
  if (!url) return "";
  try {
    const origin = window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1")
      ? PUBLIC_SITE_URL
      : window.location.origin;
    return new URL(url, origin).href;
  } catch {
    return url;
  }
};

const getWhatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
};

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
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const l = await api<Land>(`/lands/${id}`, { auth: false }).catch(() => null);
      if (!l) { setLoading(false); return; }
      setLand(l);
      setVideoOpen(false);
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

  const pricePerSqft = Number(land.price_per_sqft ?? Number(land.price) / Math.max(1, land.square_feet));
  const plotHighlights = [
    { icon: MapPin, label: "Total price", value: formatPrice(Number(land.price)) },
    { icon: Maximize2, label: "Plot area", value: `${land.square_feet.toLocaleString()} sq ft` },
    { icon: Compass, label: "Per sq ft", value: formatPrice(pricePerSqft) },
    { icon: Route, label: "Road access", value: land.road_distance || "Ask for details" },
  ];
  const boundaryDetails = [
    { label: "Left side", value: land.boundary_left },
    { label: "Right side", value: land.boundary_right },
    { label: "Front side", value: land.boundary_front },
    { label: "Back side", value: land.boundary_back },
  ].filter((item) => item.value);
  const contactPhone = seller?.phone || DEFAULT_CONTACT_PHONE;
  const contactEmail = seller?.email || DEFAULT_CONTACT_EMAIL;
  const pageUrl = getAbsoluteUrl(`/lands/${land.id}`);
  const imageUrl = getAbsoluteUrl(land.image_url || land.gallery?.[0]);
  const productMessage = [
    "Hello MK Group Properties,",
    "",
    "I am interested in this land/property.",
    "",
    "Property Details:",
    `- Title: ${land.title}`,
    `- Location: ${land.location}`,
    `- Total Price: ${formatPrice(Number(land.price))}`,
    `- Plot Area: ${land.square_feet.toLocaleString()} sq ft`,
    `- Price per sq ft: ${formatPrice(pricePerSqft)}`,
    land.road_distance ? `- Road Access: ${land.road_distance}` : "",
    "",
    imageUrl ? `Property Image Link:` : "",
    imageUrl,
    "",
    `Property Details Link:`,
    pageUrl,
    "",
    "Please contact me.",
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/${getWhatsappNumber(contactPhone)}?text=${encodeURIComponent(productMessage)}`;
  const emailSubject = `Land enquiry: ${land.title}`;
  const emailUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(productMessage)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(productMessage)}`;
  const copyEmailMessage = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${contactEmail}\nSubject: ${emailSubject}\n\n${productMessage}`);
      toast.success("Email details copied");
    } catch {
      toast.error("Could not copy email details");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="container py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            {(() => {
              const embedUrl = getYoutubeEmbedUrl(land.video_url);
              const videoId = getYoutubeVideoId(land.video_url);
              const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
              if (embedUrl) {
                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <img
                      src={land.image_url || "/placeholder.svg"}
                      alt={land.title}
                      className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]"
                    />
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
                      {videoOpen ? (
                        <iframe
                          title={`${land.title} video`}
                          src={embedUrl}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setVideoOpen(true)}
                          className="group relative h-full w-full overflow-hidden text-left"
                          aria-label={`Play ${land.title} video`}
                        >
                          <img
                            src={videoThumbnail || land.image_url || "/placeholder.svg"}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
                          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                            <Video className="h-4 w-4 text-primary" />
                            Property video
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-[var(--shadow-elegant)] transition group-hover:scale-105">
                              <PlayCircle className="h-9 w-9" />
                            </span>
                          </div>
                          <div className="absolute bottom-5 left-5 right-5">
                            <p className="text-lg font-semibold text-white">Watch land overview</p>
                            <p className="mt-1 text-sm text-white/80">Clean preview with full property details.</p>
                          </div>
                        </button>
                      )}
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
              <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Product gallery</h2>
                  <span className="text-sm text-muted-foreground">{Math.min(land.gallery.length, 7)} photos</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {land.gallery.slice(0, 7).map((g, i) => (
                    <img
                      key={`${g}-${i}`}
                      src={g}
                      alt={`${land.title} gallery ${i + 1}`}
                      className={`w-full rounded-lg object-cover ${i === 0 ? "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto sm:h-full" : "aspect-square"}`}
                    />
                  ))}
                </div>
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

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Land overview</p>
                  <h2 className="text-xl font-bold text-foreground">Plot details</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Verified info</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {plotHighlights.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </div>
                    <p className="mt-2 break-words text-base font-bold text-foreground sm:text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="leading-relaxed text-foreground/80">{land.description}</p>

            {boundaryDetails.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Surroundings</p>
                  <h2 className="text-xl font-bold text-foreground">What is around this land?</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {boundaryDetails.map((item) => (
                    <div key={item.label} className="rounded-xl bg-secondary/60 p-4">
                      <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Contact for this property</p>
                <h2 className="text-xl font-bold text-foreground">Send product details instantly</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  WhatsApp or email us with this land's image, price, location and page link already included.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="brand" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={gmailUrl} target="_blank" rel="noreferrer">
                    <Send className="mr-2 h-4 w-4" /> Gmail
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={emailUrl}>
                    <Mail className="mr-2 h-4 w-4" /> Mail app
                  </a>
                </Button>
                <Button type="button" variant="outline" onClick={copyEmailMessage}>
                  <Clipboard className="mr-2 h-4 w-4" /> Copy email
                </Button>
              </div>
            </div>

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
                  {seller.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-primary" /><span className="break-all">{seller.email}</span></p>}
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
