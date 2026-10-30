"use client";

import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { StudioForm, type StudioFormValues } from "@/components/StudioForm";
import { api } from "@/lib/api";

function AddStudioForm() {
  const router = useRouter();

  async function createStudio(values: StudioFormValues) {
    try {
      await api("/studios", { method: "POST", body: JSON.stringify(values) });
      toast.success("Your space is on the map.");
      router.push("/my-listings");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your listing.");
      throw error;
    }
  }

  return <div className="page-width listing-page">
    <Link className="back-link" href="/"><ArrowLeft size={15} /> Back home</Link>
    <div className="listing-page-header"><div><p className="eyebrow eyebrow-dark">GOOD SPACES DESERVE TO BE FOUND</p><h1>Put your space <em>out there.</em></h1><p>Tell us what makes your studio special. The right people are looking for exactly this.</p></div><div className="listing-page-note"><LockKeyhole size={17} /><span>Your host profile is<br />linked automatically.</span></div></div>
    <div className="listing-layout"><div><StudioForm onSubmit={createStudio} submitLabel="Publish your space" /></div><aside className="listing-aside"><div className="listing-aside-image" /><p className="eyebrow eyebrow-dark">A NOTE FOR HOSTS</p><h3>Good rooms make good work.</h3><p>Share the small details: where the light falls, what comes in the kit, and what you love making here.</p><span className="aside-signoff">The StudioSpace team <span>✳</span></span></aside></div>
  </div>;
}

export default function AddStudioPage() {
  return <RequireAuth><AddStudioForm /></RequireAuth>;
}
