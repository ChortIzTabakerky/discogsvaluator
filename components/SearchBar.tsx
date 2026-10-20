'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchResultItem, GoldmineGrade } from '@/lib/types';
import { ORDERED_GRADES, GOLDMINE_GRADES } from '@/lib/goldmine';
import { Search, Loader2, Plus, Disc, X, PlusCircle, Check, AlertCircle } from 'lucide-react';

interface SearchBarProps {
  onAddRelease: (discogsId: number, mediaGrade: GoldmineGrade, sleeveGrade: GoldmineGrade) => Promise<void>;
  onOpenManualAdd: () => void;
  token?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onAddRelease,
  onOpenManualAdd,
  token,
}) => {
  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [justAddedIds, setJustAddedIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Selected grades per search result item (defaults to VG+)
  const [itemGrades, setItemGrades] = useState<Record<number, { media: GoldmineGrade; sleeve: GoldmineGrade }>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setNotice(null);
      setIsOpen(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, formatFilter);
    }, 450);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, formatFilter]);

  const performSearch = async (searchTerm: string, format: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setNotice(null);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['x-discogs-token'] = token;
      }

      const params = new URLSearchParams({
        q: searchTerm.trim(),
      });
      if (format && format !== 'All') {
        params.append('format', format);
      }

      const res = await fetch(`/api/discogs/search?${params.toString()}`, { headers });
      const data = await res.json();

      if (data.results) {
        setResults(data.results);
        setIsOpen(true);
        if (data.notice) {
          setNotice(data.notice);
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (
    id: number,
    type: 'media' | 'sleeve',
    grade: GoldmineGrade
  ) => {
    setItemGrades((prev) => ({
      ...prev,
      [id]: {
        media: type === 'media' ? grade : (prev[id]?.media || 'VG+'),
        sleeve: type === 'sleeve' ? grade : (prev[id]?.sleeve || 'VG+'),
      },
    }));
  };

  const handleAdd = async (item: SearchResultItem) => {
    const grades = itemGrades[item.id] || { media: 'VG+', sleeve: 'VG+' };
    setAddingId(item.id);

    try {
      await onAddRelease(item.id, grades.media, grades.sleeve);
      setJustAddedIds((prev) => [...prev, item.id]);
      setTimeout(() => {
        setJustAddedIds((prev) => prev.filter((id) => id !== item.id));
      }, 2500);
    } catch (err) {
      console.error('Error adding release:', err);
    } finally {
      setAddingId(null);
    }
  };

  const formatsList = ['All', 'Vinyl', 'CD', 'Cassette', 'Box Set'];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-[#0275d8] dark:text-[#388bfd] animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search Discogs database (Artist, Title, Catalog # or Barcode)..."
            className="w-full pl-9 pr-9 py-2 rounded bg-white dark:bg-[#181818] text-[#333333] dark:text-[#f0f0f0] placeholder-gray-400 dark:placeholder-gray-500 border border-[#cccccc] dark:border-[#383838] focus:border-[#0275d8] dark:focus:border-[#388bfd] focus:ring-1 focus:ring-[#0275d8] dark:focus:ring-[#388bfd] focus:outline-none text-[13px] transition-colors"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Format Quick Filter Pill Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {formatsList.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormatFilter(f)}
              className={`px-3 py-1.5 rounded text-[12px] font-medium whitespace-nowrap transition-colors border ${
                formatFilter === f
                  ? 'bg-[#0275d8] dark:bg-[#1f6feb] text-white border-[#0275d8] dark:border-[#1f6feb] font-semibold'
                  : 'bg-white dark:bg-[#222222] text-[#333333] dark:text-[#d0d0d0] border-[#cccccc] dark:border-[#383838] hover:bg-[#f5f5f5] dark:hover:bg-[#282828]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Manual Custom Add Button with Blue Accent */}
        <button
          type="button"
          onClick={onOpenManualAdd}
          title="Manually add an unlisted bootleg, cassette, or custom release"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-[#333333] dark:text-[#d0d0d0] bg-white dark:bg-[#222222] hover:bg-[#f5f5f5] dark:hover:bg-[#282828] border border-[#cccccc] dark:border-[#383838] transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
          <span>Custom Add</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && isOpen && (
        <div className="mt-2 p-2 rounded bg-[#eff6ff] dark:bg-[#102a45] border border-[#bfdbfe] dark:border-[#1d446f] text-[#1e40af] dark:text-[#93c5fd] text-[12px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#0275d8] dark:text-[#388bfd]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Results Dropdown List */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-[440px] overflow-y-auto rounded bg-white dark:bg-[#1e1e1e] border border-[#cccccc] dark:border-[#383838] shadow-lg p-1 divide-y divide-[#eeeeee] dark:divide-[#2c2c2c]">
          <div className="px-3 py-1.5 text-[11px] font-bold text-[#666666] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center justify-between bg-[#f8f9fa] dark:bg-[#161616] rounded-t">
            <span>Found {results.length} Discogs Releases</span>
            <span className="font-normal text-[#888888] dark:text-[#777777] normal-case">Select condition and click Add</span>
          </div>

          {results.map((item) => {
            const currentMedia = itemGrades[item.id]?.media || 'VG+';
            const currentSleeve = itemGrades[item.id]?.sleeve || 'VG+';
            const isAdding = addingId === item.id;
            const isAdded = justAddedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="py-2.5 px-3 hover:bg-[#f8f9fa] dark:hover:bg-[#282828] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Artwork & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded bg-[#f0f0f0] dark:bg-[#282828] border border-[#e0e0e0] dark:border-[#383838] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Disc className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[13px] text-[#222222] dark:text-[#f0f0f0] truncate">
                      {item.artist ? (
                        <>
                          <span className="text-[#333333] dark:text-[#f0f0f0] font-bold">{item.artist}</span>{' '}
                          <span className="text-gray-400 mx-1.5">-</span>{' '}
                          <span className="text-[#0275d8] dark:text-[#58a6ff] hover:underline cursor-pointer">{item.titleOnly || item.title}</span>
                        </>
                      ) : (
                        <span className="text-[#0275d8] dark:text-[#58a6ff]">{item.title}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-[#666666] dark:text-[#9e9e9e]">
                      <span className="px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] border border-[#dddddd] dark:border-[#383838] font-medium text-[#444444] dark:text-[#d0d0d0]">
                        {item.formatCategory}
                      </span>
                      {item.year && <span>{item.year}</span>}
                      {item.country && <span>• {item.country}</span>}
                      {item.catno && <span className="font-mono text-[#888888] dark:text-[#777777]">• {item.catno}</span>}
                      {item.lowest_price != null && item.lowest_price > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff] border border-[#b9ddfc] dark:border-[#1d446f] font-semibold">
                          From ${item.lowest_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Condition Selector & Add Button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Media Grade */}
                  <div className="flex flex-col items-start">
                    <label className="text-[10px] text-[#666666] dark:text-[#9e9e9e] font-bold uppercase mb-0.5">Media</label>
                    <select
                      value={currentMedia}
                      onChange={(e) => handleGradeChange(item.id, 'media', e.target.value as GoldmineGrade)}
                      className="text-[12px] font-semibold px-2 py-1 rounded border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] bg-white dark:bg-[#242424] text-[#333333] dark:text-[#f0f0f0]"
                    >
                      {ORDERED_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g} ({GOLDMINE_GRADES[g].multiplier * 100}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sleeve Grade */}
                  <div className="flex flex-col items-start">
                    <label className="text-[10px] text-[#666666] dark:text-[#9e9e9e] font-bold uppercase mb-0.5">Sleeve</label>
                    <select
                      value={currentSleeve}
                      onChange={(e) => handleGradeChange(item.id, 'sleeve', e.target.value as GoldmineGrade)}
                      className="text-[12px] font-semibold px-2 py-1 rounded border border-[#cccccc] dark:border-[#383838] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] bg-white dark:bg-[#242424] text-[#333333] dark:text-[#f0f0f0]"
                    >
                      {ORDERED_GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g} ({GOLDMINE_GRADES[g].multiplier * 100}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAdd(item)}
                    disabled={isAdding || isAdded}
                    className={`mt-4 px-3 py-1.5 rounded text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isAdded
                        ? 'bg-[#2e7d32] dark:bg-[#2e7d32] text-white cursor-default'
                        : isAdding
                        ? 'bg-[#01549b] text-white cursor-wait'
                        : 'bg-[#0275d8] dark:bg-[#1f6feb] hover:bg-[#01549b] dark:hover:bg-[#388bfd] text-white active:scale-95'
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
