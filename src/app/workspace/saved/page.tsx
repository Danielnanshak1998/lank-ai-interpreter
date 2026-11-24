'use client';

import React from 'react';
import Link from 'next/link';
import { Bookmark, Volume2, ArrowRight } from 'lucide-react';

export default function SavedPage() {
  const starterPhrases = [
    {
      sourceLabel: 'English',
      targetLabel: 'Hausa',
      sourceText: 'Good morning, how are you doing today?',
      targetText: 'Barka da safiya, ya kake / ya kike yau?',
    },
    {
      sourceLabel: 'English',
      targetLabel: 'Yoruba',
      sourceText: 'Thank you very much for your help.',
      targetText: 'E se pupo fun iranlowo yin.',
    },
  ];

  const handleSpeak = (text: string, lang = 'en-NG') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-indigo-400" />
            Saved Phrases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quick-reference phrases and interpretations for fast access
          </p>
        </div>

        <Link
          href="/workspace/live"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          Open Live Interpreter
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {starterPhrases.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-indigo-400">
                {item.sourceLabel} → {item.targetLabel}
              </div>
              <p className="text-sm text-slate-300">{item.sourceText}</p>
              <p className="text-base font-medium text-white pt-1 border-t border-slate-800/80">
                {item.targetText}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSpeak(item.sourceText, 'en-US')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Pronounce
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}