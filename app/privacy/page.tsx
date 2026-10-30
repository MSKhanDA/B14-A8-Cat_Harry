import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return <article className="page-width policy-page">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Back home</Link>
    <p className="eyebrow eyebrow-dark">YOUR INFORMATION, WITH CARE</p>
    <h1>A little about <em>privacy.</em></h1>
    <p className="policy-lead">StudioSpace uses account and booking details to help creators and hosts make plans together.</p>
    <section><h2>What you share</h2><p>Your name, email, optional profile photo, studio listings, and booking details are stored to provide the service. Passwords are stored as hashes, not readable text.</p></section>
    <section><h2>Who can see it</h2><p>Studio hosts can see the guest details needed to handle their booking requests. Guests can see the host and listing details shown on a studio page.</p></section>
    <section><h2>Secure sessions</h2><p>Signed-in sessions use an HTTP-only cookie. You can sign out from the navigation to end your current session.</p></section>
    <section><h2>Questions</h2><p>For privacy questions, contact <a href="mailto:hello@studiospace.com">hello@studiospace.com</a>.</p></section>
  </article>;
}
