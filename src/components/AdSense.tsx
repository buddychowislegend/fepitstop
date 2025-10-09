"use client";
import { useEffect } from "react";

type AdSenseProps = {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export default function AdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
  className = "",
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  // Get AdSense client ID from environment variable
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000";

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      ></ins>
    </div>
  );
}

// Predefined ad components for common placements
export function HeaderAd() {
  return (
    <AdSense
      adSlot="1234567890"
      adFormat="horizontal"
      className="my-4"
      style={{ display: "block", minHeight: "90px" }}
    />
  );
}

export function SidebarAd() {
  return (
    <AdSense
      adSlot="1234567891"
      adFormat="vertical"
      className="my-4"
      style={{ display: "block", minHeight: "250px" }}
    />
  );
}

export function InArticleAd() {
  return (
    <AdSense
      adSlot="1234567892"
      adFormat="fluid"
      className="my-6"
      style={{ display: "block", textAlign: "center" }}
    />
  );
}

export function FooterAd() {
  return (
    <AdSense
      adSlot="1234567893"
      adFormat="horizontal"
      className="my-4"
      style={{ display: "block", minHeight: "90px" }}
    />
  );
}
