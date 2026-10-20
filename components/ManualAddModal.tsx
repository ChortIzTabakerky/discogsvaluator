'use client';

import React, { useState } from 'react';
import { CollectionItem, GoldmineGrade } from '@/lib/types';
import { ORDERED_GRADES, GOLDMINE_GRADES, calculateConditionAdjustedValue } from '@/lib/goldmine';
import { X, Plus, Disc } from 'lucide-react';

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManualItem: (item: CollectionItem) => void;
}

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onAddManualItem,
}) => {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [formatCategory, setFormatCategory] = useState<'Vinyl' | 'CD' | 'Cassette' | 'Box Set' | 'Other'>('Vinyl');
  const [formatDetails, setFormatDetails] = useState('Vinyl, LP');
  const [year, setYear] = useState('');
  const [label, setLabel] = useState('');
  const [catalogNumber, setCatalogNumber] = useState('');
  const [mediaGrade, setMediaGrade] = useState<GoldmineGrade>('VG+');
  const [sleeveGrade, setSleeveGrade] = useState<GoldmineGrade>('VG+');
  const [medianPrice, setMedianPrice] = useState('25.00');
  const [minPrice, setMinPrice] = useState('10.00');
  const [maxPrice, setMaxPrice] = useState('60.00');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) return;

    const med = parseFloat(medianPrice) || 20;
    const min = parseFloat(minPrice) || med * 0.5;
    const max = parseFloat(maxPrice) || med * 2.5;

    const estimated = calculateConditionAdjustedValue(
      mediaGrade,
      sleeveGrade,
      min,
      med,
      max,
      formatCategory
    );

    const newItem: CollectionItem = {
      id: `manual-${Date.now()}`,
      discogsId: Math.floor(1000000 + Math.random() * 9000000),
      artist: artist.trim(),
      title: title.trim(),
      format: formatDetails || formatCategory,
      formatCategory,
      year: year ? parseInt(year, 10) : undefined,
      label: label.trim(),
      catalogNumber: catalogNumber.trim(),
      mediaGrade,
      sleeveGrade,
      minPriceUSD: min,
      medianPriceUSD: med,
      maxPriceUSD: max,
      estimatedValueUSD: estimated,
      notes: notes.trim(),
      dateAdded: new Date().toISOString(),
    };

    onAddManualItem(newItem);
    onClose();

    // Reset form
    setArtist('');
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded bg-white dark:bg-[#1e1e1e] border border-[#cccccc] dark:border-[#383838] shadow-2xl p-5 text-[#333333] dark:text-[#f0f0f0] transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#eeeeee] dark:border-[#2e2e2e]">
          <div className="p-2 rounded bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff]">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#222222] dark:text-[#ffffff]">Add Custom / Unlisted Release</h2>
            <p className="text-[12px] text-[#666666] dark:text-[#9e9e9e]">
              Add private pressings, test acetates, or items not yet indexed on Discogs
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-[13px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Artist *</label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Pink Floyd"
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Album Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Live at Pompeii"
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Format</label>
              <select
                value={formatCategory}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormatCategory(val);
                  setFormatDetails(val === 'CD' ? 'CD, Album' : val === 'Vinyl' ? 'Vinyl, LP' : val);
                }}
                className="w-full px-2 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              >
                <option value="Vinyl">Vinyl</option>
                <option value="CD">CD</option>
                <option value="Cassette">Cassette</option>
                <option value="Box Set">Box Set</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 1974"
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Catalog #</label>
              <input
                type="text"
                value={catalogNumber}
                onChange={(e) => setCatalogNumber(e.target.value)}
                placeholder="e.g. PF-001"
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
          </div>

          {/* Condition Grading */}
          <div className="grid grid-cols-2 gap-3 p-2.5 rounded bg-[#f8f9fa] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#383838]">
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Media Condition</label>
              <select
                value={mediaGrade}
                onChange={(e) => setMediaGrade(e.target.value as GoldmineGrade)}
                className="w-full px-2 py-1 rounded bg-white dark:bg-[#222222] border border-[#cccccc] dark:border-[#383838] text-[#333333] dark:text-[#f0f0f0] font-semibold focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd]"
              >
                {ORDERED_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} ({GOLDMINE_GRADES[g].name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Sleeve Condition</label>
              <select
                value={sleeveGrade}
                onChange={(e) => setSleeveGrade(e.target.value as GoldmineGrade)}
                className="w-full px-2 py-1 rounded bg-white dark:bg-[#222222] border border-[#cccccc] dark:border-[#383838] text-[#333333] dark:text-[#f0f0f0] font-semibold focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd]"
              >
                {ORDERED_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} ({GOLDMINE_GRADES[g].name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Baseline */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Min Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Median Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={medianPrice}
                onChange={(e) => setMedianPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#0275d8] dark:text-[#58a6ff] font-bold"
              />
            </div>
            <div>
              <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Peak Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#555555] dark:text-[#9e9e9e] font-semibold text-[12px] mb-1">Collector Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Japanese press with obi strip, stamped matrix"
              className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-[#161616] border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] text-[#333333] dark:text-[#f0f0f0]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee] dark:border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-[13px] text-[#555555] dark:text-[#a0a0a0] hover:text-[#222222] dark:hover:text-white bg-white dark:bg-[#282828] border border-[#cccccc] dark:border-[#383838] hover:bg-[#f5f5f5] dark:hover:bg-[#333333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-[13px] bg-[#0275d8] dark:bg-[#1f6feb] hover:bg-[#01549b] dark:hover:bg-[#388bfd] text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
