"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Aperture, Camera, Headphones, Mic2, Music2, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudioCard } from "@/components/StudioCard";
import { api, type Studio } from "@/lib/api";

const slides = [
  {
    eyebrow: "YOUR NEXT IDEA STARTS HERE",
    title: <>Space to<br /><span>make something</span><br />matter.</>,
    copy: "The perfect light. The right sound. A place that just gets it. Find your creative home for the day.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=88",
  },
  {
    eyebrow: "MADE FOR THE MAKING",
    title: <>A little room<br />for your <span>big</span><br />ideas.</>,
    copy: "From first takes to final frames, find the kind of space that makes the work feel effortless.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=88",
  },
  {
    eyebrow: "GOOD WORK NEEDS GOOD SPACE",
    title: <>Find your<br /><span>creative</span><br />somewhere.</>,
    copy: "Thoughtful studios, one-of-a-kind sets, and welcoming hosts. Your next great session is closer than you think.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=2400&q=88",
  },
];

const categories = [
  { title: "Photo studios", value: "Photo Studio", icon: Camera, image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=82", count: "For every frame" },
  { title: "Film stages", value: "Film Stage", icon: Aperture, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=82", count: "Set the scene" },
  { title: "Podcast rooms", value: "Podcast Room", icon: Mic2, image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=82", count: "Sound like you" },
  { title: "Music suites", value: "Music Suite", icon: Music2, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=82", count: "Turn it up" },
  { title: "Art workshops", value: "Art Workshop", icon: Palette, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=82", count: "Make a mess" },
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 6500);
    api<{ studios: Studio[] }>("/studios/featured")
      .then((result) => setStudios(result.studios))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load studio spaces."))
      .finally(() => setLoading(false));
    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[slide];

  return (
    <>
      <section className="hero">
        <div className="hero-image" style={{ backgroundImage: `url("${activeSlide.image}")` }} />
        <div className="hero-shade" />
        <div className="hero-content page-width">
          <div className="hero-copy" key={slide}>
            <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" />{activeSlide.eyebrow}</p>
            <h1>{activeSlide.title}</h1>
            <p className="hero-description">{activeSlide.copy}</p>
            <div className="hero-actions">
              <Link className="button button-lime" href="/studios">Explore studios <ArrowRight size={17} /></Link>
              <Link className="hero-host-link" href="/add-studio">Host your space <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          <div className="hero-bottom">
            <a className="scroll-cue" href="#featured"><span className="scroll-cue-icon"><ArrowDown size={15} /></span> SCROLL TO EXPLORE</a>
            <div className="hero-slide-nav">
              <span className="slide-current">0{slide + 1}</span><div className="slide-track"><span style={{ width: `${((slide + 1) / slides.length) * 100}%` }} /></div><span>0{slides.length}</span>
              <div className="slide-dots">{slides.map((item, index) => <button key={item.eyebrow} aria-label={`Show slide ${index + 1}`} className={index === slide ? "slide-dot active" : "slide-dot"} onClick={() => setSlide(index)} />)}</div>
            </div>
          </div>
        </div>
        <div className="hero-side-note">A PLACE FOR EVERY KIND OF MAKING <span>·</span> 01—03</div>
      </section>

      <section className="intro-strip">
        <div className="intro-strip-inner page-width">
          <span className="intro-kicker">A CREATIVE COMMUNITY, BY DESIGN</span>
          <p>For the first take, the fresh idea, and everything <em>in between.</em></p>
          <span className="intro-mark"><Aperture size={26} /></span>
        </div>
      </section>

      <section className="section section-featured page-width" id="featured">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow-dark">GOOD SPACES, GOOD PEOPLE</p><h2>Places with a point <em>of view.</em></h2></div>
          <Link className="text-link" href="/studios">Explore all spaces <ArrowUpRight size={16} /></Link>
        </div>
        {loading ? <div className="studio-grid">{[1, 2, 3].map((item) => <div className="studio-skeleton" key={item}><div /><span /><i /></div>)}</div> :
          studios.length > 0 ? <div className="studio-grid">{studios.slice(0, 3).map((studio, index) => <StudioCard key={studio._id} studio={studio} index={index} />)}</div> :
            <div className="empty-featured"><span className="empty-icon"><Sparkles size={22} /></span><div><h3>Your next favorite studio is out there.</h3><p>We’re getting the spaces ready. Be the first to share yours.</p></div><Link className="button button-outline" href="/add-studio">List a space <ArrowRight size={16} /></Link></div>}
      </section>

      <section className="section section-categories">
        <div className="page-width">
          <div className="section-heading category-heading">
            <div><p className="eyebrow eyebrow-dark">WHAT ARE YOU MAKING?</p><h2>Find your kind <em>of space.</em></h2></div>
            <p className="section-heading-aside">Every great project has a place where it begins. Make this one yours.</p>
          </div>
          <div className="category-grid">
            {categories.map(({ title, value, icon: Icon, image, count }, index) => (
              <Link className={`category-card category-card-${index + 1}`} href={`/studios?category=${encodeURIComponent(value)}`} key={title}>
                <div className="category-card-image" style={{ backgroundImage: `url("${image}")` }} />
                <div className="category-card-shade" />
                <span className="category-card-icon"><Icon size={18} /></span>
                <span className="category-card-copy"><small>{count}</small><strong>{title}</strong></span>
                <span className="category-card-arrow"><ArrowUpRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section how-section" id="how-it-works">
        <div className="page-width how-layout">
          <div className="how-intro">
            <p className="eyebrow eyebrow-dark">LESS SCROLLING, MORE MAKING</p>
            <h2>Getting to<br />the good part<br /><em>is easy.</em></h2>
            <p>We believe finding your next creative home should feel as good as making something in it.</p>
            <Link className="text-link" href="/studios">Find your space <ArrowUpRight size={16} /></Link>
          </div>
          <div className="how-steps">
            <div className="how-step"><span className="step-number">01</span><div className="step-icon"><Camera size={19} /></div><div><h3>Find your fit</h3><p>Search one-of-a-kind spaces by city, category, or the thing you can’t wait to make.</p></div><span className="step-line" /></div>
            <div className="how-step"><span className="step-number">02</span><div className="step-icon"><Headphones size={19} /></div><div><h3>Meet your match</h3><p>Get the details, see the amenities, and connect with hosts who know their space.</p></div><span className="step-line" /></div>
            <div className="how-step"><span className="step-number">03</span><div className="step-icon"><Sparkles size={19} /></div><div><h3>Make it happen</h3><p>Book your hours, bring your idea, and leave the space a little more inspired.</p></div><span className="step-line" /></div>
          </div>
        </div>
      </section>

      <section className="host-cta">
        <div className="host-cta-image" />
        <div className="host-cta-overlay" />
        <div className="host-cta-content page-width">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR SPACE HAS A STORY</p>
          <h2>Let the next<br />great thing happen <em>here.</em></h2>
          <p>Put your space on the map. Meet the people who will make something beautiful in it.</p>
          <Link className="button button-lime" href="/add-studio">Become a host <ArrowRight size={17} /></Link>
        </div>
        <span className="host-cta-stamp"><Aperture size={30} /><small>ROOM FOR<br />GOOD IDEAS</small></span>
      </section>
    </>
  );
}
