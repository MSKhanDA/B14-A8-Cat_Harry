"use client";

import { ArrowLeft, ArrowRight, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { StudioCard } from "@/components/StudioCard";
import { api, type Studio } from "@/lib/api";

const filters = ["All spaces", "Photo Studio", "Film Stage", "Podcast Room", "Music Suite", "Art Workshop", "Creative Space"];

export default function StudiosPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All spaces");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramCategory = params.get("category");
    if (paramCategory && filters.includes(paramCategory)) setCategory(paramCategory);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All spaces") params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    api<{ studios: Studio[] }>(`/studios${params.size ? `?${params}` : ""}`)
      .then((result) => setStudios(result.studios))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load studios."))
      .finally(() => setLoading(false));
  }, [category, query]);

  const resultLabel = useMemo(() => `${studios.length} ${studios.length === 1 ? "space" : "spaces"}`, [studios.length]);

  return (
    <div className="directory-page">
      <section className="directory-hero">
        <div className="page-width directory-hero-inner">
          <div>
            <Link className="back-link" href="/"><ArrowLeft size={15} /> Back home</Link>
            <p className="eyebrow eyebrow-dark">YOUR CREATIVE HOME IS OUT THERE</p>
            <h1>Space to make<br /><em>your next thing.</em></h1>
            <p className="directory-hero-copy">Good light, great sound, and hosts who get it. Find a space that feels like the start of something.</p>
          </div>
          <div className="directory-hero-art">
            <div className="directory-art-image" />
            <div className="directory-art-note"><MapPin size={14} /> GOOD SPACES, CLOSE BY</div>
            <span className="directory-art-number">№ 001</span>
          </div>
          <div className="directory-search">
            <Search size={19} />
            <input aria-label="Search spaces or locations" placeholder="Try a space, a city, a feeling..." value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={17} /></button>}
            <span className="search-divider" />
            <span className="search-location">Anywhere, really</span>
            <button className="search-submit" aria-label="Search"><SlidersHorizontal size={17} /></button>
          </div>
        </div>
      </section>
      <section className="directory-content page-width">
        <div className="directory-toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filter by studio category">
            {filters.map((filter) => <button key={filter} role="tab" aria-selected={category === filter} className={category === filter ? "filter-tab filter-active" : "filter-tab"} onClick={() => setCategory(filter)}>{filter}</button>)}
          </div>
          <span className="result-count">{resultLabel}</span>
        </div>
        {loading ? <div className="studio-grid directory-grid">{[1, 2, 3, 4, 5, 6].map((item) => <div className="studio-skeleton" key={item}><div /><span /><i /></div>)}</div> :
          studios.length > 0 ? <div className="studio-grid directory-grid">{studios.map((studio, index) => <StudioCard key={studio._id} studio={studio} index={index} />)}</div> :
            <div className="empty-state"><span className="empty-state-icon"><Search size={23} /></span><p className="eyebrow eyebrow-dark">NOT QUITE THE ONE?</p><h2>No spaces found <em>just yet.</em></h2><p>Try another search or clear your filters. The perfect creative home is out there.</p><div className="empty-state-actions"><button className="button button-outline" onClick={() => { setCategory("All spaces"); setQuery(""); }}>Clear filters <X size={15} /></button><Link className="button button-dark" href="/add-studio">List your space <ArrowRight size={16} /></Link></div></div>}
        <div className="directory-host-note"><span className="host-note-spark">✳</span><span>Have a space made for making?</span><Link href="/add-studio">Put it on the map <ArrowRight size={15} /></Link></div>
      </section>
    </div>
  );
}
