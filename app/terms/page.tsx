import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return <article className="page-width policy-page">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Back home</Link>
    <p className="eyebrow eyebrow-dark">THE SHORT VERSION</p>
    <h1>A few good <em>ground rules.</em></h1>
    <p className="policy-lead">StudioSpace connects creative people with independent studio hosts. Please treat each other and each space with care.</p>
    <section><h2>Bookings</h2><p>A booking is a request until the host confirms it. Confirmed times are reserved for that booking; guests and hosts should coordinate any changes through the people involved.</p></section>
    <section><h2>Listings</h2><p>Hosts are responsible for accurate space details, images, pricing, availability, and any rules that apply to their space. Only list a space you are authorized to offer.</p></section>
    <section><h2>Using a space</h2><p>Guests agree to follow the host’s reasonable instructions, respect the stated capacity and amenities, and leave the space in good condition.</p></section>
    <section><h2>Questions</h2><p>For help with the site, contact <a href="mailto:hello@studiospace.com">hello@studiospace.com</a>.</p></section>
  </article>;
}
