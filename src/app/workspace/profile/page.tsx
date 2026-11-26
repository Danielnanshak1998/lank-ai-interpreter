'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  BarChart3,
  Bookmark,
  Zap,
  Globe,
  Database,
  HardDrive,
  Check,
  Edit3,
} from 'lucide-react';
import {
  fetchTranslationRecords,
  TranslationRecord,
} from '../../../lib/storage';
import { LANGUAGES } from '../../../lib/languages';

function getLangName(code: string): string {
  const found = LANGUAGES.find((l: any) => l.code === code);
  return found ? `${found.flag} ${found.name}` : code.toUpperCase();
}

export default function ProfilePage() {
  const [records, setRecords] = useState<TranslationRecord[]>([]);
  const [storageSource, setStorageSource] = useState<'postgres' | 'local'>('local');
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('LANK AI Workspace User');
  const [roleTitle, setRoleTitle] = useState('Multilingual Interpreter');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('lank_profile_name');
    const storedRole = localStorage.getItem('lank_profile_role');
    if (storedName) setDisplayName(storedName);
    if (storedRole) setRoleTitle(storedRole);

    fetchTranslationRecords()
      .then(({ records: data, source }) => {
        setRecords(data);
        setStorageSource(source);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lank_profile_name', displayName.trim() || 'LANK AI Workspace User');
    localStorage.setItem('lank_profile_role', roleTitle.trim() || 'Multilingual Interpreter');
    setIsEditingProfile(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const analytics = useMemo(() => {
    const totalCount = records.length;
    const savedCount = records.filter((r) => r.saved).length;

    const validLatencies = records
      .map((r) => r.latencyMs)
      .filter((ms): ms is number => typeof ms === 'number' && ms > 0);
    const avgLatency =
      validLatencies.length > 0
        ? Math.round(
            validLatencies.reduce((sum, val) => sum + val, 0) /
              validLatencies.length
          )
        : null;

    const pairCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};

    records.forEach((r) => {
      const pairKey = `${r.sourceLang}->${r.targetLang}`;
      pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
      targetCounts[r.targetLang] = (targetCounts[r.targetLang] || 0) + 1;
    });

    const sortedPairs = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]);
    const topPairRaw = sortedPairs[0]?.[0] || null;
    const topPairLabel = topPairRaw
      ? topPairRaw
          .split('->')
          .map((code) => getLangName(code))
          .join(' → ')
      : 'No sessions yet';

    const topTargets = Object.entries(targetCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({
        code,
        label: getLangName(code),
        count,
        percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }));

    return {
      totalCount,
      savedCount,
      avgLatency,
      topPairLabel,
      topTargets,
    };
  }, [records]);

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      {/* Header & Storage Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            Workspace Profile &amp; Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live session metrics and interpreter preferences
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border self-start sm:self-auto ${
            storageSource === 'postgres'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}
        >
          {storageSource === 'postgres' ? (
            <>
              <Database className="w-3.5 h-3.5" />
              PostgreSQL Synced
            </>
          ) : (
            <>
              <HardDrive className="w-3.5 h-3.5" />
              Local Browser Cache
            </>
          )}
        </span>
      </div>

      {/* User Identity Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Workspace Role
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  {displayName}
                </h2>
                <p className="text-xs text-slate-400">{roleTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  Updated
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Interpretations</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '—' : analytics.totalCount}
          </p>
          <p className="text-[11px] text-slate-500">Logged in session history</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Saved Phrases</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? '—' : analytics.savedCount}
          </p>
          <p className="text-[11px] text-slate-500">Pinned for quick playback</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg AI Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {loading
              ? '—'
              : analytics.avgLatency !== null
              ? `${analytics.avgLatency}ms`
              : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500">Gemini API response time</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Top Language Pair</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-sm font-semibold text-white pt-1 truncate">
            {loading ? '—' : analytics.topPairLabel}
          </p>
          <p className="text-[11px] text-slate-500">
            {LANGUAGES.length} supported languages
          </p>
        </div>
      </div>

      {/* Target Language Distribution */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Most Translated Target Languages
          </h3>
          <p className="text-xs text-slate-400">
            Distribution of your translated outputs across languages
          </p>
        </div>

        {analytics.topTargets.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            Translate a few phrases on the Live tab to populate your language analytics.
          </p>
        ) : (
          <div className="space-y-3">
            {analytics.topTargets.map((item) => (
              <div key={item.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{item.label}</span>
                  <span className="text-slate-400">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}