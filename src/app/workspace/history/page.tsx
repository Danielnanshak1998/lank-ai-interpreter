'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Mic } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            Translation History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recent interpretations from your LANK AI workspace session
          </p>
        </div>

        <Link
          href="/workspace/live"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors w-fit"
        >
          <Mic className="w-4 h-4" />
          New Interpretation
        </Link>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm font-medium text-slate-200">
          No recorded translations yet
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Run an interpretation on the Live page to review source phrases,
          translated outputs, engines used, and response latency here.
        </p>
        <div className="pt-2">
          <Link
            href="/workspace/live"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            Go to Live Voice Interpreter
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}