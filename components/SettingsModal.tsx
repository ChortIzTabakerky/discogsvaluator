'use client';

import React, { useState } from 'react';
import { X, Key, Database, Check, ExternalLink, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSaveToken: (token: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  token,
  onSaveToken,
}) => {
  const [inputToken, setInputToken] = useState(token);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveToken(inputToken.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded bg-white dark:bg-[#1e1e1e] border border-[#cccccc] dark:border-[#383838] shadow-2xl p-5 text-[#333333] dark:text-[#f0f0f0] transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#eeeeee] dark:border-[#2e2e2e]">
          <div className="p-2 rounded bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#222222] dark:text-[#ffffff]">Discogs API & Proxy Settings</h2>
            <p className="text-[12px] text-[#666666] dark:text-[#9e9e9e]">
              Configure your Personal Access Token & proxy cache
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-[13px]">
          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#444444] dark:text-[#a0a0a0] font-semibold text-[12px] flex items-center gap-1.5">
                <span>Personal Access Token</span>
                <span className="text-[11px] text-[#888888] dark:text-[#777777] font-normal">(Optional)</span>
              </label>
              <a
                href="https://www.discogs.com/settings/developers"
                target="_blank"
                rel="noreferrer"
                className="text-[#0275d8] dark:text-[#58a6ff] hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Generate Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Paste Discogs token here..."
              className="w-full px-3 py-2 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] font-mono text-[13px] text-[#333333] dark:text-[#f0f0f0] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd]"
            />
            <p className="text-[11px] text-[#777777] dark:text-[#888888] mt-1 leading-normal">
              Adding a token increases your rate limit to 60 req/min and unlocks official Discogs price suggestions. Your token is stored locally in your browser.
            </p>
          </div>

          {/* Proxy Cache Section */}
          <div className="p-3 rounded bg-[#f8f9fa] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#383838] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#333333] dark:text-[#f0f0f0] font-semibold text-[12px]">
                <Database className="w-4 h-4 text-[#0275d8] dark:text-[#58a6ff]" />
                <span>Local Server Proxy Cache</span>
              </div>
              <span className="text-[10px] bg-[#e8f5e9] dark:bg-[#122b17] text-[#2e7d32] dark:text-[#81c784] border border-[#c8e6c9] dark:border-[#1e4825] px-1.5 py-0.5 rounded font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#666666] dark:text-[#9e9e9e] leading-normal">
              Discogs database lookups are automatically cached locally for 24-48 hours to minimize rate limits and ensure fast calculations.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#eeeeee] dark:border-[#2e2e2e]">
            {inputToken && (
              <button
                type="button"
                onClick={() => setInputToken('')}
                className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 text-[12px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Token</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded text-[13px] text-[#555555] dark:text-[#a0a0a0] hover:text-[#222222] dark:hover:text-white bg-white dark:bg-[#282828] border border-[#cccccc] dark:border-[#383838] hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-[13px] bg-[#0275d8] dark:bg-[#1f6feb] hover:bg-[#01549b] dark:hover:bg-[#388bfd] text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
