import { Aperture, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return <section className="not-found-page">
    <div className="not-found-art"><Aperture size={76} strokeWidth={1.1} /><strong>404</strong></div>
    <p className="eyebrow eyebrow-dark">WELL, THIS IS A LITTLE OFF-SCRIPT</p>
    <h1>Wrong <em>room.</em></h1>
    <p>We couldn’t find the space you were looking for. No worries — there are plenty more where that came from.</p>
    <Link className="button button-dark" href="/"><ArrowLeft size={15} /> Return to home</Link>
  </section>;
}
