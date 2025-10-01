"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  prompt: string;
  starterHtml?: string;
  starterCss?: string;
  starterJs?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function Editor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-[180px]">
      <div className="text-xs uppercase tracking-wide text-white/60 mb-2">{label}</div>
      <textarea
        className="flex-1 rounded-lg bg-[#0f131a] text-white/90 p-3 font-mono text-sm ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const storageKey = `fp_${params.id}`;
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const jsRef = useRef<HTMLTextAreaElement>(null);
  const [pane, setPane] = useState<number>(50);

  // Fetch problem data
  useEffect(() => {
    fetch(`${API_URL}/problems/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        const prob = data.problem;
        setProblem(prob);
        
        // Load from localStorage or use starter code
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const saved = JSON.parse(raw) as { html: string; css: string; js: string };
            setHtml(saved.html);
            setCss(saved.css);
            setJs(saved.js);
          } else {
            setHtml(prob.starterHtml || "<div id=app>hello</div>");
            setCss(prob.starterCss || "body{font-family:system-ui}");
            setJs(prob.starterJs || "console.log('ready')");
          }
        } catch {
          setHtml(prob.starterHtml || "<div id=app>hello</div>");
          setCss(prob.starterCss || "body{font-family:system-ui}");
          setJs(prob.starterJs || "console.log('ready')");
        }
        
        // Load pane setting
        const savedPane = localStorage.getItem(`${storageKey}_pane`);
        if (savedPane) {
          const val = Number(savedPane);
          if (Number.isFinite(val) && val >= 20 && val <= 80) {
            setPane(val);
          }
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [params.id, storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (problem) {
      const data = JSON.stringify({ html, css, js });
      localStorage.setItem(storageKey, data);
    }
  }, [html, css, js, storageKey, problem]);

  // Save pane width
  useEffect(() => {
    if (problem) {
      localStorage.setItem(`${storageKey}_pane`, String(pane));
    }
  }, [pane, storageKey, problem]);

  // Capture console logs from iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as any;
      if (data && data.type === 'fp-log') {
        setLogs((prev) => [...prev, String(data.payload)]);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const getAiReview = () => {
    // Simulate AI review
    const reviews = [
      "✓ Good use of modern JavaScript. Consider adding error handling for edge cases.",
      "✓ Clean code structure. Tip: Add JSDoc comments for better documentation.",
      "✓ Performance looks good. Consider memoization if this runs frequently.",
      "✓ Nice implementation! For interviews, explain your time/space complexity.",
    ];
    setAiReview(reviews[Math.floor(Math.random() * reviews.length)]);
  };

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Loading problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white flex items-center justify-center">
        <p>Problem not found</p>
      </div>
    );
  }

  const srcDoc = `<!doctype html>\n<html>\n<head><style>${css}</style><script>\n(function(){\n  const parent = window.parent;\n  const origLog = console.log;\n  console.log = function(){\n    try{ parent.postMessage({type:'fp-log', payload: Array.from(arguments).map(String).join(' ')}, '*'); }catch(e){}\n    origLog.apply(console, arguments);\n  };\n})();\n<\/script></head>\n<body>${html}<script>${js}<\/script></body>\n</html>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1144] via-[#3a1670] to-[#6a2fb5] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold">{problem.title}</h1>
          <div className="flex items-center gap-3">
            <button onClick={getAiReview} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 text-sm font-medium">
              Get AI Review
            </button>
            <span className="text-sm text-white/80">{problem.difficulty}</span>
          </div>
        </div>
        <p className="mt-2 text-white/80">{problem.prompt}</p>

        {aiReview && (
          <div className="mt-4 p-4 rounded-lg bg-[#2ad17e]/15 ring-1 ring-[#2ad17e]/30 text-white">
            <div className="flex items-start gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="font-semibold text-sm">AI Code Review</p>
                <p className="mt-1 text-sm">{aiReview}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Editor label="HTML" value={html} onChange={setHtml} />
            <Editor label="CSS" value={css} onChange={setCss} />
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="text-xs uppercase tracking-wide text-white/60 mb-2 flex items-center justify-between">
                <span>JavaScript</span>
                <SnippetBar onInsert={(code)=>{
                  const el = jsRef.current;
                  if(!el){ setJs((prev)=> prev + "\n" + code); return; }
                  const start = el.selectionStart ?? el.value.length;
                  const end = el.selectionEnd ?? el.value.length;
                  const next = el.value.slice(0,start) + code + el.value.slice(end);
                  setJs(next);
                  requestAnimationFrame(()=>{
                    el.focus();
                    const pos = start + code.length;
                    el.setSelectionRange(pos,pos);
                  });
                }} />
              </div>
              <textarea
                ref={jsRef}
                className="flex-1 rounded-lg bg-[#0f131a] text-white/90 p-3 font-mono text-sm ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                value={js}
                onChange={(e) => setJs(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-[#0f131a] flex flex-col">
            <div className="px-4 py-2 text-sm text-white/70 border-b border-white/10 flex items-center justify-between">
              <span>Live Preview</span>
              <button onClick={() => setLogs([])} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Clear Logs</button>
            </div>
            <div className="flex flex-col lg:flex-row items-stretch">
              <div className="w-full lg:w-auto" style={{ width: "100%", maxWidth: "100%" }}>
                <iframe ref={iframeRef} className="w-full" style={{ height: 420, ...(typeof window!=="undefined" && window.innerWidth>=1024 ? { height: 500 } : {}) }} sandbox="allow-scripts" srcDoc={srcDoc} />
              </div>
              <div
                className="hidden lg:block resize-handle"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startPane = pane;
                  const container = (e.currentTarget.parentElement as HTMLElement);
                  const onMove = (ev: MouseEvent) => {
                    const containerWidth = container.getBoundingClientRect().width;
                    const delta = ev.clientX - startX;
                    const newPane = Math.min(80, Math.max(20, startPane + (delta / containerWidth) * 100));
                    setPane(newPane);
                  };
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              />
              <div className="w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0b0f14] p-3 overflow-auto font-mono text-xs text-white/80" style={{ width: "100%", ...(typeof window!=="undefined" && window.innerWidth>=1024 ? { width: `${pane}%` } : {}) }}>
                {logs.length === 0 ? <div className="text-white/40">console.log output will appear here</div> : (
                  <ul className="space-y-2">{logs.map((l, i) => <li key={i}>› {l}</li>)}</ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnippetBar({ onInsert }: { onInsert: (code: string) => void }) {
  const snippets: { label: string; code: string }[] = [
    {
      label: "React Component",
      code: `function App(){\n  const [count,setCount] = React.useState(0);\n  return React.createElement('button',{onClick:()=>setCount(c=>c+1)}, 'Count: '+count);\n}\nconst root = document.getElementById('app');\nReactDOM.createRoot(root).render(React.createElement(App));`,
    },
    {
      label: "React useEffect",
      code: `React.useEffect(()=>{\n  console.log('mounted');\n  return ()=>console.log('unmounted');\n},[]);`,
    },
    {
      label: "React Native StyleSheet",
      code: `const styles = { container: { flex:1, justifyContent:'center', alignItems:'center' } };`,
    },
  ];
  return (
    <div className="flex items-center gap-2">
      {snippets.map((s) => (
        <button key={s.label} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15" onClick={() => onInsert('\n'+s.code+'\n')}>
          {s.label}
        </button>
      ))}
    </div>
  );
}


