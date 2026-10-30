"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <div className="auth-loading"><LoaderCircle className="spinner" size={28} /><p>Getting your space ready...</p><Link href="/login">Sign in <ArrowRight size={14} /></Link></div>;
  }
  return children;
}
