"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
          <Image src="/file.svg" alt="Frontend Pitstop logo" width={22} height={22} className="dark:invert-0" />
        </div>
        <span className="text-xl font-semibold">Frontend Pitstop</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-white/80">
        <Link className="hover:text-white" href="/problems">Problems</Link>
        <Link className="hover:text-white" href="/community">Community</Link>
      </nav>
      <div className="hidden sm:flex items-center gap-3">
        {user ? (
          <>
            <Link href="/profile" className="px-4 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
              <span>{user.name}</span>
            </Link>
            <button onClick={logout} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm font-medium">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="px-4 py-2 rounded-md text-sm font-medium text-white/90 hover:text-white">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-md bg-white text-[#3a1670] font-semibold hover:opacity-90">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

