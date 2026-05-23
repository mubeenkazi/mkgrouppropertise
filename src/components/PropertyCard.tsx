import { Link } from "react-router-dom";
import { MapPin, Maximize2, Star } from "lucide-react";
import { Land, formatPrice } from "@/types/db";
import placeholder from "@/assets/hero.jpg";

const PropertyCard = ({ land }: { land: Land }) => (
  <Link
    to={`/lands/${land.id}`}
    className="group block overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
  >
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={land.image_url || placeholder}
        alt={land.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
        {formatPrice(Number(land.price))}
      </div>
      {land.featured && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[image:var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-accent-foreground shadow">
          <Star className="h-3 w-3 fill-current" /> Featured
        </div>
      )}
    </div>
    <div className="space-y-2 p-5">
      <h3 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">{land.title}</h3>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" /> <span className="line-clamp-1">{land.location}</span>
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Maximize2 className="h-4 w-4" /> {land.square_feet.toLocaleString()} sq ft
        </div>
        <div className="text-sm font-medium text-primary">View details →</div>
      </div>
    </div>
  </Link>
);

export default PropertyCard;
