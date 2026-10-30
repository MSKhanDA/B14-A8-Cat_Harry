import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Link from "next/link";
import type { Studio } from "@/lib/api";

export function StudioCard({ studio, index = 0 }: { studio: Studio; index?: number }) {
  return (
    <article className={`studio-card reveal reveal-delay-${Math.min(index % 3 + 1, 3)}`}>
      <Link href={`/studios/${studio._id}`} className="studio-card-image-link" aria-label={`View ${studio.title}`}>
        <div className="studio-card-image" style={{ backgroundImage: `url("${studio.imageUrl}")` }}>
          <span className="category-pill">{studio.category}</span>
          <span className="rating-pill"><Star size={13} fill="currentColor" /> {studio.rating?.toFixed(1) ?? "4.8"}</span>
        </div>
      </Link>
      <div className="studio-card-content">
        <div className="studio-card-location"><MapPin size={14} /> <span>{studio.location}</span></div>
        <Link className="studio-card-title" href={`/studios/${studio._id}`}>{studio.title}</Link>
        <div className="studio-card-bottom">
          <span className="studio-card-reviews">{studio.reviewCount ? `${studio.reviewCount} reviews` : "A creator favorite"}</span>
          <span className="studio-price"><strong>${studio.hourlyRate}</strong> / hr</span>
        </div>
      </div>
      <Link className="studio-card-arrow" href={`/studios/${studio._id}`} aria-label={`View ${studio.title}`}><ArrowUpRight size={17} /></Link>
    </article>
  );
}
