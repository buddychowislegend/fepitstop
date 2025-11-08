"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const AIInterviewPage = dynamic(() => import("@/app/ai-interview/page"), {
  ssr: false,
});

export default function CandidateInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();

  const token = params?.token as string;
  const searchParamString = useMemo(() => searchParams.toString(), [searchParams]);
  const currentToken = searchParams.get("token");
  const hasSyncedToken = currentToken === token;

  useEffect(() => {
    if (!token || hasSyncedToken) {
          return;
        }
        
    const newParams = new URLSearchParams(searchParamString);
    newParams.set("token", token);

    if (!newParams.get("company")) {
      newParams.set("company", "HireOG");
    }

    const newQuery = newParams.toString();
    router.replace(
      `/hiring/candidate-interview/${token}${newQuery ? `?${newQuery}` : ""}`
    );
  }, [token, hasSyncedToken, searchParamString, router]);

  useEffect(() => {
    if (authLoading) {
        return;
      }

    if (!user) {
      const redirectQuery = searchParamString.length ? `?${searchParamString}` : "";
      const redirectUrl = `/hiring/candidate-interview/${token}${redirectQuery}`;
      router.replace(`/signin?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [authLoading, user, router, token, searchParamString]);

  if (!hasSyncedToken || authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] flex items-center justify-center">
        <div className="text-white/60 text-sm uppercase tracking-[0.3em]">
          Preparing Interview Experience...
        </div>
      </div>
    );
  }

  return <AIInterviewPage />;
}