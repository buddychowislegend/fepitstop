"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/problems", label: "Problems" },
    { href: "/quiz", label: "Quiz" },
    { href: "/ai-interview", label: "AI Interview" },
    // { href: "/features", label: "Features" }, // Hidden for now
    // { href: "/pricing", label: "Pricing", highlight: true }, // Hidden for now
    { href: "/prep-plans", label: "Prep Plans" },
    { href: "/system-design", label: "System Design" },
    { href: "/resume", label: "Resume" },
    { href: "/hiring", label: "For Companies", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Glass shell */}
      <div className="border-b border-white/10 bg-[color:var(--surface)] backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="h-9 w-9 flex items-center justify-center">
            <Image src="/logo-simple.svg" alt="HireOG logo" width={36} height={36} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] bg-clip-text text-transparent">
            HireOG
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isComingSoon = 'comingSoon' in link && link.comingSoon;
            const isHighlight = 'highlight' in link && link.highlight;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition relative ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : isComingSoon
                    ? 'text-white/50 cursor-not-allowed'
                    : isHighlight
                    ? 'bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white hover:opacity-90'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {isComingSoon && (
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-500/20 text-yellow-300 px-1 rounded-full">
                    🚀
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Link 
                href="/profile" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-md">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button 
                onClick={logout} 
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/signin" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[color:var(--brand-start)] to-[color:var(--brand-end)] text-white font-semibold hover:opacity-90 transition shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md bg-white/10 hover:bg-white/15"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-[color:var(--surface)] backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isComingSoon = 'comingSoon' in link && link.comingSoon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : isComingSoon
                      ? 'text-white/50 cursor-not-allowed'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 flex gap-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex-1 btn btn-ghost text-center">Profile</Link>
                  <button onClick={() => { setOpen(false); logout(); }} className="flex-1 btn btn-ghost">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setOpen(false)} className="flex-1 btn btn-ghost text-center">Sign In</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 btn btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

