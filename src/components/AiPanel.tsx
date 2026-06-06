/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, RefreshCw, MessageCircleHeart, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types';
import { TRANSLATIONS } from '../utils';

interface AiPanelProps {
  language: 'ms' | 'en';
  inventory: InventoryItem[];
  themeMode?: 'light' | 'dark';
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export function AiPanel({ language, inventory, themeMode = 'light' }: AiPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[language];

  const handleSmartAnalysis = async () => {
    setAnalysisLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory,
          language
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisText(data.text);
      } else {
        throw new Error(data.error || 'Server responded with an error.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal menghubungi asisten AI Gemini pada pelayan.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          language
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
      } else {
        throw new Error(data.error || 'Chat server failure.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Chat error. Make sure your server is online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro Header */}
      <div className={`border rounded-xl p-6 shadow-sm transition-all duration-250 ${
        themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <h3 className={`text-xl font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-805' : 'text-white'}`}>
          <BrainCircuit className="h-6 w-6 text-emerald-555 animate-pulse" />
          {t.aiTitle}
        </h3>
        <p className={`text-sm mt-1 ${themeMode === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          {t.aiSubtitle}
        </p>

        {error && (
          <div className={`mt-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs border ${
            themeMode === 'light' ? 'bg-red-50 border-red-200 text-red-750 font-medium' : 'bg-red-955/40 border-red-900/60 text-red-200'
          }`}>
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <span className="font-bold">Gemini Service Notification:</span>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Stock Health Report Analyzer */}
        <div className={`border rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all duration-250 ${
          themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
              <h4 className={`font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                Draf Analisis Kesihatan Inventori
              </h4>
            </div>

            {analysisText ? (
              <div className={`prose prose-xs max-w-none font-sans leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 ${
                themeMode === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {analysisText}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center">
                <BrainCircuit className="h-12 w-12 text-slate-300 mb-3" />
                <p className="max-w-[320px]">Klik butang di bawah untuk menghantar senarai inventori aktif kepada Gemini bagi menjana ramalan luput dan cadangan nisbah diskaun jualan.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSmartAnalysis}
            disabled={analysisLoading}
            className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 tracking-wide cursor-pointer select-none transition-colors shadow-sm"
          >
            {analysisLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Menyediakan Laporan Gemini...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-950" />
                {t.generateAiAnalysis}
              </>
            )}
          </button>
        </div>

        {/* Right Side: Interactive business advisor chatbot chat */}
        <div className={`border rounded-xl p-6 shadow-sm flex flex-col h-[520px] transition-all duration-250 ${
          themeMode === 'light' ? 'bg-white border-slate-205' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className={`border-b pb-3 mb-4 shrink-0 ${themeMode === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
            <h4 className={`font-bold flex items-center gap-2 ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>
              <MessageCircleHeart className="h-5 w-5 text-emerald-500" />
              Sembang Penasihat Ritel (Coop Chat)
            </h4>
          </div>

          {/* Messages feed */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 rounded-tr-none font-bold'
                    : themeMode === 'light' 
                      ? 'bg-slate-100 border border-slate-150 text-slate-800 rounded-tl-none whitespace-pre-wrap' 
                      : 'bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none whitespace-pre-wrap'
                }`}>
                  <p className={`font-bold text-[10px] uppercase tracking-wider mb-1 select-none ${
                    m.sender === 'user' ? 'text-emerald-905' : 'text-slate-500'
                  }`}>
                    {m.sender === 'user' ? 'SAUDAGAR STAF' : 'GEMINI PENASIHAT'}
                  </p>
                  <span>{m.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className={`p-3 text-xs rounded-2xl rounded-tl-none border ${
                  themeMode === 'light' ? 'bg-slate-100 border-slate-150 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  Gemini sedang menyusun jawapan...
                </div>
              </div>
            )}
            {messages.length === 0 && (
              <div className="text-center py-20 text-slate-500 text-xs flex flex-col items-center">
                <BrainCircuit className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Tiada perbualan aktif dimulai.</p>
                <p className={`text-[11px] mt-1 max-w-[240px] ${themeMode === 'light' ? 'text-slate-500' : 'text-slate-600'}`}>Rundingkan had harga jualan maksimum, kuantiti stok, atau pelan kempen promosi diskaun.</p>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t.aiPlaceholder}
              className={`flex-1 border focus:border-emerald-555 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                themeMode === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-805 text-slate-205'
              }`}
              required
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="p-3 bg-emerald-500 text-slate-950 hover:bg-emerald-600 disabled:opacity-55 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
