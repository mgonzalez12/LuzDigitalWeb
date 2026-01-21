'use client';

import { FastNavigation } from '@/components/FastNavigation';
import { VerseSearchBar } from '@/components/VerseSearchBar';
import { Sidebar } from '@/components/Sidebar';

export default function BusquedaPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="flex-1 lg:ml-64 relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        {/* Verse Search Bar */}
        <div className="w-full mb-12 animate-fade-in">
          <VerseSearchBar />
        </div>

        {/* Fast Navigation */}
        <div className="w-full mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <FastNavigation />
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Luz Digital • Advanced Bible Engine
          </p>
        </div>
      </div>
    </div>
  );
}
