import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
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
  metadataBase: new URL('https://hireog.com'),
  title: {
    default: "HireOG — Master  Interviews & Coding Challenges with AI",
    template: "%s | HireOG"
  },
  description: "Master interviews with HireOG - AI-powered mock interviews, 500+ real coding challenges from Google, Meta, Amazon. Interactive code editor, voice analysis, confidence tracking, and personalized feedback. Practice JavaScript, React, React Native, CSS, and system design. Join 10,000+ developers who aced their interviews.",
  keywords: [
    "ai mock interview",
    "ai interview practice",
    "frontend interview questions",
    "javascript interview",
    "react interview questions",
    "coding challenges",
    "mock interviews online",
    "technical interview prep",
    "frontend developer interview",
    "web developer interview",
    "coding interview practice",
    "system design interview",
    "ai interview feedback",
    "voice interview practice",
    "interview confidence building",
    "frontend coding test",
    "javascript coding challenges",
    "react coding interview",
    "frontend system design",
    "interview preparation platform",
    "coding interview simulator",
    "technical interview practice",
    "frontend interview prep",
    "javascript interview questions",
    "react interview prep",
    "frontend coding interview",
    "web development interview",
    "frontend engineer interview",
    "software engineer interview",
    "frontend developer prep",
    "coding interview questions",
    "frontend interview simulator",
    "ai interview coach",
    "interview practice platform",
    "frontend interview training",
    "coding interview prep",
    "technical interview simulator",
    "frontend interview questions and answers",
    "javascript interview prep",
    "react interview questions and answers"
  ],
  authors: [{ name: "HireOG" }],
  creator: "HireOG",
  publisher: "HireOG",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hireog.com",
    title: "HireOG — Master Frontend Interviews with AI",
    description: "AI-powered mock interviews with voice analysis, confidence tracking, and personalized feedback. Practice 500+ real coding challenges from Google, Meta, Amazon. Interactive code editor, system design prep, and interview analytics.",
    siteName: "HireOG",
    images: [
      {
        url: "https://hireog.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "HireOG - Master Frontend Interviews with AI"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "HireOG — Master Frontend Interviews with AI",
    description: "AI-powered mock interviews with voice analysis and confidence tracking. Practice 500+ real coding challenges from Google, Meta, Amazon with interactive code editor.",
    images: ["https://hireog.com/og-image.png"],
    creator: "@hireog",
    site: "@hireog"
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
    canonical: "https://hireog.com"
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
    "name": "HireOG",
    "description": "Master frontend interviews with AI-powered mock interviews, voice analysis, confidence tracking, and personalized feedback. Practice 500+ real coding challenges from Google, Meta, Amazon.",
    "url": "https://hireog.com",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "AI Mock Interview",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "description": "AI interviewer with voice analysis, confidence tracking, and performance analytics for frontend interviews (React, React Native, JS, CSS, System Design).",
        "url": "https://hireog.com/ai-interview",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "WebApplication",
        "name": "Frontend Coding Challenges",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "description": "500+ real frontend interview questions from top tech companies with interactive code editor and instant feedback.",
        "url": "https://hireog.com/problems",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "WebApplication",
        "name": "System Design Interview Prep",
        "operatingSystem": "Web",
        "applicationCategory": "EducationalApplication",
        "description": "Step-by-step system design scenarios for frontend engineers with scalable UI components and architecture patterns.",
        "url": "https://hireog.com/system-design",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://hireog.com/problems?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HireOG",
      "url": "https://hireog.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hireog.com/logo.svg",
        "width": 200,
        "height": 200
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@hireog.com",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://twitter.com/hireog",
        "https://linkedin.com/company/hireog"
      ]
    },
    "mainEntity": {
      "@type": "EducationalOrganization",
      "name": "HireOG",
      "description": "AI-powered interview preparation platform for frontend developers",
      "url": "https://hireog.com",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Interview Preparation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "AI Mock Interviews",
              "description": "Practice interviews with AI feedback on voice, confidence, and technical skills"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Coding Challenges",
              "description": "500+ real interview questions from top tech companies with interactive code editor"
            }
          }
        ]
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
              <ConditionalNavbar />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
