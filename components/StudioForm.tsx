"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { API_URL, type Studio } from "@/lib/api";

const categories = ["Photo Studio", "Film Stage", "Podcast Room", "Music Suite", "Art Workshop", "Creative Space"];
const suggestedAmenities = ["Natural light", "Cyclorama wall", "Soundproof", "Lighting kit", "Green screen", "Wi-Fi", "Parking", "Kitchen", "ADA accessible", "Grip equipment"];

export type StudioFormValues = {
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  overview: string;
};

export function StudioForm({ initial, onSubmit, submitLabel }: {
  initial?: Studio;
  onSubmit: (values: StudioFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<StudioFormValues>({
    title: initial?.title ?? "",
    category: initial?.category ?? categories[0],
    hourlyRate: initial?.hourlyRate ?? 65,
    securityDeposit: initial?.securityDeposit ?? 0,
    maxCapacity: initial?.maxCapacity ?? 8,
    location: initial?.location ?? "",
    imageUrl: initial?.imageUrl ?? "",
    amenities: initial?.amenities ?? [],
    overview: initial?.overview ?? "",
  });
  const [customAmenity, setCustomAmenity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setField<K extends keyof StudioFormValues>(key: K, value: StudioFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleAmenity(amenity: string) {
    setField("amenities", values.amenities.includes(amenity)
      ? values.amenities.filter((item) => item !== amenity)
      : [...values.amenities, amenity]);
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    const formData = new FormData();
    formData.set("image", file);
    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/images`, { method: "POST", credentials: "include", body: formData });
      const result = await response.json() as { imageUrl?: string; message?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.message ?? "Could not upload this image.");
      setField("imageUrl", result.imageUrl);
      toast.success("Your cover image is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload this image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="form-stack listing-form" onSubmit={handleSubmit}>
      <div className="form-section-heading"><span>01</span><div><h2>The essentials</h2><p>Give your space a name and a home.</p></div></div>
      <label className="field-label">Space name<input className="text-input" value={values.title} onChange={(event) => setField("title", event.target.value)} placeholder="e.g. The Sunday Light Studio" minLength={3} maxLength={100} required /></label>
      <div className="field-grid">
        <label className="field-label">Category<select className="text-input" value={values.category} onChange={(event) => setField("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="field-label">Neighborhood / city<input className="text-input" value={values.location} onChange={(event) => setField("location", event.target.value)} placeholder="Brooklyn, New York" required /></label>
      </div>
      <label className="field-label">Cover image URL<input className="text-input" type="url" value={values.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} placeholder="https://..." required /><span className="field-hint">Paste an image URL or upload a photo. Wide, well-lit images look great.</span></label>
      <label className="upload-field">
        <input type="file" accept="image/*" onChange={(event) => void uploadImage(event.target.files?.[0])} disabled={uploading} />
        <span className="upload-field-button">{uploading ? "Uploading image..." : "Choose a photo to upload"}</span><span className="field-hint">Up to 8 MB · JPG, PNG, or WebP</span>
      </label>
      {values.imageUrl && <div className="image-preview" style={{ backgroundImage: `url("${values.imageUrl}")` }} aria-label="Cover image preview" />}
      <div className="form-section-heading"><span>02</span><div><h2>Space details</h2><p>Set expectations before the first hello.</p></div></div>
      <div className="field-grid three-columns">
        <label className="field-label">Hourly rate ($)<input className="text-input" type="number" min="1" max="10000" value={values.hourlyRate} onChange={(event) => setField("hourlyRate", Number(event.target.value))} required /></label>
        <label className="field-label">Security deposit ($)<input className="text-input" type="number" min="0" max="100000" value={values.securityDeposit} onChange={(event) => setField("securityDeposit", Number(event.target.value))} required /></label>
        <label className="field-label">Guest capacity<input className="text-input" type="number" min="1" max="1000" value={values.maxCapacity} onChange={(event) => setField("maxCapacity", Number(event.target.value))} required /></label>
      </div>
      <label className="field-label">About your space<textarea className="text-input text-area" value={values.overview} onChange={(event) => setField("overview", event.target.value)} placeholder="Tell creators what makes this space special, what they can make here, and anything they should know before they arrive." minLength={20} maxLength={5000} rows={5} required /></label>
      <div className="form-section-heading"><span>03</span><div><h2>The good stuff</h2><p>What can creators count on when they arrive?</p></div></div>
      <div className="amenity-grid">
        {suggestedAmenities.map((amenity) => {
          const selected = values.amenities.includes(amenity);
          return <button type="button" className={`amenity-option${selected ? " amenity-selected" : ""}`} key={amenity} onClick={() => toggleAmenity(amenity)}>{selected ? <Check size={15} /> : <Plus size={15} />}{amenity}</button>;
        })}
      </div>
      <div className="custom-amenity"><input className="text-input" value={customAmenity} onChange={(event) => setCustomAmenity(event.target.value)} placeholder="Add another amenity" onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const value = customAmenity.trim();
          if (value && !values.amenities.includes(value)) setField("amenities", [...values.amenities, value]);
          setCustomAmenity("");
        }
      }} /><button type="button" className="button button-outline button-small" onClick={() => {
        const value = customAmenity.trim();
        if (value && !values.amenities.includes(value)) setField("amenities", [...values.amenities, value]);
        setCustomAmenity("");
      }}><Plus size={15} /> Add</button></div>
      {values.amenities.filter((amenity) => !suggestedAmenities.includes(amenity)).length > 0 && <div className="custom-amenity-list">{values.amenities.filter((amenity) => !suggestedAmenities.includes(amenity)).map((amenity) => <button type="button" key={amenity} onClick={() => toggleAmenity(amenity)}>{amenity}<X size={13} /></button>)}</div>}
      <div className="host-readonly"><span className="host-lock">✓</span><p>Your host details are linked to your account and will be shown on your listing.</p></div>
      <button className="button button-dark form-submit" type="submit" disabled={submitting}>{submitting ? "Saving your space..." : submitLabel}<Plus size={17} /></button>
    </form>
  );
}
