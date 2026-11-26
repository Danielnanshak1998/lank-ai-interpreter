'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Volume2,
  Bookmark,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import {
  getTranslationRecords,
  toggleSavedRecord,
  deleteTranslationRecord,
  clearTranslationHistory,
  TranslationRecord,
} from '../../../lib/storage';
import { LANGUAGES } from '../../../lib/languages';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  pcm: 'en-NG',
  fr: 'fr-FR',
  ar: 'ar-SA',
  sw: 'sw-KE',
  es: 'es-ES',
  pt: 'pt-BR',
};

function getLangLabel(code: string): string {
  const found = LANGUAGES.find((l: any) => l.code === code);
  return found ? `${found.flag} ${found.name}` : code.toUpperCase();
}

export default function HistoryPage() {
  const [records, setRecords] = useState<TranslationRecord[]>([]);

  useEffect(() => {
    setRecords(getTranslationRecords());
  }, []);

  const handleSpeak = (text: string, lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE_MAP[lang] || lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSave = (id: string) => {
    setRecords(toggleSavedRecord(id));
  };

  const handleDelete = (id: string) => {
    setRecords(deleteTranslationRecord(id));
  };

  const handleClearAll = () => {
    clearTranslationHistory();
    setRecords([]);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Translation History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recent interpretations captured from your LANK AI workspace
          </p>
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800/50 text-xs font-medium text-slate-300 hover:text-red-300 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-300 font-medium">
            No translation history yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Run a translation on the Live tab and your session history will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-medium text-indigo-300">
                  {getLangLabel(item.sourceLang)} → {getLangLabel(item.targetLang)}
                </span>
                <span>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3 text-slate-300">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Source
                  </p>
                  {item.sourceText}
                </div>
                <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3 text-white">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    Translation
                  </p>
                  {item.translatedText}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(item.translatedText, item.targetLang)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  Pronounce
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSave(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                    item.saved
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      item.saved ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                  {item.saved ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-red-950/60 text-slate-400 hover:text-red-300 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}