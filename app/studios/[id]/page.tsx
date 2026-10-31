"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, MapPin, ShieldCheck, Star, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { api, type Booking, type Review, type Studio } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function StudioDetails() {
  const { id } = useParams<{ id: string }>();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [booking, setBooking] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewBookingId, setReviewBookingId] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setStudio(null);
    setReviews([]);
    setActiveImage(0);
    setReviewBookingId("");
    api<{ studio: Studio }>(`/studios/${id}`)
      .then((result) => setStudio(result.studio))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load this studio."))
      .finally(() => setLoading(false));
    api<{ reviews: Review[] }>(`/studios/${id}/reviews`)
      .then((result) => setReviews(result.reviews))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load studio reviews."));
  }, [id]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    api<{ bookings: Booking[] }>("/my-bookings")
      .then((result) => setBookings(result.bookings))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load your bookings."));
  }, [user]);

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

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewBookingId || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const { review } = await api<{ review: Review }>(`/studios/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ bookingId: reviewBookingId, rating: Number(reviewRating), comment: reviewComment }),
      });
      setReviews((current) => [review, ...current]);
      setStudio((current) => current ? {
        ...current,
        rating: (current.rating * current.reviewCount + review.rating) / (current.reviewCount + 1),
        reviewCount: current.reviewCount + 1,
      } : current);
      setReviewBookingId("");
      setReviewComment("");
      toast.success("Thanks for sharing your experience.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="page-loading"><span className="loader-ring" />Finding the details...</div>;
  if (!studio) return <div className="empty-state detail-not-found"><p className="eyebrow eyebrow-dark">THIS ONE GOT AWAY</p><h2>Studio not found.</h2><p>It might have moved or been taken off the map.</p><Link className="button button-dark" href="/studios"><ArrowLeft size={15} /> Explore other spaces</Link></div>;

  const isHost = user?.email === studio.ownerEmail;
  const images = [studio.imageUrl, ...(studio.galleryImages ?? [])].filter((image, index, list) => Boolean(image) && list.indexOf(image) === index);
  const reviewableBookings = bookings.filter((item) =>
    item.studioId === studio._id &&
    item.status === "Completed" &&
    !reviews.some((review) => review.bookingId === item._id),
  );

  return (
    <div className="detail-page">
      <div className="page-width">
        <Link className="back-link detail-back" href="/studios"><ArrowLeft size={15} /> All spaces</Link>
        <div className="detail-title-row"><div><p className="eyebrow eyebrow-dark">{studio.category} <span className="eyebrow-divider">/</span> {studio.location}</p><h1>{studio.title}</h1><p className="detail-meta"><span><MapPin size={15} />{studio.location}</span><span>{studio.reviewCount > 0 ? <><Star size={15} fill="currentColor" />{studio.rating.toFixed(1)} <small>({studio.reviewCount} {studio.reviewCount === 1 ? "review" : "reviews"})</small></> : <>New space <small>· No reviews yet</small></>}</span><span><Users size={15} />Up to {studio.maxCapacity} people</span></p></div><div className="detail-price"><strong>${studio.hourlyRate}</strong><span> / hour</span></div></div>
        <div className="detail-gallery" role="region" aria-label="Studio photo gallery" aria-roledescription="carousel">
          <div className="detail-hero-image" style={{ backgroundImage: `url("${images[activeImage]}")` }} aria-label={`Studio photo ${activeImage + 1} of ${images.length}`} />
          <span className="detail-image-caption"><span className="eyebrow-dot" /> A SPACE WITH ROOM TO MAKE</span>
          {images.length > 1 && <>
            <button type="button" className="gallery-arrow gallery-previous" aria-label="Previous photo" onClick={() => setActiveImage((current) => (current - 1 + images.length) % images.length)}><ChevronLeft size={20} /></button>
            <button type="button" className="gallery-arrow gallery-next" aria-label="Next photo" onClick={() => setActiveImage((current) => (current + 1) % images.length)}><ChevronRight size={20} /></button>
            <span className="gallery-count">{activeImage + 1} / {images.length}</span>
          </>}
        </div>
        <div className="detail-layout">
          <div className="detail-main">
            <section className="detail-section">
              <p className="eyebrow eyebrow-dark">THE SPACE</p><h2>A good place to <em>begin.</em></h2>
              <p className="detail-overview">{studio.overview}</p>
            </section>
            <section className="detail-section amenities-section"><p className="eyebrow eyebrow-dark">WHAT YOU’LL FIND</p><h2>Thoughtful <em>details.</em></h2>
              <div className="detail-amenities">{studio.amenities?.length ? studio.amenities.map((amenity) => <span key={amenity}><Check size={15} />{amenity}</span>) : <span><Check size={15} />A welcoming creative space</span>}</div>
            </section>
            <section className="detail-section review-section">
              <p className="eyebrow eyebrow-dark">FROM THE CREATIVE COMMUNITY</p>
              <div className="review-heading"><h2>Good words <em>from guests.</em></h2><span className="review-summary">{studio.reviewCount > 0 ? <><Star size={15} fill="currentColor" /> {studio.rating.toFixed(1)} · {studio.reviewCount}</> : "No reviews yet"}</span></div>
              {reviewableBookings.length > 0 && <form className="review-form" onSubmit={submitReview}>
                <h3>How was your session?</h3>
                <div className="field-grid review-fields">
                  <label className="field-label">Completed booking<select className="text-input" value={reviewBookingId} onChange={(event) => setReviewBookingId(event.target.value)} required><option value="">Choose a session</option>{reviewableBookings.map((item) => <option key={item._id} value={item._id}>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.startsAt))}</option>)}</select></label>
                  <label className="field-label">Rating<select className="text-input" value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}</select></label>
                </div>
                <label className="field-label">Your review<textarea className="text-input text-area" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} minLength={10} maxLength={1200} rows={3} placeholder="What should other creators know about this space?" required /></label>
                <button className="button button-dark button-small" type="submit" disabled={submittingReview}>{submittingReview ? "Sharing..." : "Share your review"}<ArrowRight size={15} /></button>
              </form>}
              {reviews.length > 0 ? <div className="review-list">{reviews.map((review) => <article className="review-card" key={review._id}>
                <div className="review-avatar">{review.guestPhoto ? <img src={review.guestPhoto} alt="" /> : review.guestName.charAt(0).toUpperCase()}</div>
                <div className="review-content"><div className="review-card-heading"><strong>{review.guestName}</strong><span>{new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(review.createdAt))}</span></div><span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: review.rating }, (_, index) => <Star key={index} size={13} fill="currentColor" />)}</span><p>{review.comment}</p></div>
              </article>)}</div> : <p className="review-empty">Be the first to share what it’s like to create here. Reviews are available after a completed booking.</p>}
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
