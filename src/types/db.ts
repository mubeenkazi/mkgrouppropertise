// Shared domain types for the real estate app
export type Seller = {
  id: string;
  name: string;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  rating: number | null;
};

export type Land = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  gallery: string[] | null;
  price: number;
  square_feet: number;
  price_per_sqft: number | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  nearby_places: string[] | null;
  boundary_left: string | null;
  boundary_right: string | null;
  boundary_front: string | null;
  boundary_back: string | null;
  road_distance: string | null;
  featured: boolean | null;
  seller_id: string | null;
  video_url?: string | null;
  seller?: Seller | null;
};

export const getYoutubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
};

export const getYoutubeEmbedUrl = (url: string | null | undefined): string | null => {
  const id = getYoutubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
};

export type Review = {
  id: string;
  land_id: string | null;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
