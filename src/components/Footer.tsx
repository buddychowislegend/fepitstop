"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Platform": [
      { href: "/problems", label: "Problems" },
      { href: "/quiz", label: "Quiz" },
      { href: "/prep-plans", label: "Prep Plans" },
      { href: "/system-design", label: "System Design" },
    ],
    "Practice": [
      { href: "/mock-interview", label: "Mock Interview" },
      { href: "/community", label: "Community Solutions" },
      { href: "/progress", label: "Track Progress" },
    ],
    "Account": [
      { href: "/profile", label: "Profile" },
      { href: "/signin", label: "Sign In" },
      { href: "/signup", label: "Sign Up" },
    ],
    "Resources": [
      { href: "https://github.com", label: "GitHub", external: true },
      { href: "https://twitter.com", label: "Twitter", external: true },
      { href: "mailto:support@hireog.com", label: "Contact", external: true },
    ],
  };

  return (
    <footer className="border-t border-white/10 bg-gradient-to-br from-[#1f1144]/80 via-[#3a1670]/60 to-[#6a2fb5]/40 backdrop-blur-sm mt-20">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition"
                      {...(('external' in link && link.external) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                      {'external' in link && link.external && (
                        <span className="ml-1 text-xs">↗</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-simple.svg" alt="HireOG" width={32} height={32} />
            <p className="text-sm text-white/60">
              © {currentYear} HireOG. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Master frontend interviews with 100+ curated problems from top tech companies
          </p>
        </div>
      </div>
    </footer>
  );
}
