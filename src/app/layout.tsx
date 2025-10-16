import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://frontendpitstop.com'),
  title: {
    default: "Frontend Pitstop — Master Frontend Interviews & Coding Challenges",
    template: "%s | Frontend Pitstop"
  },
  description: "Practice 100+ real frontend interview questions from top tech companies like Google, Meta, Amazon. AI-based mock interviews with voice, interviewer selection, and analytics. Interactive code editor, instant feedback, and comprehensive solutions. Master JavaScript, React, React Native, CSS, and system design.",
  keywords: [
    "frontend interview questions",
    "javascript interview",
    "react interview questions",
    "react native interview questions",
    "vue interview questions",
    "coding challenges",
    "web development practice",
    "frontend coding test",
    "technical interview prep",
    "ai interview",
    "ai mock interview",
    "mock interviews online",
    "voice interview practice",
    "system design interview for frontend",
    "javascript quiz",
    "coding interview",
    "frontend developer",
    "web developer interview",
    "coding practice",
    "programming challenges",
    "leetcode frontend",
    "frontend system design",
    "frontend ai interviewer"
  ],
  authors: [{ name: "Frontend Pitstop" }],
  creator: "Frontend Pitstop",
  publisher: "Frontend Pitstop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://frontendpitstop.com",
    title: "Frontend Pitstop — AI Mock Interviews for Frontend",
    description: "AI-based interviewer, real-time voice Q&A, interviewer selection, and performance analytics. Practice React, React Native, JS, CSS & system design.",
    siteName: "Frontend Pitstop",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Frontend Pitstop - Master Frontend Interviews"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontend Pitstop — Master Frontend Interviews",
    description: "Practice 100+ real frontend interview questions from top tech companies. Interactive code editor with instant feedback.",
    images: ["/og-image.png"],
    creator: "@frontendpitstop"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://frontendpitstop.com"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000";
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Frontend Pitstop",
    "description": "Practice frontend interview questions, coding challenges, and AI-based mock interviews with voice and analytics",
    "url": "https://frontendpitstop.com",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "AI Mock Interview",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "description": "AI interviewer with voice, interviewer selection, and performance analytics for frontend interviews (React, React Native, JS, CSS, System Design).",
        "url": "https://frontendpitstop.com/ai-interview"
      },
      {
        "@type": "WebApplication",
        "name": "Frontend Mock Interviews",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "description": "Mock interviews for frontend roles with detailed feedback and scorecards.",
        "url": "https://frontendpitstop.com/mock-interview"
      }
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://frontendpitstop.com/problems?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Frontend Pitstop",
      "url": "https://frontendpitstop.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://frontendpitstop.com/logo.svg"
      }
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2772878798617814`}
          crossOrigin="anonymous"
        ></script>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Analytics />
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
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
