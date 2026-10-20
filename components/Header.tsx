'use client';

import React from 'react';
import { SupportedCurrency } from '@/lib/types';
import { DEFAULT_CURRENCIES } from '@/lib/currencies';
import { Disc, KeyRound, Trash2, HelpCircle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentCurrency: SupportedCurrency;
  onCurrencyChange: (curr: SupportedCurrency) => void;
  onOpenSettings: () => void;
  onClearCollection: () => void;
  onToggleMethodology: () => void;
  itemCount: number;
  hasCustomToken: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenSettings,
  onClearCollection,
  onToggleMethodology,
  itemCount,
  hasCustomToken,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#222222] dark:bg-[#1a1a1a] border-b border-[#111111] dark:border-[#2a2a2a] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Discogs Style Brand with Blue Vinyl Center */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#0275d8] dark:bg-[#1f6feb] text-white shadow-inner">
              <Disc className="w-5 h-5 text-white animate-spin [animation-duration:16s]" />
              <div className="absolute w-2 h-2 rounded-full bg-[#222222] dark:bg-[#1a1a1a]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white uppercase font-sans">
                Discogs <span className="font-normal text-gray-300 text-sm capitalize">Valuator</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-[#58a6ff] uppercase tracking-wider bg-[#333333] dark:bg-[#282828] px-2 py-0.5 rounded border border-[#444444] dark:border-[#383838]">
                Calculator
              </span>
            </div>
          </div>
        </div>

        {/* Actions & Currency */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Methodology Info Button */}
          <button
            onClick={onToggleMethodology}
            title="How Valuation is Calculated"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-200 hover:text-white bg-[#333333] hover:bg-[#3d3d3d] border border-[#444444] rounded transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="hidden md:inline">Grading Standards</span>
          </button>

          {/* Theme Toggle (Discogs Mobile App Dark Mode) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode (Discogs Mobile Theme)"}
            className="p-1.5 text-gray-200 hover:text-white bg-[#333333] hover:bg-[#3d3d3d] border border-[#444444] rounded transition-colors flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-300" />
            )}
          </button>

          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as SupportedCurrency)}
              className="appearance-none bg-[#333333] hover:bg-[#3d3d3d] text-white border border-[#444444] rounded px-3 py-1.5 text-[13px] font-medium focus:outline-none focus:border-[#0275d8] cursor-pointer pr-7 transition-colors"
            >
              {Object.values(DEFAULT_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="bg-[#222222] text-white">
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Settings / Token */}
          <button
            onClick={onOpenSettings}
            title="Configure Discogs API Token and Cache"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
              hasCustomToken
                ? 'bg-[#1b4329] border-[#2e7d32] text-[#81c784] hover:bg-[#215232]'
                : 'bg-[#333333] border-[#444444] text-gray-200 hover:bg-[#3d3d3d] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="hidden sm:inline">Settings</span>
            {hasCustomToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Clear Collection */}
          {itemCount > 0 && (
            <button
              onClick={onClearCollection}
              title="Clear all collection items"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#333333] rounded border border-transparent hover:border-[#444444] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
