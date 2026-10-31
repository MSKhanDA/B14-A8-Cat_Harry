"use client";

import { ArrowRight, CalendarDays, Check, Clock3, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { api, type Booking } from "@/lib/api";

function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function MyBookingsContent() {
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  const [hostBookings, setHostBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [guestResult, hostResult] = await Promise.all([
        api<{ bookings: Booking[] }>("/my-bookings"),
        api<{ bookings: Booking[] }>("/host-bookings"),
      ]);
      setGuestBookings(guestResult.bookings);
      setHostBookings(hostResult.bookings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(booking: Booking, status: "Confirmed" | "Cancelled" | "Completed") {
    try {
      await api(`/bookings/${booking._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(status === "Confirmed" ? "Booking confirmed. Let the good work begin." : status === "Completed" ? "Session marked complete. Your guest can now leave a review." : "Booking request declined.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this booking.");
    }
  }

  async function cancelBooking(booking: Booking) {
    try {
      await api(`/bookings/${booking._id}/cancel`, { method: "PATCH" });
      toast.success("Your booking request has been cancelled.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel this booking.");
    }
  }

  function bookingCard(booking: Booking, host = false) {
    return <article className="booking-row" key={`${host ? "host" : "guest"}-${booking._id}`}>
      <div className="booking-row-image" style={{ backgroundImage: `url("${booking.studioImage}")` }} />
      <div className="booking-row-info"><span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span><h3><Link href={`/studios/${booking.studioId}`}>{booking.studioTitle}</Link></h3><span><CalendarDays size={14} />{formatBookingDate(booking.startsAt)}</span><span><Clock3 size={14} />{booking.hours} {booking.hours === 1 ? "hour" : "hours"} · Ends {formatBookingDate(booking.endsAt)}</span>{host && <span className="booking-guest">Request from {booking.guestName} · {booking.guestEmail}</span>}</div>
      <div className="booking-row-total"><span>Total</span><strong>${booking.total.toFixed(2)}</strong></div>
      {host && booking.status === "Pending" ? <div className="booking-row-actions"><button className="icon-action confirm-action" title="Confirm request" onClick={() => void updateStatus(booking, "Confirmed")}><Check size={17} /></button><button className="icon-action danger-action" title="Decline request" onClick={() => void updateStatus(booking, "Cancelled")}><X size={17} /></button></div> :
        host && booking.status === "Confirmed" && new Date(booking.endsAt).getTime() <= Date.now() ? <button className="icon-action confirm-action" title="Mark session complete" aria-label="Mark session complete" onClick={() => void updateStatus(booking, "Completed")}><Check size={17} /></button> :
        !host && booking.status === "Pending" ? <button className="button button-outline button-small" onClick={() => void cancelBooking(booking)}>Cancel request</button> : null}
    </article>;
  }

  const requests = hostBookings.filter((booking) => booking.status === "Pending" || booking.status === "Confirmed");

  return <div className="page-width dashboard-page">
    <div className="dashboard-header"><div><p className="eyebrow eyebrow-dark">IT’S ALL COMING TOGETHER</p><h1>Your <em>sessions.</em></h1><p>Your plans, your spaces, and a little room to make.</p></div><Link className="button button-dark" href="/studios">Find a space <ArrowRight size={16} /></Link></div>
    {loading ? <div className="dashboard-skeletons">{[1, 2].map((i) => <div className="dashboard-skeleton" key={i} />)}</div> : <div className="booking-sections">
      <section className="dashboard-section"><div className="dashboard-section-heading"><div><p className="eyebrow eyebrow-dark">YOUR PLANS</p><h2>Booking <em>requests.</em></h2></div><span className="count-badge">{guestBookings.length}</span></div>
        {guestBookings.length ? <div className="booking-list">{guestBookings.map((booking) => bookingCard(booking))}</div> : <div className="mini-empty"><p>No sessions on the calendar yet.</p><Link href="/studios">Find your first space <ArrowRight size={14} /></Link></div>}
      </section>
      <section className="dashboard-section"><div className="dashboard-section-heading"><div><p className="eyebrow eyebrow-dark">YOUR INBOX</p><h2>Host <em>requests.</em></h2></div><span className="count-badge">{requests.length}</span></div>
        {requests.length ? <div className="booking-list">{requests.map((booking) => bookingCard(booking, true))}</div> : <div className="mini-empty"><p>No booking requests for your spaces right now.</p><Link href="/my-listings">Check your listings <ArrowRight size={14} /></Link></div>}
      </section>
    </div>}
  </div>;
}

export default function MyBookingsPage() {
  return <RequireAuth><MyBookingsContent /></RequireAuth>;
}
