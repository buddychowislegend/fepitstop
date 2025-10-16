import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import path from 'path';
import fs from 'fs';
import puppeteerCore from 'puppeteer-core';
import type { Browser } from 'puppeteer-core';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { html, width = 794, height = 1123 } = await req.json();
    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'Missing html' }, { status: 400 });
    }

    // Prefer Sparticuz Chromium path (Vercel/serverless). If unavailable, use CHROME_EXECUTABLE_PATH for local dev
    let browser: Browser;
    if (process.env.VERCEL) {
      // Try to set Brotli path if the chromium bin directory is bundled
      try {
        const brDir = path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium', 'bin');
        if (fs.existsSync(brDir)) {
          (chromium as any).setBrotliPath?.(brDir);
        }
      } catch {}
      // Serverless (Vercel): use Sparticuz Chromium
      const execPath = await chromium.executablePath();
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width, height, deviceScaleFactor: 2 },
        executablePath: execPath,
        headless: true,
      });
    } else {
      // Local dev: use full puppeteer bundled Chromium
      const puppeteer = await import('puppeteer');
      const execPath = (puppeteer as any).executablePath();
      browser = await puppeteerCore.launch({
        executablePath: execPath,
        headless: true,
        args: ['--no-sandbox']
      });
    }

    const page = await browser.newPage();
    // Inline HTML with Tailwind styles supported via <style> computed by the client
    await page.setContent(html, { waitUntil: 'networkidle0' as any });
    // Give fonts a tick to render
    await page.evaluateHandle('document.fonts.ready');
    const pdf = await page.pdf({
      printBackground: true,
      width: `${width}px`,
      height: `${height}px`,
      preferCSSPageSize: true,
    });
    await browser.close();

    const buffer = Buffer.from(pdf);
    return new Response(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"'
      }
    }) as any;
  } catch (e: any) {
    const msg = e?.message || String(e);
    console.error('resume pdf error:', msg);
    return NextResponse.json({ error: 'Failed to render PDF', detail: msg }, { status: 500 });
  }
}


