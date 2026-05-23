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
  featured: boolean | null;
  seller_id: string | null;
  video_url?: string | null;
  seller?: Seller | null;
};

export const getYoutubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    else id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
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
