'use client';

import React from 'react';
import Link from 'next/link';
import { User, Globe2, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" />
          Interpreter Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          LANK AI workspace status and active language capabilities
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            LA
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              LANK AI Builder Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Local Development Environment • Multilingual Interpreter
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
              Dialect Coverage
            </p>
            <p className="text-sm font-semibold text-slate-100">
              80+ African & Global Dialects
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-1">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Active Backend
            </p>
            <p className="text-sm font-semibold text-slate-100">
              /api/interpret + Gemini API
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/workspace/live"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Return to Live Interpreter
          </Link>
        </div>
      </div>
    </div>
  );
}