"use client";

import { ArrowRight, ArrowUpRight, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { api, type Studio } from "@/lib/api";

function MyListingsContent() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Studio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api<{ studios: Studio[] }>("/my-listings");
      setStudios(result.studios);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function removeStudio() {
    if (!selected) return;
    setDeleting(true);
    try {
      await api(`/studios/${selected._id}`, { method: "DELETE" });
      setStudios((items) => items.filter((studio) => studio._id !== selected._id));
      setSelected(null);
      toast.success("Your listing has been removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove your listing.");
    } finally {
      setDeleting(false);
    }
  }

  return <div className="page-width dashboard-page">
    <div className="dashboard-header"><div><p className="eyebrow eyebrow-dark">YOUR LITTLE CORNER OF THE MAP</p><h1>Your <em>spaces.</em></h1><p>Keep the good rooms on the map.</p></div><Link className="button button-dark" href="/add-studio"><Plus size={17} /> Add a space</Link></div>
    {loading ? <div className="dashboard-skeletons">{[1, 2, 3].map((i) => <div className="dashboard-skeleton" key={i} />)}</div> :
      studios.length > 0 ? <div className="listing-cards">{studios.map((studio) => <article className="listing-row" key={studio._id}>
        <Link className="listing-row-image" style={{ backgroundImage: `url("${studio.imageUrl}")` }} href={`/studios/${studio._id}`} aria-label={`View ${studio.title}`} />
        <div className="listing-row-info"><span className="category-pill listing-category">{studio.category}</span><Link href={`/studios/${studio._id}`} className="listing-row-title">{studio.title}</Link><span className="listing-row-location"><MapPin size={14} />{studio.location}</span></div>
        <div className="listing-row-price"><strong>${studio.hourlyRate}</strong><span> / hr</span><small>{studio.rating?.toFixed(1) ?? "4.8"} ★</small></div>
        <div className="listing-row-actions"><Link className="icon-action" href={`/studios/edit/${studio._id}`} aria-label={`Edit ${studio.title}`}><Pencil size={16} /></Link><button className="icon-action danger-action" aria-label={`Delete ${studio.title}`} onClick={() => setSelected(studio)}><Trash2 size={16} /></button><Link className="icon-action" href={`/studios/${studio._id}`} aria-label={`View ${studio.title}`}><ArrowUpRight size={17} /></Link></div>
      </article>)}</div> :
        <div className="empty-state"><span className="empty-state-icon"><Plus size={24} /></span><p className="eyebrow eyebrow-dark">YOUR FIRST SPACE STARTS HERE</p><h2>Make room for <em>something good.</em></h2><p>Share your creative space with the people who will love it as much as you do.</p><Link className="button button-dark" href="/add-studio">List your first space <ArrowRight size={16} /></Link></div>}
    {selected && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setSelected(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><button className="modal-close" aria-label="Close dialog" disabled={deleting} onClick={() => setSelected(null)}><X size={19} /></button><span className="modal-icon modal-icon-warn"><Trash2 size={20} /></span><p className="eyebrow eyebrow-dark">A QUICK CHECK</p><h2 id="delete-title">Take this space <em>off the map?</em></h2><p className="modal-subtitle">“{selected.title}” will be removed, along with any pending or confirmed reservations.</p><div className="confirm-actions"><button className="button button-outline" disabled={deleting} onClick={() => setSelected(null)}>Keep listing</button><button className="button button-danger" disabled={deleting} onClick={() => void removeStudio()}>{deleting ? "Removing..." : "Remove listing"}<Trash2 size={15} /></button></div></div></div>}
  </div>;
}

export default function MyListingsPage() {
  return <RequireAuth><MyListingsContent /></RequireAuth>;
}
