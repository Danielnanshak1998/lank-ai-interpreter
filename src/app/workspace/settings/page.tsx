'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Volume2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [preferredEngine, setPreferredEngine] = useState('gemini');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const savedAutoSpeak = localStorage.getItem('lank_auto_speak');
    const savedEngine = localStorage.getItem('lank_preferred_engine');
    if (savedAutoSpeak === 'true') setAutoSpeak(true);
    if (savedEngine) setPreferredEngine(savedEngine);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lank_auto_speak', String(autoSpeak));
    localStorage.setItem('lank_preferred_engine', preferredEngine);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure translation engine preferences and voice output behavior
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Translation Engine
          </label>
          <select
            value={preferredEngine}
            onChange={(e) => setPreferredEngine(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="gemini">Google Gemini API (Active)</option>
            <option value="natlas">N-ATLAS Engine (African &amp; Global Dialects)</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="space-y-0.5 pr-4">
            <p className="text-sm font-medium text-slate-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Auto-Pronounce Translations
            </p>
            <p className="text-xs text-slate-400">
              Automatically read translated output aloud as soon as translation finishes
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Preferences saved
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}