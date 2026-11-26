'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Volume2, BookmarkX } from 'lucide-react';
import {
  getTranslationRecords,
  toggleSavedRecord,
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

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<TranslationRecord[]>([]);

  useEffect(() => {
    setSavedItems(getTranslationRecords().filter((item) => item.saved));
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

  const handleUnsave = (id: string) => {
    const updated = toggleSavedRecord(id);
    setSavedItems(updated.filter((item) => item.saved));
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          Saved Phrases
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Bookmarked translations for quick reference and voice playback
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-300 font-medium">
            No saved phrases yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click Save after translating on the Live tab—or bookmark any item in History—to pin it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-medium text-amber-300">
                  {getLangLabel(item.sourceLang)} → {getLangLabel(item.targetLang)}
                </span>
                <p className="text-xs text-slate-400">{item.sourceText}</p>
                <p className="text-base font-medium text-white">
                  {item.translatedText}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
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
                  onClick={() => handleUnsave(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <BookmarkX className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}