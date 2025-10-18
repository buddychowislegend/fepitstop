"use client";
import { useState } from "react";

export default function CompanyAPITest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company/test');
      
      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
      } else {
        setResult({ success: false, error: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const testDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company/dashboard', {
        headers: {
          'X-Company-ID': 'hireog',
          'X-Company-Password': 'manasi22'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
      } else {
        const errorText = await response.text();
        setResult({ success: false, error: `HTTP ${response.status}: ${errorText}` });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Company API Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Test Basic API Connection
          </button>
          
          <button
            onClick={testDashboard}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Test Dashboard API
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-white/60">Testing API connection...</div>
        )}

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Result:</h2>
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 text-white/60">
          <p>Using Vercel API Routes (local)</p>
          <p>Test URL: /api/company/test</p>
        </div>
      </div>
    </div>
  );
}
