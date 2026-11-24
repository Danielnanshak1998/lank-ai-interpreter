'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, Clock, Bookmark, Settings, User, Globe2 } from 'lucide-react';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Live', href: '/workspace/live', icon: Mic },
    { name: 'History', href: '/workspace/history', icon: Clock },
    { name: 'Saved', href: '/workspace/saved', icon: Bookmark },
    { name: 'Settings', href: '/workspace/settings', icon: Settings },
    { name: 'Profile', href: '/workspace/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur p-4">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">LANK AI</h1>
            <p className="text-xs text-slate-400">Multilingual Interpreter</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">N-ATLAS Engine</p>
          <p className="mt-0.5">80+ African & Global Dialects Active</p>
        </div>
      </aside>

      {/* Main Workspace Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile 5-Tab Bottom Dock */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 px-4 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}