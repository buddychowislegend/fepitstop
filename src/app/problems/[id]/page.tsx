"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { notFound, useParams } from "next/navigation";

type Problem = {
  id: string;
  title: string;
  difficulty: string;
  prompt: string;
  starterHtml?: string;
  starterCss?: string;
  starterJs?: string;
  tags?: string[];
  timeLimit?: string;
  completionCount?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases?: Array<{
    input: string;
    expected: string;
    actual?: string;
    passed?: boolean;
  }>;
};

import { api } from "@/lib/config";

// Load Monaco client-side only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function CodeEditor({ value, onChange, language = "javascript" }: { 
  value: string; 
  onChange: (v: string) => void; 
  language?: string;
}) {
  // Register a lightweight completion provider when Monaco mounts
  function handleMount(editor: any, monaco: any) {
    const suggestions = [
      {
        label: 'console.log',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "console.log(${1:msg});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Log to console',
      },
      {
        label: 'map',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "${1:arr}.map((${2:item}) => ${3:item});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Array.map snippet',
      },
      {
        label: 'filter',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "${1:arr}.filter((${2:item}) => ${3:condition});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Array.filter snippet',
      },
      {
        label: 'reduce',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "${1:arr}.reduce((${2:acc}, ${3:item}) => ${4:acc}, ${5:init});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Array.reduce snippet',
      },
      {
        label: 'qs',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "document.querySelector('${1:selector}')",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'document.querySelector',
      },
      {
        label: 'qsa',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "document.querySelectorAll('${1:selector}')",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'document.querySelectorAll',
      },
      {
        label: 'addevent',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "${1:el}.addEventListener('${2:event}', (${3:e}) => {\n  ${4:// ...}\n});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'addEventListener',
      },
      {
        label: 'fetch',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "fetch('${1:/api}', { method: '${2:GET}' }).then(r => r.json()).then(data => {\n  console.log(data);\n});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'fetch JSON',
      },
    ];

    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: () => {
        return { suggestions };
      },
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Language:</span>
            <span className="bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20">JavaScript</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={(v) => onChange(v ?? '')}
          theme="vs-dark"
          options={{
            automaticLayout: true,
            wordWrap: "on",
            minimap: { enabled: false },
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: true, strings: true },
            tabSize: 2,
            fontLigatures: true,
          }}
          onMount={handleMount}
        />
      </div>
    </div>
  );
}

function TestCases({ testCases, results }: { 
  testCases: Array<{ input: string; expected: string; actual?: string; passed?: boolean; }>;
  results?: Array<{ input: string; expected: string; actual?: string; passed?: boolean; }>;
}) {
  const displayCases = results || testCases;
  const hasResults = results && results.length > 0;
  const passedCount = hasResults ? results.filter(r => r.passed).length : 0;
  const totalCount = hasResults ? results.length : testCases.length;
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Test Cases</h3>
          {hasResults && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                passedCount === totalCount ? 'text-green-300' : 'text-red-300'
              }`}>
                {passedCount}/{totalCount} passed
              </span>
              {passedCount === totalCount ? (
                <span className="text-green-300">🎉</span>
              ) : (
                <span className="text-red-300">❌</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {displayCases.map((testCase, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Test Case {index + 1}</span>
              {testCase.passed !== undefined && (
                <span className={`text-xs px-2 py-1 rounded ${
                  testCase.passed 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {testCase.passed ? '✓ Passed' : '✗ Failed'}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/60">Input:</span>
                <pre className="text-white bg-[#0f131a] p-2 rounded mt-1 font-mono text-xs">
                  {testCase.input}
                </pre>
              </div>
              <div>
                <span className="text-white/60">Expected:</span>
                <pre className="text-white bg-[#0f131a] p-2 rounded mt-1 font-mono text-xs">
                  {testCase.expected}
                </pre>
              </div>
              {testCase.actual && (
                <div>
                  <span className="text-white/60">Actual:</span>
                  <pre className={`p-2 rounded mt-1 font-mono text-xs ${
                    testCase.passed 
                      ? 'text-green-300 bg-green-500/10' 
                      : 'text-red-300 bg-red-500/10'
                  }`}>
                    {testCase.actual}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
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
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual?: string; passed?: boolean; }>>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'testcases'>('code');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // Run test cases
  const runTests = () => {
    if (!problem?.testCases) return;
    
    setIsRunning(true);
    setTestResults([]); // Clear previous results
    setActiveTab('testcases'); // Switch to test cases tab to show results
    
    // Execute tests with a small delay to show loading state
    setTimeout(() => {
      try {
        const results = problem.testCases!.map((testCase, index) => {
          try {
            // Create a sandboxed execution environment
            const executeCode = (code: string, inputs: any[]) => {
              // Wrap the user's code in a function and execute it
              const wrappedCode = `
                (function() {
                  ${code}
                  // Try to find the main function or return the last expression
                  if (typeof solution !== 'undefined') return solution;
                  if (typeof twoSum !== 'undefined') return twoSum;
                  if (typeof counter !== 'undefined') return counter;
                  if (typeof createCounter !== 'undefined') return createCounter;
                  
                  // If no named function, try to execute the code directly
                  return eval(${JSON.stringify(code)});
                })()
              `;
              
              return new Function('return ' + wrappedCode)();
            };

            // Parse input based on problem type
            let parsedInput;
            try {
              parsedInput = JSON.parse(testCase.input);
            } catch {
              parsedInput = testCase.input; // Use as string if not JSON
            }

            let actual;
            let expected = testCase.expected;

            // Handle different problem types with specific logic
            if (problem.id === 'closure-counter' || problem.id === 'counter') {
              // For closure problems, expect a function that returns a counter
              const userFunction = new Function('return ' + js)();
              
              if (typeof userFunction !== 'function') {
                return {
                  input: testCase.input,
                  expected: testCase.expected,
                  actual: 'Error: Code should return a function',
                  passed: false
                };
              }
              
              // Call the function multiple times to test counter behavior
              const expectedCount = parseInt(testCase.expected);
              let result = -1;
              for (let i = 0; i <= expectedCount; i++) {
                result = userFunction();
              }
              
              actual = result.toString();
              const passed = actual === expected;
              
              return {
                input: testCase.input,
                expected,
                actual,
                passed
              };
              
            } else if (problem.id === 'two-sum') {
              // For two-sum, expect array input and array output
              const [nums, target] = parsedInput;
              const userFunction = new Function('return ' + js)();
              const result = userFunction(nums, target);
              
              actual = JSON.stringify(result);
              const passed = actual === expected;
              
              return {
                input: testCase.input,
                expected,
                actual,
                passed
              };
              
            } else {
              // Generic test case handling
              const userFunction = new Function('return ' + js)();
              
              if (Array.isArray(parsedInput)) {
                actual = userFunction(...parsedInput);
              } else {
                actual = userFunction(parsedInput);
              }
              
              // Handle different output types
              if (typeof actual === 'object' && actual !== null) {
                actual = JSON.stringify(actual);
              } else {
                actual = String(actual);
              }
              
              const passed = actual === expected;
              
              return {
                input: testCase.input,
                expected,
                actual,
                passed
              };
            }
            
          } catch (error) {
            return {
              input: testCase.input,
              expected: testCase.expected,
              actual: `Error: ${error instanceof Error ? error.message : String(error)}`,
              passed: false
            };
          }
        });
        
        setTestResults(results);
        
        // Show summary in console
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        console.log(`Test Results: ${passedCount}/${totalCount} passed`);
        
        if (passedCount === totalCount) {
          console.log('🎉 All tests passed!');
        } else {
          console.log(`❌ ${totalCount - passedCount} test(s) failed`);
        }
        
      } catch (error) {
        console.error('Test execution error:', error);
        setTestResults([{
          input: 'All tests',
          expected: 'Success',
          actual: `Execution Error: ${error instanceof Error ? error.message : String(error)}`,
          passed: false
        }]);
      }
      
      setIsRunning(false);
    }, 500); // Reduced delay for better UX
  };

  // Submit solution
  const submitSolution = async () => {
    if (!problem || !js.trim()) {
      setSubmissionStatus('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus(null);

    try {
      const token = localStorage.getItem('fp_token');
      if (!token) {
        setSubmissionStatus('Please log in to submit solutions');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(api('/submissions/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemId: problem.id,
          solution: js,
          language: 'javascript',
          testResults: testResults
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsCompleted(true);
        setSubmissionStatus('✅ Solution submitted successfully!');
        
        // Update localStorage to track completion
        const completedProblems = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
        if (!completedProblems.includes(problem.id)) {
          completedProblems.push(problem.id);
          localStorage.setItem('fp_completed_problems', JSON.stringify(completedProblems));
        }
        
        // Show success message for 3 seconds
        setTimeout(() => {
          setSubmissionStatus(null);
        }, 3000);
      } else {
        setSubmissionStatus(`❌ ${data.error || 'Failed to submit solution'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if problem is completed
  const checkCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('fp_token');
      if (!token) return;

      // First check localStorage
      const completedProblems = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
      if (completedProblems.includes(params.id)) {
        setIsCompleted(true);
        return;
      }

      // Then try server
      const response = await fetch(api(`/submissions/completed/${params.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsCompleted(data.completed);
        
        // If server says completed, update localStorage
        if (data.completed && !completedProblems.includes(params.id)) {
          completedProblems.push(params.id);
          localStorage.setItem('fp_completed_problems', JSON.stringify(completedProblems));
        }
      }
    } catch (error) {
      console.error('Error checking completion status:', error);
      
      // Fallback to localStorage
      const completedProblems = JSON.parse(localStorage.getItem('fp_completed_problems') || '[]');
      setIsCompleted(completedProblems.includes(params.id));
    }
  };

  // Fetch problem data
  useEffect(() => {
            fetch(api(`/problems/${params.id}`))
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
        
        // Check completion status after loading problem
        checkCompletionStatus();
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
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Navigation */}
        <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-4">
          <button className="text-white font-medium border-b-2 border-[#2ad17e] pb-1">
            Description
          </button>
          <button className="text-white/60 hover:text-white font-medium">
            Solution
          </button>
          <button className="text-white/60 hover:text-white font-medium">
            Submissions
          </button>
          <button className="ml-auto text-white/60 hover:text-white">
            <span className="text-lg">+</span>
          </button>
        </div>

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

        {submissionStatus && (
          <div className={`mt-4 p-4 rounded-lg ring-1 text-white ${
            submissionStatus.includes('✅') 
              ? 'bg-green-500/15 ring-green-400/30' 
              : submissionStatus.includes('❌')
              ? 'bg-red-500/15 ring-red-400/30'
              : 'bg-yellow-500/15 ring-yellow-400/30'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {submissionStatus.includes('✅') ? '✅' : 
                 submissionStatus.includes('❌') ? '❌' : '⚠️'}
              </span>
              <p className="text-sm font-medium">{submissionStatus}</p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/15 ring-1 ring-green-400/30 text-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <div>
                <p className="font-semibold text-sm">Problem Completed!</p>
                <p className="mt-1 text-sm">Great job! This problem has been marked as completed.</p>
              </div>
            </div>
          </div>
        )}


        {/* Main Content Layout */}
        <div className="mt-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Problem Statement */}
            <div className="space-y-6">
              {/* Problem Description */}
              <div className="bg-white/10 rounded-lg p-6 ring-1 ring-white/15">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">&lt;/&gt; JS TS</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="text-sm text-white/60">{problem.timeLimit || '10mins'}</span>
                    <span className="text-sm text-white/60">{problem.completionCount || '1.2k done'}</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4">{problem.title}</h2>
                <p className="text-white/80 leading-relaxed">{problem.prompt}</p>
              </div>

              {/* Examples Section */}
              {problem.examples && problem.examples.length > 0 && (
                <div className="bg-white/10 rounded-lg p-6 ring-1 ring-white/15">
                  <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="mb-4">
                      <div className="mb-2">
                        <span className="text-white/60 text-sm">Example {index + 1}:</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-white/60 text-sm">Input:</span>
                          <pre className="text-white bg-[#0f131a] p-3 rounded mt-1 font-mono text-sm">
                            {example.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Output:</span>
                          <pre className="text-white bg-[#0f131a] p-3 rounded mt-1 font-mono text-sm">
                            {example.output}
                          </pre>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-white/60 text-sm">Explanation:</span>
                            <p className="text-white/80 text-sm mt-1">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Asked at companies section */}
              <div className="bg-white/10 rounded-lg p-6 ring-1 ring-white/15">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-white">Asked at these companies</h3>
                  <span className="text-xs text-white/60">🔒</span>
                </div>
                <p className="text-white/60 text-sm mb-4">Premium Feature</p>
                <button className="px-4 py-2 bg-[#2ad17e] text-[#0e1a12] text-sm rounded hover:opacity-90 font-medium">
                  View plans
                </button>
              </div>
            </div>

            {/* Right Panel - Code Editor */}
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg overflow-hidden ring-1 ring-white/15">
                {/* Tab Header */}
                <div className="flex items-center bg-white/5 border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'code'
                        ? 'text-white bg-white/10 border-b-2 border-[#2ad17e]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setActiveTab('testcases')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'testcases'
                        ? 'text-white bg-white/10 border-b-2 border-[#2ad17e]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Test cases
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'code' ? (
                  <div className="h-[500px]">
                    <CodeEditor value={js} onChange={setJs} />
                  </div>
                ) : (
                  <div className="h-[500px]">
                    <TestCases 
                      testCases={problem.testCases || []} 
                      results={testResults.length > 0 ? testResults : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg ring-1 ring-white/15">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>All practice questions</span>
                  <span className="text-white/40">•</span>
                  <span>2/291</span>
                  <button className="ml-2 text-white/60 hover:text-white">‹</button>
                  <button className="text-white/60 hover:text-white">›</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white">
                    <span>✓</span>
                    Mark complete
                  </button>
                  <button 
                    onClick={runTests}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[#2ad17e] hover:opacity-90 disabled:opacity-50 rounded font-medium"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Running tests...</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Run</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={submitSolution}
                    disabled={isSubmitting || isCompleted}
                    className={`px-4 py-2 text-sm text-white rounded font-medium ${
                      isCompleted 
                        ? 'bg-green-500 cursor-not-allowed' 
                        : isSubmitting
                        ? 'bg-yellow-500 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <span>✓</span>
                        <span>Completed</span>
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Run tests / Console section */}
              <div className="bg-white/10 rounded-lg overflow-hidden ring-1 ring-white/15">
                <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                  <span className="text-white font-medium">Run tests / Console</span>
                </div>
                <div className="h-32 overflow-auto p-3 font-mono text-xs text-white/80">
                  {logs.length === 0 ? (
                    <div className="text-white/40">console.log output will appear here</div>
                  ) : (
                    <ul className="space-y-1">
                      {logs.map((log, i) => (
                        <li key={i} className="text-[#2ad17e]">› {log}</li>
                      ))}
                    </ul>
                  )}
                </div>
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


