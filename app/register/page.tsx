"use client";

import { ArrowLeft, ArrowRight, Aperture, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6) {
      toast.error("Use at least 6 characters, with one uppercase and one lowercase letter.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, photoUrl, password }) });
      toast.success("Your account is ready. Sign in and find your space.");
      router.push("/login?registered=1");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-art"><div className="auth-art-image register-art-image" /><div className="auth-art-overlay" /><div className="auth-art-copy"><p className="eyebrow"><span className="eyebrow-dot" /> COME MAKE YOURSELF AT HOME</p><p className="auth-art-quote">Your people.<br />Your place.<br /><em>Your next big thing.</em></p><span className="auth-art-credit">CREATIVITY LOOKS GOOD ON YOU</span></div></div>
      <div className="auth-form-card">
        <Link className="back-link auth-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
        <span className="auth-mark"><Aperture size={23} /></span>
        <p className="eyebrow eyebrow-dark">GOOD THINGS START HERE</p>
        <h1>Find your <em>people.</em></h1>
        <p className="auth-subtitle">Make an account. Find your space. Make a thing.</p>
        <form className="form-stack auth-form" onSubmit={handleSubmit}>
          <label className="field-label">Your name<input className="text-input" type="text" autoComplete="name" placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required /></label>
          <label className="field-label">Email address<input className="text-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label className="field-label">Photo URL <span className="optional-label">optional</span><input className="text-input" type="url" placeholder="https://..." value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} /></label>
          <label className="field-label">Create a password<span className="password-input"><input className="text-input" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}" title="At least 6 characters with uppercase and lowercase letters" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span><span className="field-hint">One uppercase, one lowercase, six characters minimum.</span></label>
          <button className="button button-dark auth-submit" type="submit" disabled={submitting}>{submitting ? "Creating your account..." : "Create account"}<ArrowRight size={17} /></button>
        </form>
        <div className="auth-divider"><span />OR<span /></div>
        <GoogleAuthButton />
        <p className="auth-switch">Already one of us? <Link href="/login">Log in <ArrowRight size={14} /></Link></p>
        <div className="auth-safety-note">Your sign-in is protected with a secure, private session.</div>
      </div>
    </div>
  );
}
