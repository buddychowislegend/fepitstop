"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AIConfigurationScreen from "@/components/AIConfigurationScreen";

function JDInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const prompt = searchParams?.get("prompt");
    if (prompt) {
      setAiPrompt(decodeURIComponent(prompt));
    } else {
      // If no prompt provided, use empty string - user can paste JD in the form
      setAiPrompt("");
    }
    setIsLoading(false);
  }, [searchParams]);

  const handleCreateDriveFromAI = async (details: any) => {
    try {
      const screeningName = `${details.positionTitle}`;
      
      // Map profile string
      const mapProfileString = (text: string = '') => {
        const lower = text.toLowerCase();
        if (lower.includes('backend')) return 'backend';
        if (lower.includes('frontend')) return 'frontend';
        if (lower.includes('product')) return 'product';
        if (lower.includes('business') || lower.includes('sales')) return 'business';
        if (lower.includes('qa') || lower.includes('quality')) return 'qa';
        if (lower.includes('hr') || lower.includes('human')) return 'hr';
        if (lower.includes('data') || lower.includes('analytics')) return 'data';
        return 'frontend';
      };
      
      // Use the profile from details if available, otherwise derive from position title
      const profile = details.profile || mapProfileString(details.positionTitle || details.jobDescription || '');
      const level = details.level || details.experienceLevel || 'mid';
      
      if (!details.questions || details.questions.length === 0) {
        alert('Please generate or add interview questions before creating the drive.');
        return;
      }
      
      // Create screening in backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fepit.vercel.app';
      const response = await fetch(`${backendUrl}/api/company/screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: screeningName,
          positionTitle: details.positionTitle,
          language: details.language,
          mustHaves: details.mustHaves,
          goodToHaves: details.goodToHaves,
          culturalFit: details.culturalFit,
          estimatedTime: details.estimatedTime,
          status: 'active',
          jobDescription: details.jobDescription || '',
          profile: profile,
          level: level,
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Create corresponding interview drive with generated questions
        try {
          const driveResponse = await fetch(`${backendUrl}/api/company/drives`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Company-ID': 'hireog',
              'X-Company-Password': 'manasi22'
            },
            credentials: 'include',
            body: JSON.stringify({
              name: screeningName,
              candidateIds: [],
              jobDescription: details.jobDescription || aiPrompt || '',
              questions: details.questions,
              profile: profile,
              level: level,
              screeningId: data.id
            })
          });

          if (!driveResponse.ok) {
            const driveError = await driveResponse.json().catch(() => ({}));
            console.error('Failed to create AI drive:', driveError);
          }
        } catch (driveError) {
          console.error('Error creating AI drive:', driveError);
        }

        // Navigate back to dashboard
        router.push('/hiring/dashboard?tab=screenings');
        
        // Show success message
        alert(`AI screening "${screeningName}" created successfully!`);
      } else {
        throw new Error('Failed to create screening in backend');
      }
    } catch (error) {
      console.error('Error creating AI screening:', error);
      alert('Failed to create AI screening. Please try again.');
    }
  };

  const handleBack = () => {
    router.push('/hiring/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] flex items-center justify-center">
        <div className="text-white/60 text-sm uppercase tracking-[0.3em]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <AIConfigurationScreen
      aiPrompt={aiPrompt}
      onBack={handleBack}
      onCreateDrive={handleCreateDriveFromAI}
    />
  );
}

export default function JDInterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0f1427] to-[#1a0b2e] flex items-center justify-center">
        <div className="text-white/60 text-sm uppercase tracking-[0.3em]">
          Loading...
        </div>
      </div>
    }>
      <JDInterviewContent />
    </Suspense>
  );
}

