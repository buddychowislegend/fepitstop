import type { Metadata } from "next";

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
  return <>{children}</>;
}
