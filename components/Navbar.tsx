"use client";

import { Aperture, ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("You’re signed out. See you next session.");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" onClick={closeMenu} aria-label="StudioSpace home">
          <span className="brand-mark"><Aperture size={23} strokeWidth={2.2} /></span>
          <span>studio<span className="brand-light">space</span><i>.</i></span>
        </Link>
        <button className="mobile-menu-button icon-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          <Link className={pathname === "/studios" ? "nav-active" : ""} href="/studios" onClick={closeMenu}>Explore spaces</Link>
          <Link href="/#how-it-works" onClick={closeMenu}>How it works</Link>
          {user && <Link href="/my-bookings" onClick={closeMenu}>My bookings</Link>}
          <button className="icon-button theme-toggle" aria-label="Toggle color theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="sun-icon" size={18} /><Moon className="moon-icon" size={18} />
          </button>
          {!loading && user ? (
            <div className="nav-user">
              <span className="avatar">{user.photoUrl ? <img src={user.photoUrl} alt="" /> : user.name.charAt(0).toUpperCase()}</span>
              <span className="nav-user-name">{user.name.split(" ")[0]}</span>
              <button className="nav-signout" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : !loading ? (
            <div className="nav-actions">
              <Link className="nav-login" href="/login">Log in</Link>
              <Link className="button button-dark button-small" href="/register">Get started <ArrowUpRight size={15} /></Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
