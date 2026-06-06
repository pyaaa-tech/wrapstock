/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization of Gemini SDK to prevent crashes if key is initially absent
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is missing. Please add it in the Settings secrets configuration panel.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// API: Check server health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Generate Gemini Analysis of Store Inventory
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { inventory, language } = req.body;
    const ai = getGemini();

    const systemInstruction = language === 'ms'
      ? 'Anda adalah Penasihat Sistem Inventori Koperasi Runcit Malaysia yang bijak dan teliti. Jawab bahasa secara eksklusif dalam Bahasa Melayu. Rujuk nama mata wang sebagai RM. Berikan nasihat ringkas dan bermanfaat.'
      : 'You are an intelligent Malaysian Retail Cooperative Inventory Consultant. Answer exclusively in English. Reference currencies as RM. Provide neat and action-oriented stock advisories.';

    const prompt = language === 'ms'
      ? `Sila analisa senarai stok inventori berikut dan keluarkan laporan bertulis dengan sub-topik mendatar Markdown:
         1. **Ringkasan Kesihatan Kedai** (Ulas peratusan barang kritikal, amaran, dan selamat)
         2. **Produk Berisiko Luput & Cadangan Diskaun** (Cadang diskaun peratus bagi barang luput dalam 3 hari)
         3. **Cadangan Pesanan Semula (Stok Rendah)**
         4. **Kelayakan Pematuhan Harga Siling KPDN**
         
         Senarai Stok:
         ${JSON.stringify(inventory, null, 2)}`
      : `Please analyze the following retail inventory records and output a structured Markdown report with headers:
         1. **Store Health Summary** (Analyze percentages of critical, warning, and safe inventory)
         2. **Products At Expiry Risk & Discount Strategy** (Suggest active percentage discounts for batches expiring <= 3 days)
         3. **Low Stock Restocking Guidance**
         4. **KPDN Ceiling Compliance Reviews**
         
         Stock Records:
         ${JSON.stringify(inventory, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || 'Error occurred during AI processing.' });
  }
});

// API: Standard Chat Conversation with Gemini
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, language } = req.body;
    const ai = getGemini();

    const systemInstruction = language === 'ms'
      ? 'Anda adalah asisten AI pintar WrapStock untuk koperasi kedai runcit Malaysia. Jawab soalan pengguna menggunakan bahasa melayu santun dan tepat. Berikan senarai ringkas sekiranya menerangkan strategi jualan.'
      : 'You are WrapStock Smart Core, a specialist assistant for small Malaysian shop vendors. Provide crisp business advice in English with highly readable layout styles.';

    // Construct simple query message
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ error: error?.message || 'Error executing AI speech turn.' });
  }
});

// Mounting Vite router
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WrapStock] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
