'use client';

import React, { useState, useMemo } from 'react';
import { CollectionItem, SupportedCurrency, GoldmineGrade } from '@/lib/types';
import { ORDERED_GRADES, GOLDMINE_GRADES, calculateConditionAdjustedValue } from '@/lib/goldmine';
import { formatCurrency } from '@/lib/currencies';
import { 
  ArrowUpDown, 
  Trash2, 
  ExternalLink, 
  Disc, 
  Search, 
  FileEdit, 
  ChevronDown,
  Info,
  Eye,
  EyeOff,
  ShoppingCart
} from 'lucide-react';

interface CollectionTableProps {
  items: CollectionItem[];
  currency: SupportedCurrency;
  rates?: Record<SupportedCurrency, number>;
  onUpdateItemGrade: (
    id: string,
    mediaGrade: GoldmineGrade,
    sleeveGrade: GoldmineGrade
  ) => void;
  onUpdateItemNotes: (id: string, notes: string) => void;
  onRemoveItem: (id: string) => void;
  onOpenMethodology: () => void;
  showRealValueCalculator?: boolean;
  onToggleRealValueCalculator?: () => void;
}

type SortField = 'value' | 'median' | 'artist' | 'title' | 'year' | 'dateAdded';
type SortDirection = 'asc' | 'desc';

export const CollectionTable: React.FC<CollectionTableProps> = ({
  items,
  currency,
  rates,
  onUpdateItemGrade,
  onUpdateItemNotes,
  onRemoveItem,
  onOpenMethodology,
  showRealValueCalculator = true,
  onToggleRealValueCalculator,
}) => {
  const [filterText, setFilterText] = useState('');
  const [formatFilter, setFormatFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Text search
        if (filterText.trim()) {
          const q = filterText.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchArtist = item.artist.toLowerCase().includes(q);
          const matchLabel = item.label?.toLowerCase().includes(q) || false;
          const matchCat = item.catalogNumber?.toLowerCase().includes(q) || false;
          const matchNotes = item.notes?.toLowerCase().includes(q) || false;

          if (!matchTitle && !matchArtist && !matchLabel && !matchCat && !matchNotes) {
            return false;
          }
        }

        // Format filter
        if (formatFilter !== 'All') {
          if (item.formatCategory !== formatFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        switch (sortField) {
          case 'value':
            diff = (a.estimatedValueUSD || 0) - (b.estimatedValueUSD || 0);
            break;
          case 'median':
            diff = (a.medianPriceUSD || 0) - (b.medianPriceUSD || 0);
            break;
          case 'artist':
            diff = a.artist.localeCompare(b.artist);
            break;
          case 'title':
            diff = a.title.localeCompare(b.title);
            break;
          case 'year':
            diff = (Number(a.year) || 0) - (Number(b.year) || 0);
            break;
          case 'dateAdded':
            diff = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
            break;
        }

        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [items, filterText, formatFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'artist' || field === 'title' ? 'asc' : 'desc');
    }
  };

  const handleStartEditNotes = (item: CollectionItem) => {
    setEditingNotesId(item.id);
    setNotesValue(item.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    onUpdateItemNotes(id, notesValue);
    setEditingNotesId(null);
  };

  const formatOptions = ['All', 'Vinyl', 'CD', 'Cassette', 'Box Set'];

  return (
    <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] rounded shadow-sm overflow-hidden transition-colors">
      {/* Table Controls / Filter Toolbar */}
      <div className="p-3 sm:p-4 border-b border-[#e0e0e0] dark:border-[#333333] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#fafafa] dark:bg-[#181818] transition-colors">
        {/* Search within collection */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter list by artist, album, label, catalog #..."
            className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded bg-white dark:bg-[#121212] border border-[#cccccc] dark:border-[#383838] focus:border-[#0275d8] dark:focus:border-[#388bfd] focus:ring-1 focus:ring-[#0275d8] dark:focus:ring-[#388bfd] focus:outline-none text-[#333333] dark:text-[#f0f0f0] placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Format Filter & Sorter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-[#eeeeee] dark:bg-[#252525] p-1 rounded border border-[#dddddd] dark:border-[#383838]">
            {formatOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                  formatFilter === f
                    ? 'bg-[#0275d8] dark:bg-[#1f6feb] text-white font-semibold shadow-sm'
                    : 'text-[#555555] dark:text-[#a0a0a0] hover:text-[#222222] dark:hover:text-white hover:bg-[#e0e0e0] dark:hover:bg-[#333333]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Quick Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(f);
                setSortDirection(d);
              }}
              className="appearance-none bg-white dark:bg-[#222222] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#383838] hover:border-gray-400 dark:hover:border-gray-500 rounded px-3 py-1.5 text-[12px] font-medium focus:outline-none focus:border-[#0275d8] cursor-pointer pr-7"
            >
              <option value="value-desc">Highest Value</option>
              <option value="value-asc">Lowest Value</option>
              <option value="median-desc">Highest Median Price</option>
              <option value="artist-asc">Artist (A-Z)</option>
              <option value="artist-desc">Artist (Z-A)</option>
              <option value="title-asc">Album Title (A-Z)</option>
              <option value="year-desc">Year (Newest)</option>
              <option value="year-asc">Year (Oldest)</option>
              <option value="dateAdded-desc">Recently Added</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Real Value Calculator Toggle */}
          {onToggleRealValueCalculator && (
            <button
              onClick={onToggleRealValueCalculator}
              title={showRealValueCalculator ? 'Hide Real Value Calculator' : 'Show Real Value Calculator'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium border transition-colors whitespace-nowrap ${
                showRealValueCalculator
                  ? 'bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff] border-[#b9ddfc] dark:border-[#1d446f] hover:bg-[#d0eafc] dark:hover:bg-[#183c62]'
                  : 'bg-white dark:bg-[#222222] text-[#555555] dark:text-[#a0a0a0] border-[#cccccc] dark:border-[#383838] hover:bg-[#f5f5f5] dark:hover:bg-[#282828]'
              }`}
            >
              {showRealValueCalculator ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>Real Value</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#e0e0e0] dark:border-[#333333] bg-[#f8f9fa] dark:bg-[#161616] text-[#555555] dark:text-[#9e9e9e] uppercase font-bold text-[11px] tracking-wider transition-colors">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[240px]">
                <button
                  onClick={() => handleSort('artist')}
                  className="flex items-center gap-1 hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  Artist & Album
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </button>
              </th>
              <th className="py-2.5 px-3 min-w-[140px]">Format & Label</th>
              <th className="py-2.5 px-3 min-w-[125px]">
                <div className="flex items-center gap-1">
                  <span>Media</span>
                  <button
                    onClick={onOpenMethodology}
                    title="View Goldmine standards"
                    className="text-gray-400 hover:text-[#0275d8] dark:hover:text-[#388bfd]"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[125px]">Sleeve</th>
              <th className="py-2.5 px-3 min-w-[140px] text-right">
                <button
                  onClick={() => handleSort('median')}
                  className="flex items-center gap-1 ml-auto hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  Discogs Range
                  <ArrowUpDown className="w-3 h-3 text-gray-400" />
                </button>
              </th>
              <th className="py-2.5 px-3 min-w-[130px] text-right">
                <div className="flex items-center gap-1 ml-auto">
                  <ShoppingCart className="w-3 h-3 text-[#0275d8] dark:text-[#388bfd]" />
                  <span>Current Selling</span>
                </div>
              </th>
              {showRealValueCalculator && (
                <th className="py-2.5 px-3 min-w-[130px] text-right">
                  <button
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-1 ml-auto text-[#0275d8] dark:text-[#58a6ff] font-bold hover:underline transition-colors"
                  >
                    Calculated Worth
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              )}
              <th className="py-2.5 px-3 w-12 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eeeeee] dark:divide-[#2a2a2a]">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={showRealValueCalculator ? 9 : 8} className="py-12 text-center text-gray-500 bg-white dark:bg-[#1e1e1e]">
                  <Disc className="w-10 h-10 mx-auto mb-2.5 text-gray-300 dark:text-gray-600 animate-spin [animation-duration:20s]" />
                  <p className="text-[14px] font-semibold text-[#444444] dark:text-[#d0d0d0]">
                    {items.length === 0
                      ? 'No items in collection calculator'
                      : 'No items match your filter criteria'}
                  </p>
                  <p className="text-[12px] text-[#777777] dark:text-[#888888] mt-1">
                    {items.length === 0
                      ? 'Use the search bar above to look up releases on Discogs and add them.'
                      : 'Try adjusting your search filter or format tabs.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item, index) => {
                const mediaDef = GOLDMINE_GRADES[item.mediaGrade];
                const sleeveDef = GOLDMINE_GRADES[item.sleeveGrade];
                const discogsUrl = `https://www.discogs.com/release/${item.discogsId}`;

                // Calculate condition difference relative to median
                const diffVsMedian = (item.estimatedValueUSD || 0) - (item.medianPriceUSD || 0);
                const pctVsMedian = item.medianPriceUSD > 0 ? (diffVsMedian / item.medianPriceUSD) * 100 : 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#fbfcfd] dark:hover:bg-[#252525] transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                      {index + 1}
                    </td>

                    {/* Artist & Title */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded bg-[#f5f5f5] dark:bg-[#282828] border border-[#e0e0e0] dark:border-[#383838] overflow-hidden shrink-0 flex items-center justify-center">
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

                        {/* Title details */}
                        <div className="min-w-0">
                          <div className="text-[13px] truncate">
                            <span className="font-bold text-[#222222] dark:text-[#ffffff]">{item.artist}</span>
                            <span className="text-gray-400 dark:text-gray-500 mx-1.5">-</span>
                            <a
                              href={discogsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0275d8] dark:text-[#58a6ff] hover:underline font-medium"
                              title="View release on Discogs"
                            >
                              {item.title}
                            </a>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 text-[#777777] dark:text-[#9e9e9e] text-[11px]">
                            {item.year && <span>{item.year}</span>}
                            {item.country && <span>• {item.country}</span>}
                            <a
                              href={discogsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-gray-400 hover:text-[#0275d8] dark:hover:text-[#58a6ff] transition-colors"
                              title="External link"
                            >
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          </div>

                          {/* Item Notes display / trigger */}
                          {item.notes ? (
                            <div
                              onClick={() => handleStartEditNotes(item)}
                              className="text-[11px] text-[#0275d8] dark:text-[#58a6ff] hover:underline cursor-pointer italic mt-0.5 truncate max-w-xs flex items-center gap-1"
                              title="Click to edit notes"
                            >
                              <FileEdit className="w-3 h-3 shrink-0 text-[#0275d8] dark:text-[#58a6ff]" />
                              <span>{item.notes}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditNotes(item)}
                              className="text-[10px] text-gray-400 hover:text-[#0275d8] dark:hover:text-[#58a6ff] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            >
                              <FileEdit className="w-2.5 h-2.5" />
                              <span>Add note</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Format & Label */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#f5f5f5] dark:bg-[#282828] border border-[#d5d5d5] dark:border-[#404040] text-[#444444] dark:text-[#d0d0d0]">
                          {item.formatCategory}
                        </span>
                        <div className="text-[11px] text-[#666666] dark:text-[#9e9e9e] truncate max-w-[150px]" title={item.label}>
                          {item.label || item.catalogNumber || '—'}
                        </div>
                      </div>
                    </td>

                    {/* Media Grade Selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={item.mediaGrade}
                        onChange={(e) =>
                          onUpdateItemGrade(
                            item.id,
                            e.target.value as GoldmineGrade,
                            item.sleeveGrade
                          )
                        }
                        className={`w-full text-[12px] font-semibold px-2 py-1 rounded border cursor-pointer focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] bg-white dark:bg-[#222222] transition-colors ${
                          mediaDef?.badgeBg || 'border-[#cccccc] dark:border-[#383838] text-[#333333] dark:text-[#e0e0e0]'
                        }`}
                        title={mediaDef?.description}
                      >
                        {ORDERED_GRADES.map((g) => (
                          <option key={g} value={g} className="bg-white dark:bg-[#222222] text-[#333333] dark:text-[#e0e0e0]">
                            {g} ({GOLDMINE_GRADES[g].multiplier * 100}%)
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Sleeve Grade Selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={item.sleeveGrade}
                        onChange={(e) =>
                          onUpdateItemGrade(
                            item.id,
                            item.mediaGrade,
                            e.target.value as GoldmineGrade
                          )
                        }
                        className={`w-full text-[12px] font-semibold px-2 py-1 rounded border cursor-pointer focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd] bg-white dark:bg-[#222222] transition-colors ${
                          sleeveDef?.badgeBg || 'border-[#cccccc] dark:border-[#383838] text-[#333333] dark:text-[#e0e0e0]'
                        }`}
                        title={sleeveDef?.description}
                      >
                        {ORDERED_GRADES.map((g) => (
                          <option key={g} value={g} className="bg-white dark:bg-[#222222] text-[#333333] dark:text-[#e0e0e0]">
                            {g} ({GOLDMINE_GRADES[g].multiplier * 100}%)
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Discogs Baseline Range */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="font-semibold text-[#333333] dark:text-[#e0e0e0]">
                        {formatCurrency(item.medianPriceUSD, currency, rates)}
                      </div>
                      <div className="text-[10px] text-[#777777] dark:text-[#888888] mt-0.5 flex items-center justify-end gap-1">
                        <span>Low {formatCurrency(item.minPriceUSD, currency, rates)}</span>
                        <span>-</span>
                        <span>High {formatCurrency(item.maxPriceUSD, currency, rates)}</span>
                      </div>
                    </td>

                    {/* Current Marketplace Selling Price */}
                    <td className="py-2.5 px-3 text-right">
                      {item.currentLowestPriceUSD != null && item.currentLowestPriceUSD > 0 ? (
                        <div>
                          <div className="font-semibold text-[13px] text-[#222222] dark:text-[#e0e0e0]">
                            {formatCurrency(item.currentLowestPriceUSD, currency, rates)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff] border border-[#b9ddfc] dark:border-[#1d446f] font-medium">
                              {item.numForSale ?? 0} for sale
                            </span>
                            <a
                              href={`https://www.discogs.com/sell/release/${item.discogsId}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Browse on Discogs Marketplace"
                              className="text-gray-400 hover:text-[#0275d8] dark:hover:text-[#58a6ff] transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[11px] text-[#999999] dark:text-[#666666] italic">None listed</div>
                          {(item.numForSale ?? 0) > 0 && (
                            <div className="text-[10px] text-[#777777] dark:text-[#888888] mt-0.5">
                              {item.numForSale} for sale
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Calculated Condition-Adjusted Value — only when RVC visible */}
                    {showRealValueCalculator && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-bold text-[15px] text-[#222222] dark:text-[#ffffff] tracking-tight">
                          {formatCurrency(item.estimatedValueUSD, currency, rates)}
                        </div>
                        <div className="text-[10px] font-medium mt-0.5">
                          {pctVsMedian >= 0 ? (
                            <span className="text-[#2e7d32] dark:text-[#4ade80]">
                              +{pctVsMedian.toFixed(0)}% vs med
                            </span>
                          ) : (
                            <span className="text-[#d97706] dark:text-[#fbbf24]">
                              {pctVsMedian.toFixed(0)}% vs med
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                        title="Remove from calculator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Notes Modal / Inline Prompt */}
      {editingNotesId && (
        <div className="p-3 bg-[#f8f9fa] dark:bg-[#161616] border-t border-[#e0e0e0] dark:border-[#333333] flex items-center gap-2">
          <input
            type="text"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Add collector notes (e.g. matrix runout, limited edition, obi strip)..."
            className="flex-1 px-3 py-1.5 text-[12px] rounded bg-white dark:bg-[#222222] border border-[#cccccc] dark:border-[#383838] text-[#333333] dark:text-[#f0f0f0] focus:outline-none focus:border-[#0275d8] dark:focus:border-[#388bfd]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNotes(editingNotesId);
              if (e.key === 'Escape') setEditingNotesId(null);
            }}
          />
          <button
            onClick={() => handleSaveNotes(editingNotesId)}
            className="px-3 py-1.5 rounded text-[12px] font-bold bg-[#0275d8] dark:bg-[#1f6feb] hover:bg-[#01549b] dark:hover:bg-[#388bfd] text-white transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setEditingNotesId(null)}
            className="px-3 py-1.5 rounded text-[12px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table Footer Summary */}
      <div className="p-3 px-4 bg-[#f8f9fa] dark:bg-[#161616] border-t border-[#e0e0e0] dark:border-[#333333] text-[12px] text-[#666666] dark:text-[#9e9e9e] flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
        <div>
          Showing <span className="font-bold text-[#222222] dark:text-[#ffffff]">{filteredAndSortedItems.length}</span> of{' '}
          <span className="font-bold text-[#222222] dark:text-[#ffffff]">{items.length}</span> items in collection
        </div>

        {filteredAndSortedItems.length > 0 && (
          <div className="flex items-center gap-3">
            <span>
              {showRealValueCalculator ? 'Calc. Subtotal' : 'Median Subtotal'}:{' '}
              <span className="font-bold text-[#0275d8] dark:text-[#58a6ff] text-[13px]">
                {formatCurrency(
                  filteredAndSortedItems.reduce(
                    (acc, i) => acc + (showRealValueCalculator ? (i.estimatedValueUSD || 0) : (i.medianPriceUSD || 0)),
                    0
                  ),
                  currency,
                  rates
                )}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
