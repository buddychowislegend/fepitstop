import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiring Dashboard | FePitStop",
  description: "Company hiring dashboard for managing candidates and screening assessments",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HiringLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Global gradient shell */}
          <div className="relative min-h-screen">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              {/* Soft radial gradient background */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] rounded-full blur-3xl opacity-30"
                   style={{ background: 'radial-gradient(800px 300px at 50% 40%, var(--brand-start), transparent 60%)' }} />
              <div className="absolute -bottom-40 right-1/2 translate-x-1/2 h-[600px] w-[1200px] rounded-full blur-3xl opacity-25"
                   style={{ background: 'radial-gradient(800px 300px at 50% 60%, var(--brand-end), transparent 60%)' }} />
            </div>
            <div className="relative flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
