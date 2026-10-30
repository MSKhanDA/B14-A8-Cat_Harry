"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { StudioForm, type StudioFormValues } from "@/components/StudioForm";
import { api, type Studio } from "@/lib/api";

function EditStudioForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ studio: Studio }>(`/studios/${id}`)
      .then(({ studio: result }) => setStudio(result))
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not load this listing."))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStudio(values: StudioFormValues) {
    try {
      await api(`/studios/${id}`, { method: "PATCH", body: JSON.stringify(values) });
      toast.success("Your listing has been updated.");
      router.push("/my-listings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your listing.");
      throw error;
    }
  }

  return <div className="page-width listing-page">
    <Link className="back-link" href="/my-listings"><ArrowLeft size={15} /> Your listings</Link>
    <div className="listing-page-header"><div><p className="eyebrow eyebrow-dark">A LITTLE UPDATE</p><h1>Make it <em>just right.</em></h1><p>Keep your studio details current so makers know exactly what to expect.</p></div></div>
    {loading ? <div className="page-loading"><LoaderCircle className="spinner" size={26} />Opening your listing...</div> : studio ? <div className="listing-layout"><div><StudioForm key={studio._id} initial={studio} onSubmit={updateStudio} submitLabel="Save your changes" /></div><aside className="listing-aside"><div className="listing-aside-image" style={{ backgroundImage: `url("${studio.imageUrl}")` }} /><p className="eyebrow eyebrow-dark">YOUR CURRENT LISTING</p><h3>{studio.title}</h3><p>Changes will show up as soon as you save.</p></aside></div> : <div className="empty-state"><h2>This listing isn't here.</h2><p>It may have been removed, or it may belong to another host.</p><Link className="button button-dark" href="/my-listings">Back to listings</Link></div>}
  </div>;
}

export default function EditStudioPage() {
  return <RequireAuth><EditStudioForm /></RequireAuth>;
}
