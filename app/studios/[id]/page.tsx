"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, Clock3, MapPin, ShieldCheck, Star, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { api, type Studio } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function StudioDetails() {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api<{ studio: Studio }>(`/studios/${id}`)
      .then((result) => setStudio(result.studio))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load this studio."))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startsAt || !endsAt) return;
    setBooking(true);
    try {
      await api("/bookings", { method: "POST", body: JSON.stringify({ studioId: id, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() }) });
      toast.success("Your booking request is on its way. The host will be in touch.");
      setBookOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not request this booking.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <div className="page-loading"><span className="loader-ring" />Finding the details...</div>;
  if (!studio) return <div className="empty-state detail-not-found"><p className="eyebrow eyebrow-dark">THIS ONE GOT AWAY</p><h2>Studio not found.</h2><p>It might have moved or been taken off the map.</p><Link className="button button-dark" href="/studios"><ArrowLeft size={15} /> Explore other spaces</Link></div>;

  const isHost = user?.email === studio.ownerEmail;

  return (
    <div className="detail-page">
      <div className="page-width">
        <Link className="back-link detail-back" href="/studios"><ArrowLeft size={15} /> All spaces</Link>
        <div className="detail-title-row"><div><p className="eyebrow eyebrow-dark">{studio.category} <span className="eyebrow-divider">/</span> {studio.location}</p><h1>{studio.title}</h1><p className="detail-meta"><span><MapPin size={15} />{studio.location}</span><span><Star size={15} fill="currentColor" />{studio.rating?.toFixed(1) ?? "4.8"} <small>({studio.reviewCount ?? 0} reviews)</small></span><span><Users size={15} />Up to {studio.maxCapacity} people</span></p></div><div className="detail-price"><strong>${studio.hourlyRate}</strong><span> / hour</span></div></div>
        <div className="detail-hero-image" style={{ backgroundImage: `url("${studio.imageUrl}")` }}><span className="detail-image-caption"><span className="eyebrow-dot" /> A SPACE WITH ROOM TO MAKE</span></div>
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <p className="eyebrow eyebrow-dark">THE SPACE</p><h2>A good place to <em>begin.</em></h2>
              <p className="detail-overview">{studio.overview}</p>
            </section>
            <section className="detail-section amenities-section"><p className="eyebrow eyebrow-dark">WHAT YOU’LL FIND</p><h2>Thoughtful <em>details.</em></h2>
              <div className="detail-amenities">{studio.amenities?.length ? studio.amenities.map((amenity) => <span key={amenity}><Check size={15} />{amenity}</span>) : <span><Check size={15} />A welcoming creative space</span>}</div>
            </section>
            <section className="host-card">
              <div className="host-avatar">{studio.ownerPhoto ? <img src={studio.ownerPhoto} alt="" /> : studio.ownerName?.charAt(0).toUpperCase()}</div>
              <div><p className="eyebrow eyebrow-dark">YOUR HOST</p><h3>{studio.ownerName} <BadgeCheck size={16} /></h3><span>Creative host on StudioSpace</span></div>
              <div className="host-response"><ShieldCheck size={20} /><span>Thoughtful spaces.<br />Good people.</span></div>
            </section>
          </div>
          <aside className="booking-card">
            <p className="eyebrow eyebrow-dark">MAKE IT YOURS</p><h3>Ready when <em>you are.</em></h3>
            <div className="booking-price"><strong>${studio.hourlyRate}</strong><span> / hour</span></div>
            <div className="booking-info"><span><Clock3 size={16} /> Flexible booking hours</span><span><Users size={16} /> Up to {studio.maxCapacity} people</span>{studio.securityDeposit > 0 && <span><ShieldCheck size={16} /> ${studio.securityDeposit} refundable deposit</span>}</div>
            {isHost ? <Link className="button button-outline booking-button" href={`/studios/edit/${studio._id}`}>Manage your listing <ArrowRight size={16} /></Link> :
              <RequireAuth><button className="button button-dark booking-button" onClick={() => setBookOpen(true)}>Book this space <ArrowRight size={16} /></button></RequireAuth>}
            <p className="booking-card-note"><ShieldCheck size={14} /> Your booking starts as a request. No charge until confirmed.</p>
          </aside>
        </div>
      </div>
      {bookOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookOpen(false); }}>
        <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
          <button className="modal-close" aria-label="Close booking dialog" onClick={() => setBookOpen(false)}><X size={19} /></button>
          <span className="modal-icon"><CalendarDays size={21} /></span><p className="eyebrow eyebrow-dark">MAKE A LITTLE ROOM</p><h2 id="booking-modal-title">Book your <em>session.</em></h2>
          <p className="modal-subtitle">{studio.title} · ${studio.hourlyRate}/hour</p>
          <form className="form-stack" onSubmit={submitBooking}>
            <label className="field-label">Starts<input className="text-input" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} min={new Date().toISOString().slice(0, 16)} required /></label>
            <label className="field-label">Ends<input className="text-input" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} min={startsAt || new Date().toISOString().slice(0, 16)} required /></label>
            <button className="button button-dark auth-submit" type="submit" disabled={booking}>{booking ? "Sending request..." : "Request to book"}<ArrowRight size={16} /></button>
          </form>
          <p className="booking-card-note"><ShieldCheck size={14} /> No charge until your host confirms.</p>
        </div>
      </div>}
    </div>
  );
}

export default function StudioDetailPage() {
  return <StudioDetails />;
}
