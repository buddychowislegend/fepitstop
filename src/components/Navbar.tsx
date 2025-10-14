"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/problems", label: "Problems" },
    { href: "/quiz", label: "Quiz" },
    { href: "/ai-interview", label: "AI Interview" },
    // { href: "/features", label: "Features" }, // Hidden for now
    // { href: "/pricing", label: "Pricing", highlight: true }, // Hidden for now
    { href: "/prep-plans", label: "Prep Plans" },
    { href: "/system-design", label: "System Design" },
    { href: "/resume", label: "Resume" },
    { href: "/community", label: "Community", comingSoon: true },
  ];

  return (
    <header className="border-b border-white/10 bg-[#1f1144]/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="h-9 w-9 flex items-center justify-center">
            <Image src="/logo-simple.svg" alt="Frontend Pitstop logo" width={36} height={36} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Frontend Pitstop
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
                    ? 'bg-white/15 text-white'
                    : isComingSoon
                    ? 'text-white/50 cursor-not-allowed'
                    : isHighlight
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
        <div className="flex items-center gap-3">
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
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-white/10 px-6 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isComingSoon = 'comingSoon' in link && link.comingSoon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition relative ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : isComingSoon
                    ? 'text-white/50 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {isComingSoon && (
                  <span className="ml-1 text-xs">🚀</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

