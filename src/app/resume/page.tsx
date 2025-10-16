"use client";
import { useState, useMemo, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
// Client-side canvas export kept as fallback if needed in future

type ResumeData = {
  name: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  links: { label: string; url: string }[];
  skills: string[];
  experience: { company: string; role: string; start: string; end: string; bullets: string[] }[];
  education: { school: string; degree: string; start: string; end: string; details?: string }[];
};

type TemplateId = "classic" | "modern" | "minimal" | "elegant" | "simpleAts" | "corporate" | "clear" | "precisionAts";
type TemplateProps = { data: ResumeData; accent?: string; includePhoto?: boolean };

const defaultData: ResumeData = {
  name: "Your Name",
  title: "Frontend Developer",
  summary: "Results-driven frontend developer with experience in React, TypeScript, and performance optimization.",
  email: "you@example.com",
  phone: "+1-555-123-4567",
  location: "Remote / City, Country",
  links: [{ label: "GitHub", url: "https://github.com/yourhandle" }, { label: "LinkedIn", url: "https://linkedin.com/in/yourhandle" }],
  skills: ["React", "TypeScript", "Next.js", "CSS", "Node.js"],
  experience: [
    { company: "Company A", role: "Frontend Engineer", start: "2022", end: "Present", bullets: ["Built X", "Improved Y"] },
  ],
  education: [
    { school: "University Name", degree: "B.Tech Computer Science", start: "2016", end: "2020" },
  ],
};

function ClassicTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 p-8 leading-relaxed">
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <div className="text-sm text-gray-600">{data.title} • {data.location}</div>
      <div className="text-sm text-gray-600">{data.email} • {data.phone}</div>
      <div className="text-sm text-blue-700 mt-1 flex flex-wrap gap-3">
        {data.links.map((l, i) => (
          <span key={i}>{l.label}: {l.url}</span>
        ))}
      </div>
      <hr className="my-4" />
      <section>
        <h2 className="font-semibold text-lg mb-1">Summary</h2>
        <p>{data.summary}</p>
      </section>
      <section className="mt-4">
        <h2 className="font-semibold text-lg mb-1">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded border text-sm">{s}</span>
          ))}
        </div>
      </section>
      <section className="mt-4">
        <h2 className="font-semibold text-lg mb-1">Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-3">
            <div className="font-semibold">{exp.role} — {exp.company}</div>
            <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
            <ul className="list-disc ml-5 text-sm mt-1">
              {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </section>
      <section className="mt-4">
        <h2 className="font-semibold text-lg mb-1">Education</h2>
        {data.education.map((ed, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold">{ed.degree} — {ed.school}</div>
            <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
            {ed.details && <div className="text-sm">{ed.details}</div>}
          </div>
        ))}
      </section>
    </div>
  );
}

function ModernTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white p-8 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">{data.name}</h1>
          <div className="text-sm text-gray-600">{data.title}</div>
        </div>
        <div className="text-right text-xs text-gray-600">
          <div>{data.email}</div>
          <div>{data.phone}</div>
          <div>{data.location}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-blue-700 flex flex-wrap gap-3">
        {data.links.map((l, i) => (
          <span key={i}>{l.label}: {l.url}</span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          <h2 className="font-semibold text-lg mb-1">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="font-semibold">{exp.role} — {exp.company}</div>
              <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
              <ul className="list-disc ml-5 text-sm mt-1">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
          <h2 className="font-semibold text-lg mb-1 mt-4">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">{ed.degree} — {ed.school}</div>
              <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
              {ed.details && <div className="text-sm">{ed.details}</div>}
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-semibold text-lg mb-1">Summary</h2>
          <p className="text-sm">{data.summary}</p>
          <h2 className="font-semibold text-lg mb-1 mt-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 rounded border text-sm">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 p-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <span className="text-xs text-gray-500">{data.location}</span>
      </div>
      <div className="text-sm text-gray-600">{data.title} • {data.email} • {data.phone}</div>
      <div className="mt-1 text-xs text-blue-700 flex flex-wrap gap-3">
        {data.links.map((l, i) => <span key={i}>{l.label}: {l.url}</span>)}
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
          <h2 className="font-medium text-gray-800 mb-1">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="text-sm font-medium">{exp.role} — {exp.company}</div>
              <div className="text-xs text-gray-500">{exp.start} – {exp.end}</div>
              <ul className="list-disc ml-5 text-xs mt-1">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
          <h2 className="font-medium text-gray-800 mb-1 mt-3">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="text-sm font-medium">{ed.degree} — {ed.school}</div>
              <div className="text-xs text-gray-500">{ed.start} – {ed.end}</div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-medium text-gray-800 mb-1">Summary</h2>
          <p className="text-sm">{data.summary}</p>
          <h2 className="font-medium text-gray-800 mb-1 mt-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 border rounded text-xs">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ElegantTemplate({ data }: TemplateProps) {
  return (
    <div className="bg-white text-gray-900 p-0">
      <div className="grid grid-cols-3 min-h-[1000px]">
        <aside className="col-span-1 bg-gray-50 p-6 border-r">
          <h1 className="text-2xl font-extrabold leading-tight">{data.name}</h1>
          <div className="text-sm text-gray-600">{data.title}</div>
          <div className="mt-3 text-xs text-gray-600 space-y-1">
            <div>{data.email}</div>
            <div>{data.phone}</div>
            <div>{data.location}</div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-1">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-white border rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-1">Links</h3>
            <div className="text-xs text-blue-700 space-y-1">
              {data.links.map((l, i) => <div key={i}>{l.label}: {l.url}</div>)}
            </div>
          </div>
        </aside>
        <main className="col-span-2 p-8">
          <h2 className="font-semibold text-lg mb-1">Summary</h2>
          <p className="text-sm mb-4">{data.summary}</p>
          <h2 className="font-semibold text-lg mb-1">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="font-semibold">{exp.role} — {exp.company}</div>
              <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
              <ul className="list-disc ml-5 text-sm mt-1">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
          <h2 className="font-semibold text-lg mb-1">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">{ed.degree} — {ed.school}</div>
              <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [step, setStep] = useState<"choose" | "edit">("choose");
  const [data, setData] = useState<ResumeData>(defaultData);
  const [accent, setAccent] = useState<string>("#2563eb");
  const [includePhoto, setIncludePhoto] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [exportMode, setExportMode] = useState<boolean>(false);
  const [analyzeFile, setAnalyzeFile] = useState<File | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState<boolean>(false);
  const [analyzeResult, setAnalyzeResult] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    textPreview?: string;
    ai?: {
      score: number | null;
      strengths: string[] | null;
      improvements: string[] | null;
      missingKeywords: string[] | null;
      sectionScores: Record<string, number> | null;
      summary: string | null;
    } | null;
  } | null>(null);
  const [pastedResumeText, setPastedResumeText] = useState<string>('');

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      const node = previewRef.current;
      const origin = window.location.origin;
      const linkHrefs = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((l: any) => (l.href.startsWith('http') ? l.href : origin + l.getAttribute('href')));
      const inlineStyles = Array.from(document.querySelectorAll('style'))
        .map(s => s.innerHTML)
        .join('\n');
      const headHTML = `\n${linkHrefs.map(h => `<link rel="stylesheet" href="${h}" />`).join('\n')}\n<style>body{background:#ffffff}</style>\n<style>${inlineStyles}</style>`;
      const docHtml = `<!doctype html><html><head><meta charSet="utf-8" />${headHTML}</head><body>${node.outerHTML}</body></html>`;
      const resp = await fetch('/api/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: docHtml, width: 794, height: 1123 })
      });
      if (!resp.ok) throw new Error('PDF render failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'resume.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF export failed:', err?.message || err);
      if (typeof window !== 'undefined') alert('PDF export failed. Please try again.');
    }
  };

  // Additional premium templates
  function SimpleATSTemplate({ data, accent = "#2563eb" }: TemplateProps) {
    return (
      <div className="bg-white text-gray-900 p-10 leading-relaxed" style={{ borderTop: `6px solid ${accent}` }}>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        <div className="text-sm text-gray-600">{data.title} • {data.location}</div>
        <div className="text-sm text-gray-600">{data.email} • {data.phone}</div>
        <div className="text-xs text-blue-700 mt-1 flex flex-wrap gap-3">
          {data.links.map((l, i) => (<span key={i}>{l.label}: {l.url}</span>))}
        </div>
        <hr className="my-4" />
        <section>
          <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Professional Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="font-semibold">{exp.role} — {exp.company}</div>
              <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
              <ul className="list-disc ml-5 text-sm mt-1">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
        <section className="mt-4">
          <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">{ed.degree} — {ed.school}</div>
              <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
            </div>
          ))}
        </section>
        <section className="mt-4">
          <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Areas of Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (<span key={i} className="px-2 py-0.5 bg-gray-100 rounded border text-sm">{s}</span>))}
          </div>
        </section>
      </div>
    );
  }

  function CorporateTemplate({ data, accent = "#2563eb", includePhoto = false }: TemplateProps) {
    return (
      <div className="bg-white text-gray-900 p-0">
        <div className="grid grid-cols-3 min-h-[1000px]">
          <aside className="col-span-1 p-6 border-r" style={{ backgroundColor: `${accent}10`, borderColor: `${accent}33` }}>
            {includePhoto && (
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border" style={{ borderColor: accent }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Photo</div>
              </div>
            )}
            <h1 className="text-2xl font-extrabold leading-tight">{data.name}</h1>
            <div className="text-sm" style={{ color: accent }}>{data.title}</div>
            <div className="mt-3 text-xs text-gray-700 space-y-1">
              <div>{data.email}</div>
              <div>{data.phone}</div>
              <div>{data.location}</div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-1">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (<span key={i} className="px-2 py-0.5 bg-white border rounded text-xs">{s}</span>))}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-1">Links</h3>
              <div className="text-xs text-blue-700 space-y-1">
                {data.links.map((l, i) => <div key={i}>{l.label}: {l.url}</div>)}
              </div>
            </div>
          </aside>
          <main className="col-span-2 p-8">
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Profile</h2>
            <p className="text-sm mb-4">{data.summary}</p>
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Employment History</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="font-semibold">{exp.role} — {exp.company}</div>
                <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
                <ul className="list-disc ml-5 text-sm mt-1">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Education</h2>
            {data.education.map((ed, i) => (
              <div key={i} className="mb-2">
                <div className="font-semibold">{ed.degree} — {ed.school}</div>
                <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
              </div>
            ))}
          </main>
        </div>
      </div>
    );
  }

  function ClearTemplate({ data, accent = "#10b981", includePhoto = true }: TemplateProps) {
    return (
      <div className="bg-white p-0">
        <div className="h-24" style={{ backgroundColor: accent + "33" }}>
          <div className="max-w-[760px] mx-auto h-full flex items-center gap-4 px-6">
            {includePhoto && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: accent }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Photo</div>
              </div>
            )}
            <div>
              <div className="text-2xl font-extrabold" style={{ color: accent }}>{data.name}</div>
              <div className="text-sm text-gray-700">{data.title}</div>
            </div>
          </div>
        </div>
        <div className="max-w-[760px] mx-auto grid grid-cols-3 gap-6 p-6">
          <div className="col-span-1 text-xs text-gray-700 space-y-2">
            <div>{data.email}</div>
            <div>{data.phone}</div>
            <div>{data.location}</div>
            <div className="mt-2">
              <h3 className="font-semibold mb-1" style={{ color: accent }}>Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (<span key={i} className="px-2 py-0.5 bg-gray-100 border rounded text-xs">{s}</span>))}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Profile</h2>
            <p className="text-sm mb-3">{data.summary}</p>
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Employment History</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="font-semibold">{exp.role} — {exp.company}</div>
                <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
                <ul className="list-disc ml-5 text-sm mt-1">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}
            <h2 className="font-semibold text-lg mb-1" style={{ color: accent }}>Education</h2>
            {data.education.map((ed, i) => (
              <div key={i} className="mb-2">
                <div className="font-semibold">{ed.degree} — {ed.school}</div>
                <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function PrecisionATSTemplate({ data, accent = "#f59e0b" }: TemplateProps) {
    return (
      <div className="bg-white text-gray-900 p-10">
        <div className="text-3xl font-extrabold" style={{ color: accent }}>{data.name}</div>
        <div className="text-sm text-gray-700">{data.title} • {data.email} • {data.phone} • {data.location}</div>
        <h2 className="font-semibold text-lg mt-4 mb-1" style={{ color: accent }}>Summary</h2>
        <p className="text-sm">{data.summary}</p>
        <h2 className="font-semibold text-lg mt-4 mb-1" style={{ color: accent }}>Career Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} className="mb-3">
            <div className="font-semibold">{exp.role} — {exp.company}</div>
            <div className="text-sm text-gray-600">{exp.start} – {exp.end}</div>
            <ul className="list-disc ml-5 text-sm mt-1">{exp.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}
        <h2 className="font-semibold text-lg mt-4 mb-1" style={{ color: accent }}>Education</h2>
        {data.education.map((ed, i) => (
          <div key={i} className="mb-2">
            <div className="font-semibold">{ed.degree} — {ed.school}</div>
            <div className="text-sm text-gray-600">{ed.start} – {ed.end}</div>
          </div>
        ))}
        <h2 className="font-semibold text-lg mt-4 mb-1" style={{ color: accent }}>Technical Proficiencies</h2>
        <div className="flex flex-wrap gap-2">{data.skills.map((s, i) => (<span key={i} className="px-2 py-0.5 bg-gray-100 rounded border text-sm">{s}</span>))}</div>
      </div>
    );
  }

  const Template = useMemo(() => {
    switch (template) {
      case "classic": return (p: any) => <ClassicTemplate {...p} />;
      case "modern": return (p: any) => <ModernTemplate {...p} />;
      case "minimal": return (p: any) => <MinimalTemplate {...p} />;
      case "elegant": return (p: any) => <ElegantTemplate {...p} />;
      case "simpleAts": return (p: any) => <SimpleATSTemplate {...p} />;
      case "corporate": return (p: any) => <CorporateTemplate {...p} />;
      case "clear": return (p: any) => <ClearTemplate {...p} />;
      case "precisionAts": return (p: any) => <PrecisionATSTemplate {...p} />;
    }
  }, [template]);

  // Extremely safe plain template for export to avoid lab/oklch issues
  function PlainTemplate({ data, accent = '#2563eb' }: TemplateProps) {
    const textStyle = { color: '#111111' } as React.CSSProperties;
    const subtleStyle = { color: '#444444' } as React.CSSProperties;
    const borderStyle = { borderColor: '#e5e7eb' } as React.CSSProperties;
    return (
      <div style={{ background: '#ffffff', color: '#111111', padding: '28px', lineHeight: 1.6 }}>
        <h1 style={{ ...textStyle, fontSize: '28px', fontWeight: 800, margin: 0, color: accent }}>{data.name}</h1>
        <div style={{ ...subtleStyle, fontSize: '13px', marginTop: '2px' }}>{data.title} • {data.email} • {data.phone} • {data.location}</div>
        <hr style={{ borderTop: `3px solid ${accent}`, margin: '12px 0' }} />
        <h2 style={{ ...textStyle, fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: accent }}>Summary</h2>
        <p style={{ ...subtleStyle, fontSize: '14px', marginTop: 0 }}>{data.summary}</p>
        <h2 style={{ ...textStyle, fontSize: '18px', fontWeight: 700, margin: '16px 0 4px', color: accent }}>Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ ...textStyle, fontWeight: 600 }}>{exp.role} — {exp.company}</div>
            <div style={{ ...subtleStyle, fontSize: '13px' }}>{exp.start} – {exp.end}</div>
            <ul style={{ ...subtleStyle, fontSize: '14px', marginTop: '4px', marginBottom: 0, paddingLeft: '18px' }}>
              {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
        <h2 style={{ ...textStyle, fontSize: '18px', fontWeight: 700, margin: '16px 0 4px', color: accent }}>Education</h2>
        {data.education.map((ed, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ ...textStyle, fontWeight: 600 }}>{ed.degree} — {ed.school}</div>
            <div style={{ ...subtleStyle, fontSize: '13px' }}>{ed.start} – {ed.end}</div>
          </div>
        ))}
        <h2 style={{ ...textStyle, fontSize: '18px', fontWeight: 700, margin: '16px 0 4px', color: accent }}>Skills</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {data.skills.map((s, i) => (
            <span key={i} style={{ ...textStyle, fontSize: '12px', border: `1px solid ${accent}`, color: accent, borderRadius: '6px', padding: '2px 8px' }}>{s}</span>
          ))}
        </div>
      </div>
    );
  }

  const updateArray = (arr: any[], setter: (v: any[]) => void, i: number, field: string, value: any) => {
    const copy = [...arr];
    copy[i] = { ...copy[i], [field]: value };
    setter(copy);
  };

  const handleAnalyze = async () => {
    if (!analyzeFile && !pastedResumeText.trim()) return;
    try {
      setAnalyzeLoading(true);
      setAnalyzeResult(null);
      let resp: Response;
      if (pastedResumeText.trim()) {
        resp = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: pastedResumeText.trim() })
        });
      } else {
        const fd = new FormData();
        if (analyzeFile) fd.append('file', analyzeFile);
        resp = await fetch('/api/resume/analyze', { method: 'POST', body: fd });
      }
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Analyze failed');
      const heuristic = json.heuristic || { score: json.score, strengths: json.strengths, improvements: json.improvements };
      setAnalyzeResult({ score: heuristic.score, strengths: heuristic.strengths || [], improvements: heuristic.improvements || [], textPreview: json.textPreview, ai: json.ai || null });
    } catch (e: any) {
      console.error('Analyze error:', e?.message || e);
      if (typeof window !== 'undefined') alert('Failed to analyze resume. Please try another PDF.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  if (step === "choose") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-2">Create Your Resume</h1>
            <p className="text-white/80">Pick a template that matches your style. You can customize everything later.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <ClassicTemplate data={defaultData} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Classic</div>
                  <div className="text-white/70 text-sm">Clean, ATS-friendly layout</div>
                </div>
                <button onClick={() => { setTemplate("classic"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <ModernTemplate data={defaultData} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Modern</div>
                  <div className="text-white/70 text-sm">Bold, two-column emphasis</div>
                </div>
                <button onClick={() => { setTemplate("modern"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <MinimalTemplate data={defaultData} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Minimal</div>
                  <div className="text-white/70 text-sm">Simple single-column focus</div>
                </div>
                <button onClick={() => { setTemplate("minimal"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <ElegantTemplate data={defaultData} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Elegant</div>
                  <div className="text-white/70 text-sm">Accent sidebar, structured sections</div>
                </div>
                <button onClick={() => { setTemplate("elegant"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            {/* Simple ATS */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <SimpleATSTemplate data={defaultData} accent={accent} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Simple ATS</div>
                  <div className="text-white/70 text-sm">Single column, ATS-friendly</div>
                </div>
                <button onClick={() => { setTemplate("simpleAts"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            {/* Corporate */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <CorporateTemplate data={defaultData} accent={accent} includePhoto />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Corporate</div>
                  <div className="text-white/70 text-sm">Sidebar with strong hierarchy</div>
                </div>
                <button onClick={() => { setTemplate("corporate"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            {/* Clear */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <ClearTemplate data={defaultData} accent="#10b981" includePhoto />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Clear</div>
                  <div className="text-white/70 text-sm">Two-column with accent header</div>
                </div>
                <button onClick={() => { setTemplate("clear"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
            {/* Precision ATS */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="bg-gray-200 rounded overflow-hidden mb-4">
                <div className="bg-white mx-auto" style={{ width: 420, minHeight: 594 }}>
                  <PrecisionATSTemplate data={defaultData} accent="#f59e0b" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Precision ATS</div>
                  <div className="text-white/70 text-sm">Minimal with sharp headings</div>
                </div>
                <button onClick={() => { setTemplate("precisionAts"); setStep("edit"); }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700">Use Template</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-[1400px] mx-auto px-6 py-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-white">Resume Builder</h1>
            <button onClick={() => setStep("choose")} className="text-sm text-white/80 hover:text-white">Change Template</button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-white mb-1">Template</label>
            <select value={template} onChange={e => setTemplate(e.target.value as TemplateId)} className="w-full rounded p-2 bg-white/10 text-white border border-white/20">
              <option className="text-black" value="classic">Classic</option>
              <option className="text-black" value="modern">Modern</option>
            </select>
          </div>
          <div className="space-y-3">
            <input className="w-full rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
            <input className="w-full rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
            <textarea className="w-full rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Summary" value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
              <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Phone" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
            </div>
            <input className="w-full rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
          </div>
          <div className="mt-4">
            <h2 className="font-semibold text-white mb-2">Links</h2>
            {data.links.map((l, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Label" value={l.label} onChange={e => updateArray(data.links, v => setData({ ...data, links: v }), i, 'label', e.target.value)} />
                <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="URL" value={l.url} onChange={e => updateArray(data.links, v => setData({ ...data, links: v }), i, 'url', e.target.value)} />
              </div>
            ))}
            <button className="text-sm text-blue-300 hover:text-white" onClick={() => setData({ ...data, links: [...data.links, { label: '', url: '' }] })}>+ Add link</button>
          </div>
          <div className="mt-4">
            <h2 className="font-semibold text-white mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.skills.map((s, i) => (
                <input key={i} className="rounded p-1 text-sm bg-white/10 text-white border border-white/20" value={s} onChange={e => updateArray(data.skills, v => setData({ ...data, skills: v }), i, '0', e.target.value)} />
              ))}
            </div>
            <button className="text-sm text-blue-300 hover:text-white" onClick={() => setData({ ...data, skills: [...data.skills, ''] })}>+ Add skill</button>
          </div>
          <div className="mt-4">
            <h2 className="font-semibold text-white mb-2">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="rounded p-3 mb-2 bg-white/10 border border-white/20">
                <input className="w-full rounded p-2 mb-1 bg-white/10 text-white border border-white/20" placeholder="Role" value={exp.role} onChange={e => updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'role', e.target.value)} />
                <input className="w-full rounded p-2 mb-1 bg-white/10 text-white border border-white/20" placeholder="Company" value={exp.company} onChange={e => updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'company', e.target.value)} />
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Start" value={exp.start} onChange={e => updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'start', e.target.value)} />
                  <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="End" value={exp.end} onChange={e => updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'end', e.target.value)} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">Bullets</h3>
                  {exp.bullets.map((b, j) => (
                    <input key={j} className="w-full rounded p-2 mb-1 bg-white/10 text-white border border-white/20" value={b} onChange={e => {
                      const bullets = [...exp.bullets];
                      bullets[j] = e.target.value;
                      updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'bullets', bullets);
                    }} />
                  ))}
                  <button className="text-sm text-blue-300 hover:text-white" onClick={() => {
                    const bullets = [...exp.bullets, ''];
                    updateArray(data.experience, v => setData({ ...data, experience: v }), i, 'bullets', bullets);
                  }}>+ Add bullet</button>
                </div>
              </div>
            ))}
            <button className="text-sm text-blue-300 hover:text-white" onClick={() => setData({ ...data, experience: [...data.experience, { company: '', role: '', start: '', end: '', bullets: [''] }] })}>+ Add experience</button>
          </div>
          <div className="mt-4">
            <h2 className="font-semibold text-white mb-2">Education</h2>
            {data.education.map((ed, i) => (
              <div key={i} className="rounded p-3 mb-2 bg-white/10 border border-white/20">
                <input className="w-full rounded p-2 mb-1 bg-white/10 text-white border border-white/20" placeholder="Degree" value={ed.degree} onChange={e => updateArray(data.education, v => setData({ ...data, education: v }), i, 'degree', e.target.value)} />
                <input className="w-full rounded p-2 mb-1 bg-white/10 text-white border border-white/20" placeholder="School" value={ed.school} onChange={e => updateArray(data.education, v => setData({ ...data, education: v }), i, 'school', e.target.value)} />
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Start" value={ed.start} onChange={e => updateArray(data.education, v => setData({ ...data, education: v }), i, 'start', e.target.value)} />
                  <input className="rounded p-2 bg-white/10 text-white border border-white/20" placeholder="End" value={ed.end} onChange={e => updateArray(data.education, v => setData({ ...data, education: v }), i, 'end', e.target.value)} />
                </div>
                <textarea className="w-full rounded p-2 bg-white/10 text-white border border-white/20" placeholder="Details" value={ed.details || ''} onChange={e => updateArray(data.education, v => setData({ ...data, education: v }), i, 'details', e.target.value)} />
              </div>
            ))}
            <button className="text-sm text-blue-300 hover:text-white" onClick={() => setData({ ...data, education: [...data.education, { school: '', degree: '', start: '', end: '' }] })}>+ Add education</button>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleDownloadPdf} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700">
              Download PDF
            </button>
            <button onClick={() => setExportMode(v => !v)} className="text-sm text-white/80 hover:text-white">
              {exportMode ? 'Exit Plain Export' : 'Plain Export Mode'}
            </button>
          </div>

        {/* Analyze existing resume */}
        <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Analyze existing resume (PDF)</h2>
          </div>
          <input
            type="file"
            accept="application/pdf"
            className="w-full rounded p-2 bg-white/10 text-white border border-white/20"
            onChange={(e) => setAnalyzeFile(e.target.files?.[0] || null)}
          />
          <div className="mt-3">
            <label className="block text-sm font-semibold text-white mb-1">Or paste resume text</label>
            <textarea
              className="w-full rounded p-2 bg-white/10 text-white border border-white/20 min-h-28"
              placeholder="Paste your resume text here to analyze without uploading a PDF"
              value={pastedResumeText}
              onChange={e => setPastedResumeText(e.target.value)}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={(!analyzeFile && !pastedResumeText.trim()) || analyzeLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700"
            >
              {analyzeLoading ? 'Analyzing…' : 'Analyze Resume'}
            </button>
            {analyzeResult && (
              <div className="text-white/90 text-sm">Score: <span className="font-bold">{analyzeResult.score}/100</span></div>
            )}
          </div>
          {analyzeResult && (
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white font-semibold mb-1">Strengths</div>
                <ul className="list-disc ml-5 text-white/90 text-sm">
                  {analyzeResult.strengths.length ? analyzeResult.strengths.map((s, i) => (<li key={i}>{s}</li>)) : <li>No major strengths detected.</li>}
                </ul>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="text-white font-semibold mb-1">Improvements</div>
                <ul className="list-disc ml-5 text-white/90 text-sm">
                  {analyzeResult.improvements.length ? analyzeResult.improvements.map((s, i) => (<li key={i}>{s}</li>)) : <li>No suggestions at this time.</li>}
                </ul>
              </div>
              {analyzeResult.ai && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">AI ATS Analysis</div>
                    {typeof analyzeResult.ai.score === 'number' && (
                      <div className="text-white/90 text-sm">AI Score: <span className="font-bold">{analyzeResult.ai.score}/100</span></div>
                    )}
                  </div>
                  {analyzeResult.ai.summary && (
                    <p className="text-white/80 text-sm mt-1">{analyzeResult.ai.summary}</p>
                  )}
                  {analyzeResult.ai.sectionScores && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-white/90 text-sm">
                      {Object.entries(analyzeResult.ai.sectionScores).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                          <span className="capitalize">{k}</span>
                          <span className="font-semibold">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {analyzeResult.ai.missingKeywords && analyzeResult.ai.missingKeywords.length > 0 && (
                    <div className="mt-2">
                      <div className="text-white font-semibold text-sm mb-1">Suggested keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {analyzeResult.ai.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/10 border border-white/20 text-white/90 text-xs rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analyzeResult.ai.strengths && analyzeResult.ai.strengths.length > 0 && (
                    <div className="mt-2">
                      <div className="text-white font-semibold text-sm mb-1">AI Strengths</div>
                      <ul className="list-disc ml-5 text-white/90 text-sm">
                        {analyzeResult.ai.strengths.map((s, i) => (<li key={i}>{s}</li>))}
                      </ul>
                    </div>
                  )}
                  {analyzeResult.ai.improvements && analyzeResult.ai.improvements.length > 0 && (
                    <div className="mt-2">
                      <div className="text-white font-semibold text-sm mb-1">AI Improvements</div>
                      <ul className="list-disc ml-5 text-white/90 text-sm">
                        {analyzeResult.ai.improvements.map((s, i) => (<li key={i}>{s}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {analyzeResult.textPreview && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="text-white font-semibold mb-1">Extracted preview</div>
                  <pre className="text-white/80 text-xs whitespace-pre-wrap max-h-48 overflow-auto">{analyzeResult.textPreview}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
        <div className="lg:col-span-7">
          <div className="bg-white/10 p-4 rounded-xl border border-white/20 sticky top-4 overflow-auto">
            <div ref={previewRef} id="resume-export" className="bg-white" style={{ width: 794, minHeight: 1123 }}>
              {exportMode ? <PlainTemplate data={data} /> : <Template data={data} />}
            </div>
          </div>
        </div>
        {/* Removed print CSS since we export via canvas->PDF */}
      </div>
    </div>
  );
}


