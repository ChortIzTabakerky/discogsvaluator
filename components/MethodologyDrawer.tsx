'use client';

import React from 'react';
import { X, ShieldCheck, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ORDERED_GRADES, GOLDMINE_GRADES } from '@/lib/goldmine';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded bg-white dark:bg-[#1e1e1e] border border-[#cccccc] dark:border-[#383838] shadow-2xl p-5 text-[#333333] dark:text-[#f0f0f0] transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#eeeeee] dark:border-[#2e2e2e]">
          <div className="p-2 rounded bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#222222] dark:text-[#ffffff]">Valuation Methodology & Goldmine Standards</h2>
            <p className="text-[12px] text-[#666666] dark:text-[#9e9e9e]">
              Why this calculator provides realistic values compared to official Discogs median
            </p>
          </div>
        </div>

        <div className="space-y-4 text-[13px] text-[#444444] dark:text-[#c0c0c0] leading-relaxed">
          {/* Why Discogs official is flawed */}
          <div className="p-3.5 rounded bg-[#fff5f5] dark:bg-[#281515] border border-[#ffcdd2] dark:border-[#521b1b] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#c62828] dark:text-[#ef9a9a] text-[13px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>The Problem with Official Discogs Collection Values</span>
            </div>
            <p className="text-[#555555] dark:text-[#b8b8b8] text-[12px]">
              On the official Discogs website, collection value is simply the sum of historical Min, Median, and Max sales across <strong>all</strong> transactions — completely ignoring whether your copy is Mint or heavily scratched. A trashed Poor copy with no sleeve will show the exact same median value as a sealed Mint first pressing.
            </p>
          </div>

          {/* How this calculator fixes it */}
          <div className="p-3.5 rounded bg-[#f1f8e9] dark:bg-[#102713] border border-[#c5e1a5] dark:border-[#1e4825] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#2e7d32] dark:text-[#81c784] text-[13px]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>How This Valuator Calculates Realistic Worth</span>
            </div>
            <p className="text-[#555555] dark:text-[#b8b8b8] text-[12px]">
              We apply the industry-standard <strong>Goldmine Grading System</strong> to both the media and sleeve independently, blended using format-specific weights:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-[#555555] dark:text-[#b8b8b8] text-[12px]">
              <li><strong>Vinyl Records:</strong> 70% Media Condition + 30% Sleeve Condition</li>
              <li><strong>CDs:</strong> 85% Media Condition + 15% Sleeve Condition (jewel cases are easily replaced)</li>
              <li><strong>Box Sets:</strong> 60% Media Condition + 40% Outer Box & Inserts Condition</li>
            </ul>
          </div>

          {/* Goldmine Standard Multipliers Table */}
          <div>
            <h3 className="font-bold text-[#222222] dark:text-[#ffffff] text-[13px] mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#0275d8] dark:text-[#58a6ff]" />
              <span>Goldmine Grading Multiplier Scale</span>
            </h3>
            <div className="rounded border border-[#e0e0e0] dark:border-[#383838] overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[#f8f9fa] dark:bg-[#161616] text-[#555555] dark:text-[#9e9e9e] font-bold border-b border-[#e0e0e0] dark:border-[#383838] uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Grade</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3 text-right">Multiplier</th>
                    <th className="py-2 px-3">Standard Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee] dark:divide-[#2e2e2e]">
                  {ORDERED_GRADES.map((grade) => {
                    const g = GOLDMINE_GRADES[grade];
                    return (
                      <tr key={grade} className="hover:bg-[#fafafa] dark:hover:bg-[#252525]">
                        <td className="py-2 px-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] border ${g.badgeBg}`}>
                            {g.code}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-[#222222] dark:text-[#ffffff]">{g.name}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0275d8] dark:text-[#58a6ff]">
                          {(g.multiplier * 100).toFixed(0)}%
                        </td>
                        <td className="py-2 px-3 text-[#666666] dark:text-[#9e9e9e] text-[11px]">{g.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-2 border-t border-[#eeeeee] dark:border-[#2e2e2e]">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded text-[13px] bg-[#222222] hover:bg-[#383838] dark:bg-[#2a2a2a] dark:hover:bg-[#333333] text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
