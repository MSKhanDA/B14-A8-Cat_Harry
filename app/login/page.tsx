"use client";

import { ArrowLeft, ArrowRight, Aperture, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { useAuth } from "@/lib/auth";
import { api, type User } from "@/lib/api";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { refresh } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      await refresh();
      toast.success("You’re in. Let’s make something.");
      router.push(next?.startsWith("/") ? next : "/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-form-card">
      <Link className="back-link auth-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
      <span className="auth-mark"><Aperture size={23} /></span>
      <p className="eyebrow eyebrow-dark">GOOD TO HAVE YOU BACK</p>
      <h1>Come on <em>in.</em></h1>
      <p className="auth-subtitle">Your next great session is waiting.</p>
      {search.get("registered") && <div className="inline-success">Account ready. Sign in to start exploring.</div>}
      {search.get("error") === "google" && <div className="inline-error">Google sign-in didn’t finish. Please try again.</div>}
      <form className="form-stack auth-form" onSubmit={handleSubmit}>
        <label className="field-label">Email address<input className="text-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="field-label">Password<span className="password-input"><input className="text-input" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <div className="forgot-row"><span>Good to go when you are.</span><span className="forgot-disabled" title="Password recovery is not enabled for this demo">Forgot password?</span></div>
        <button className="button button-dark auth-submit" type="submit" disabled={submitting}>{submitting ? "Signing you in..." : "Log in"}<ArrowRight size={17} /></button>
      </form>
      <div className="auth-divider"><span />OR<span /></div>
      <GoogleAuthButton />
      <p className="auth-switch">New around here? <Link href="/register">Make an account <ArrowRight size={14} /></Link></p>
      <div className="auth-safety-note">Your sign-in is protected with a secure, private session.</div>
    </div>
  );
}

export default function LoginPage() {
  return <div className="auth-page"><div className="auth-art"><div className="auth-art-image" /><div className="auth-art-overlay" /><div className="auth-art-copy"><p className="eyebrow"><span className="eyebrow-dot" /> MADE FOR YOUR NEXT CHAPTER</p><p className="auth-art-quote">“The right room<br />changes <em>everything.</em>”</p><span className="auth-art-credit">A GOOD SPACE CAN CHANGE YOUR WHOLE DAY</span></div></div><Suspense fallback={<div className="auth-loading">One moment...</div>}><LoginForm /></Suspense></div>;
}
