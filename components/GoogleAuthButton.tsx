"use client";

import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { API_URL, api } from "@/lib/api";

export function GoogleAuthButton() {
  async function signIn() {
    try {
      const { configured } = await api<{ configured: boolean }>("/auth/google/status");
      if (!configured) {
        toast.error("Google sign-in isn't configured yet. Add your Google OAuth credentials to the server environment.");
        return;
      }
      window.location.assign(`${API_URL}/api/auth/google`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not connect to Google sign-in.");
    }
  }

  return <button type="button" className="button button-google" onClick={signIn}><Chrome size={17} /> Continue with Google</button>;
}
