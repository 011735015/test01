import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client utility with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to generate dynamic stylized graphic if API key is absent or offline
function generateFallbackGraphicSvg(prompt: string, style: string): string {
  const cleanPrompt = prompt.replace(/[<>&"']/g, '').substring(0, 30);
  const colors = [
    { primary: '#f59e0b', secondary: '#ef4444', text: '#ffffff' },
    { primary: '#38bdf8', secondary: '#818cf8', text: '#ffffff' },
    { primary: '#10b981', secondary: '#059669', text: '#ffffff' },
    { primary: '#ec4899', secondary: '#8b5cf6', text: '#ffffff' },
  ];
  const color = colors[Math.abs(cleanPrompt.length) % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color.primary}" />
        <stop offset="100%" stop-color="${color.secondary}" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="500" height="500" fill="none" />
    <circle cx="250" cy="230" r="160" fill="none" stroke="url(#bgGrad)" stroke-width="8" stroke-dasharray="12,6" />
    <polygon points="250,90 380,310 120,310" fill="none" stroke="${color.primary}" stroke-width="6" />
    <circle cx="250" cy="230" r="70" fill="${color.secondary}" opacity="0.3" filter="url(#glow)" />
    <text x="250" y="240" font-family="sans-serif" font-weight="900" font-size="28" fill="${color.text}" text-anchor="middle" letter-spacing="4">
      ${cleanPrompt.toUpperCase() || 'CUSTOM GRAPHIC'}
    </text>
    <text x="250" y="275" font-family="sans-serif" font-weight="600" font-size="14" fill="#cbd5e1" text-anchor="middle" letter-spacing="6">
      ${style.toUpperCase() || 'STREETWEAR EDITION'}
    </text>
    <path d="M150 370 L350 370" stroke="${color.primary}" stroke-width="4" stroke-linecap="round" />
    <text x="250" y="420" font-family="sans-serif" font-weight="800" font-size="16" fill="${color.primary}" text-anchor="middle" letter-spacing="8">
      SCREENLAB STUDIO 2026
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// API: Generate Image from Prompt
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, style = 'streetwear', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'กรุณากรอกคำอธิบายภาพ (Prompt)' });
    }

    const enhancedPrompt = `${prompt}, ${style} style t-shirt graphic artwork, crisp vector print screen ready, isolated on pure clean solid background, sharp outlines, highly detailed, professional streetwear merchandise design`;

    // If GEMINI_API_KEY is provided, call Gemini SDK
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9') || '1:1',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
            return res.json({
              success: true,
              imageUrl,
              prompt,
              source: 'gemini',
            });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini generate image notice:', geminiError?.message);
        // Fall back to high quality stylized vector design if rate limited or key restricted
      }
    }

    // High quality instant fallback
    const fallbackUrl = generateFallbackGraphicSvg(prompt, style);
    return res.json({
      success: true,
      imageUrl: fallbackUrl,
      prompt,
      source: 'fallback',
      note: 'สร้างลายกราฟิกเวกเตอร์สำเร็จรูปพร้อมสกรีน',
    });
  } catch (err: any) {
    console.error('Error generating image:', err);
    res.status(500).json({ error: err?.message || 'เกิดข้อผิดพลาดในการสร้างภาพ' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
