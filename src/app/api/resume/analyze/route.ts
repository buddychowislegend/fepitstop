import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

// Load pdf-parse via CommonJS to avoid ESM interop issues in Next route handlers
const require = createRequire(import.meta.url);
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  // Fallback if not available
  pdfParse = null;
}

function analyzeText(text: string) {
  const lengthScore = Math.min(40, Math.floor(text.split(/\s+/).length / 50));
  const keywords = [
    'React', 'JavaScript', 'TypeScript', 'Next.js', 'Tailwind', 'Node',
    'REST', 'GraphQL', 'Testing', 'Unit Test', 'Integration', 'CI/CD',
    'Performance', 'Accessibility', 'Web Vitals', 'Webpack', 'Vite', 'Design System'
  ];
  let keywordHits = 0;
  const lower = text.toLowerCase();
  for (const k of keywords) {
    if (lower.includes(k.toLowerCase())) keywordHits++;
  }
  const keywordScore = Math.min(40, keywordHits * 3);
  const contactPresent = /email|@|phone|linkedin|github/i.test(text) ? 10 : 0;
  const sectionsPresent = /(experience|work|projects|skills|education)/i.test(text) ? 10 : 0;
  const score = Math.min(100, lengthScore + keywordScore + contactPresent + sectionsPresent);
  const strengths: string[] = [];
  if (keywordScore > 20) strengths.push('Good alignment with modern frontend keywords');
  if (lengthScore > 20) strengths.push('Strong content volume');
  if (contactPresent) strengths.push('Contact and profiles included');
  if (sectionsPresent) strengths.push('Core resume sections present');
  const improvements: string[] = [];
  if (keywordScore < 20) improvements.push('Add more role-relevant keywords and frameworks');
  if (lengthScore < 20) improvements.push('Expand bullet points with measurable outcomes');
  if (!contactPresent) improvements.push('Include contact, LinkedIn/GitHub links');
  if (!sectionsPresent) improvements.push('Ensure sections: Experience, Projects, Skills, Education');
  return { score, strengths, improvements };
}

function isLikelyGibberish(input: string): boolean {
  if (!input) return true;
  // If it still starts with PDF header, it's binary
  if (input.startsWith('%PDF-')) return true;
  const len = input.length;
  if (len < 50) return true;
  let printable = 0;
  let letters = 0;
  for (let i = 0; i < len; i++) {
    const code = input.charCodeAt(i);
    const ch = input[i];
    if (code >= 32 && code <= 126) printable++;
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) letters++;
  }
  const printableRatio = printable / len;
  const letterRatio = letters / len;
  // Heuristics: low printable or very low letters indicate junk
  return printableRatio < 0.6 || letterRatio < 0.1;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let pastedText: string | null = null;
    let buf: Buffer | null = null;
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const textField = form.get('text');
      if (typeof textField === 'string' && textField.trim().length > 0) {
        pastedText = textField.trim();
      }
      const file = form.get('file');
      if (file && (file as any).arrayBuffer) {
        const blob = file as Blob;
        const b = Buffer.from(await blob.arrayBuffer());
        if (b?.length) buf = b;
      }
      if (!pastedText && !buf) {
        return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body.text === 'string' && body.text.trim().length > 0) {
        pastedText = body.text.trim();
      } else {
        return NextResponse.json({ error: 'Expected JSON with { text } or multipart with file' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Expected multipart/form-data or application/json' }, { status: 400 });
    }
    // Try pdf-parse
    let text = pastedText || '';
    let parserUsed: 'pdf-parse' | 'pdfjs-dist' | 'fallback' | 'ocr' | null = null;
    if (!text && pdfParse && buf) {
      try {
        const out = await pdfParse(buf as Buffer);
        text = out?.text || '';
        parserUsed = 'pdf-parse';
      } catch (e: any) {
        // Fall through to naive fallback below
      }
    }
    // If too little text, try pdfjs-dist extraction
    if ((!text || text.trim().length < 200) && buf) {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
        // Set worker to the ESM worker build if available
        try {
          const worker = await import('pdfjs-dist/build/pdf.worker.mjs');
          (pdfjs as any).GlobalWorkerOptions.workerSrc = (worker as any);
        } catch {}
        const loadingTask = (pdfjs as any).getDocument({
          data: buf as Buffer,
          useSystemFonts: true,
          standardFontDataUrl: undefined,
          cMapUrl: undefined,
          cMapPacked: true,
          disableFontFace: false,
        });
        const pdfDoc = await loadingTask.promise;
        let combined = '';
        const numPages = pdfDoc.numPages || 0;
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          const items = content.items || [];
          const pageText = items.map((it: any) => it.str || '').join(' ');
          combined += pageText + '\n';
        }
        if (combined.trim().length > (text?.trim().length || 0)) {
          text = combined;
          parserUsed = 'pdfjs-dist';
        }
      } catch (e) {
        // Ignore and keep existing text
      }
    }
    if (!text && buf) {
      // Basic fallback: attempt to decode as UTF-8 text (for some text-based PDFs)
      text = (buf as Buffer).toString('utf8');
      if (text) parserUsed = parserUsed || 'fallback';
    }

    // OCR fallback via OCR.Space API if still insufficient text or looks like gibberish
    const needsOcr = (!text || text.trim().length < 200 || isLikelyGibberish(text));
    let ocrAttempted = false;
    let ocrError: string | null = null;
    if (!pastedText && buf && needsOcr && process.env.OCR_SPACE_API_KEY) {
      try {
        console.log('[resume/analyze] OCR needed, attempting OCR.Space');
        ocrAttempted = true;
        const apiKey = process.env.OCR_SPACE_API_KEY as string;
        // Use base64 payload (more reliable with some PDFs)
        const base64 = Buffer.from(buf as Buffer).toString('base64');
        const params = new URLSearchParams();
        params.append('isOverlayRequired', 'false');
        params.append('OCREngine', '2');
        params.append('scale', 'true');
        params.append('language', 'eng');
        params.append('filetype', 'PDF');
        params.append('isCreateSearchablePdf', 'false');
        params.append('base64Image', `data:application/pdf;base64,${base64}`);
        const resp = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: { 'apikey': apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        console.log('[resume/analyze] OCR.Space status', resp.status);
        const json = await resp.json();
        const results = json?.ParsedResults?.[0];
        const parsedText = results?.ParsedText || '';
        if (parsedText && parsedText.trim().length > (text?.trim().length || 0)) {
          text = parsedText;
          parserUsed = 'ocr';
          console.log('[resume/analyze] OCR extracted chars', text.length);
        } else if (json?.ErrorMessage) {
          ocrError = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join(', ') : String(json.ErrorMessage);
          console.warn('[resume/analyze] OCR error message', ocrError);
        }
      } catch (e: any) {
        ocrError = e?.message || String(e);
        console.error('[resume/analyze] OCR exception', ocrError);
      }
    }
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 422 });
    }

    const result = analyzeText(text);

    // Gemini ATS-style analysis (optional, with graceful fallback)
    const apiKey = process.env.GEMINI_API_KEY;
    let aiScore: number | null = null;
    let aiStrengths: string[] | null = null;
    let aiImprovements: string[] | null = null;
    let aiMissingKeywords: string[] | null = null;
    let aiSectionScores: Record<string, number> | null = null;
    let aiSummary: string | null = null;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = `You are an experienced ATS and hiring partner. Analyze the following resume content and return a strict JSON object with these fields only: {"score": number 0-100, "strengths": string[], "improvements": string[], "missingKeywords": string[], "sectionScores": {"experience": number 0-100, "projects": number 0-100, "skills": number 0-100, "education": number 0-100}, "summary": string}. Focus on frontend/JS roles. Consider clarity, measurable impact, modern stack (React/Next/TypeScript/Tailwind/Testing), and seniority signals.
Resume text:\n\n${text.slice(0, 40000)}\n\nReturn JSON only.`;
        // simple retry logic
        let lastErr: any;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            const out = res.response?.text?.() || (res as any).response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonStart = out.indexOf('{');
            const jsonEnd = out.lastIndexOf('}');
            const jsonStr = jsonStart >= 0 && jsonEnd > jsonStart ? out.slice(jsonStart, jsonEnd + 1) : out;
            const parsed = JSON.parse(jsonStr);
            aiScore = typeof parsed.score === 'number' ? parsed.score : null;
            aiStrengths = Array.isArray(parsed.strengths) ? parsed.strengths : null;
            aiImprovements = Array.isArray(parsed.improvements) ? parsed.improvements : null;
            aiMissingKeywords = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : null;
            aiSectionScores = parsed.sectionScores && typeof parsed.sectionScores === 'object' ? parsed.sectionScores : null;
            aiSummary = typeof parsed.summary === 'string' ? parsed.summary : null;
            break;
          } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 500)); }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      textPreview: text.slice(0, 1000),
      textLength: text.length,
      parserUsed,
      ocrAttempted,
      ocrError,
      heuristic: { ...result },
      ai: apiKey ? {
        score: aiScore,
        strengths: aiStrengths,
        improvements: aiImprovements,
        missingKeywords: aiMissingKeywords,
        sectionScores: aiSectionScores,
        summary: aiSummary,
      } : null,
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return NextResponse.json({ error: 'Analyze failed', detail: msg }, { status: 500 });
  }
}


