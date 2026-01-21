'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClose?: () => void;
}

export function SearchBar({ onSearch, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar palabras clave o versículos..."
          className="w-full pl-12 pr-16 py-4 bg-slate-800/50 dark:bg-zinc-900/50 border border-slate-700 dark:border-zinc-800 rounded-2xl text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <span className="px-2 py-1 text-xs font-medium text-slate-400 dark:text-gray-400 bg-slate-700/50 dark:bg-zinc-800/50 rounded border border-slate-600 dark:border-zinc-700">
              ESC
            </span>
          </button>
        )}
      </div>
    </form>
  );
}
