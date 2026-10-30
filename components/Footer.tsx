import { Aperture, ArrowRight, Instagram, Youtube } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link className="brand footer-brand" href="/">
            <span className="brand-mark"><Aperture size={21} /></span>
            <span>studio<span className="brand-light">space</span><i>.</i></span>
          </Link>
          <p>Good work needs good space. We bring the creative community closer to the places that make ideas happen.</p>
          <div className="social-links">
            <a href="https://www.instagram.com" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="https://x.com" aria-label="X"><span className="x-social">𝕏</span></a>
            <a href="https://www.youtube.com" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
        <div className="footer-link-column">
          <h3>Discover</h3>
          <Link href="/studios">All spaces</Link>
          <Link href="/studios?category=Photo%20Studio">Photo studios</Link>
          <Link href="/studios?category=Podcast%20Room">Podcast rooms</Link>
          <Link href="/studios?category=Music%20Suite">Music suites</Link>
        </div>
        <div className="footer-link-column">
          <h3>Your space</h3>
          <Link href="/add-studio">List a studio</Link>
          <Link href="/my-listings">Manage listings</Link>
          <Link href="/my-bookings">Your bookings</Link>
          <a href="mailto:hello@studiospace.com">Get in touch</a>
        </div>
        <div className="footer-newsletter">
          <h3>Good things, occasionally.</h3>
          <p>Studio finds, creative stories, and a little inspiration for your next project.</p>
          <form action="mailto:hello@studiospace.com" method="get" className="newsletter-form">
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <input id="newsletter-email" name="subject" type="email" placeholder="Your email address" required />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={17} /></button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} StudioSpace. Made for the makers.</span>
        <div><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><span>Find your frequency.</span></div>
      </div>
    </footer>
  );
}
