'use client';

import React from 'react';
import { CollectionItem, SupportedCurrency } from '@/lib/types';
import { formatCurrency } from '@/lib/currencies';
import { TrendingUp, Layers, Award, ArrowUpRight, ArrowDownRight, ShieldCheck, ShoppingCart } from 'lucide-react';

interface MetricsCardsProps {
  items: CollectionItem[];
  currency: SupportedCurrency;
  rates?: Record<SupportedCurrency, number>;
  showRealValueCalculator?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  items,
  currency,
  rates,
  showRealValueCalculator = true,
}) => {
  // Aggregate calculations
  const totalItems = items.length;
  const totalEstimatedUSD = items.reduce((acc, item) => acc + (item.estimatedValueUSD || 0), 0);
  const totalMinUSD = items.reduce((acc, item) => acc + (item.minPriceUSD || 0), 0);
  const totalMedianUSD = items.reduce((acc, item) => acc + (item.medianPriceUSD || 0), 0);
  const totalMaxUSD = items.reduce((acc, item) => acc + (item.maxPriceUSD || 0), 0);
  const averageItemUSD = totalItems > 0 ? totalEstimatedUSD / totalItems : 0;

  // Marketplace / current selling stats
  const itemsWithMarketPrice = items.filter((i) => i.currentLowestPriceUSD != null && i.currentLowestPriceUSD! > 0);
  const totalActiveListings = items.reduce((acc, i) => acc + (i.numForSale || 0), 0);
  const totalCurrentMarketUSD = itemsWithMarketPrice.reduce((acc, i) => acc + (i.currentLowestPriceUSD || 0), 0);
  const avgCurrentMarketUSD = itemsWithMarketPrice.length > 0 ? totalCurrentMarketUSD / itemsWithMarketPrice.length : 0;

  // Format count breakdowns
  const vinylCount = items.filter((i) => i.formatCategory === 'Vinyl').length;
  const cdCount = items.filter((i) => i.formatCategory === 'CD').length;
  const cassetteCount = items.filter((i) => i.formatCategory === 'Cassette').length;
  const boxSetCount = items.filter((i) => i.formatCategory === 'Box Set').length;
  const otherCount = totalItems - (vinylCount + cdCount + cassetteCount + boxSetCount);

  // Highest value release
  const mostValuableItem = items.reduce<CollectionItem | null>((highest, curr) => {
    if (!highest) return curr;
    return (curr.estimatedValueUSD || 0) > (highest.estimatedValueUSD || 0) ? curr : highest;
  }, null);

  // Comparison difference between Condition-Adjusted Estimated and Raw Discogs Median
  const diffFromMedian = totalEstimatedUSD - totalMedianUSD;
  const diffPercent = totalMedianUSD > 0 ? (diffFromMedian / totalMedianUSD) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Condition-Adjusted Estimated Value (Hero) OR Current Marketplace (when RVC hidden) */}
      {showRealValueCalculator ? (
        <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] border-t-4 border-t-[#0275d8] dark:border-t-[#388bfd] rounded p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#555555] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
                Realistic Market Value
              </span>
              <span className="text-[10px] bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff] border border-[#b9ddfc] dark:border-[#1d446f] px-1.5 py-0.5 rounded font-medium">
                Goldmine Graded
              </span>
            </div>

            <div className="text-[28px] sm:text-[32px] font-bold text-[#222222] dark:text-[#ffffff] tracking-tight my-1 leading-none">
              {formatCurrency(totalEstimatedUSD, currency, rates)}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[12px] mt-2.5 pt-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a]">
            {diffPercent >= 0 ? (
              <span className="flex items-center text-[#2e7d32] dark:text-[#4ade80] font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{diffPercent.toFixed(1)}% vs Median
              </span>
            ) : (
              <span className="flex items-center text-[#d97706] dark:text-[#fbbf24] font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {diffPercent.toFixed(1)}% vs Median
              </span>
            )}
            <span className="text-[#777777] dark:text-[#888888] ml-1">based on grades</span>
          </div>
        </div>
      ) : (
        /* Marketplace Current Selling card (replaces hero when RVC hidden) */
        <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] border-t-4 border-t-[#0275d8] dark:border-t-[#388bfd] rounded p-4 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#555555] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
                Marketplace Floor
              </span>
              <span className="text-[10px] bg-[#e7f3fe] dark:bg-[#102a45] text-[#0275d8] dark:text-[#58a6ff] border border-[#b9ddfc] dark:border-[#1d446f] px-1.5 py-0.5 rounded font-medium">
                Live Prices
              </span>
            </div>

            <div className="text-[28px] sm:text-[32px] font-bold text-[#222222] dark:text-[#ffffff] tracking-tight my-1 leading-none">
              {formatCurrency(totalCurrentMarketUSD, currency, rates)}
            </div>
          </div>

          <div className="text-[12px] text-[#666666] dark:text-[#9e9e9e] mt-2.5 pt-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a]">
            <span className="font-semibold text-[#222222] dark:text-[#ffffff]">{totalActiveListings}</span> active listings across{' '}
            <span className="font-semibold text-[#222222] dark:text-[#ffffff]">{itemsWithMarketPrice.length}</span> of your items
          </div>
        </div>
      )}

      {/* 2. Discogs Standard Median Baseline */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] rounded p-4 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#555555] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
              Discogs Median
            </span>
            <span className="text-[10px] text-[#666666] dark:text-[#9e9e9e] bg-[#f5f5f5] dark:bg-[#282828] px-1.5 py-0.5 rounded border border-[#e0e0e0] dark:border-[#383838]">
              Raw Sales
            </span>
          </div>

          <div className="text-[24px] sm:text-[28px] font-bold text-[#333333] dark:text-[#e0e0e0] tracking-tight my-1 leading-none">
            {formatCurrency(totalMedianUSD, currency, rates)}
          </div>
        </div>

        <div className="text-[12px] text-[#666666] dark:text-[#9e9e9e] mt-2.5 pt-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a]">
          Avg per item:{' '}
          <span className="text-[#222222] dark:text-[#ffffff] font-bold">
            {formatCurrency(averageItemUSD, currency, rates)}
          </span>
        </div>
      </div>

      {/* 3. Historical Sales Range (Min & Max) */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] rounded p-4 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#555555] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
              Historical Range
            </span>
            <span className="text-[10px] text-[#666666] dark:text-[#9e9e9e] bg-[#f5f5f5] dark:bg-[#282828] px-1.5 py-0.5 rounded border border-[#e0e0e0] dark:border-[#383838]">
              Low to High
            </span>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div>
              <div className="text-[10px] text-[#777777] dark:text-[#888888] font-semibold uppercase">Min Floor</div>
              <div className="text-[16px] font-bold text-[#444444] dark:text-[#c0c0c0]">
                {formatCurrency(totalMinUSD, currency, rates)}
              </div>
            </div>
            <div className="text-[#aaaaaa] dark:text-[#666666] font-light text-base">→</div>
            <div className="text-right">
              <div className="text-[10px] text-[#777777] dark:text-[#888888] font-semibold uppercase">Peak High</div>
              <div className="text-[16px] font-bold text-[#2e7d32] dark:text-[#4ade80]">
                {formatCurrency(totalMaxUSD, currency, rates)}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-[#666666] dark:text-[#9e9e9e] mt-2.5 pt-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a]">
          Spread multiple:{' '}
          <span className="text-[#333333] dark:text-[#ffffff] font-semibold">
            {totalMinUSD > 0 ? (totalMaxUSD / totalMinUSD).toFixed(1) : 0}x
          </span>
        </div>
      </div>

      {/* 4. Collection Size & Top Item */}
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] rounded p-4 shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#555555] dark:text-[#9e9e9e] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#0275d8] dark:text-[#388bfd]" />
              Collection Size
            </span>
            <span className="text-[11px] font-bold text-[#222222] dark:text-[#f0f0f0] bg-[#f0f0f0] dark:bg-[#282828] border border-[#dcdcdc] dark:border-[#404040] px-2 py-0.5 rounded">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Format breakdown badges in Discogs tag style */}
          <div className="flex flex-wrap gap-1.5 my-2">
            {vinylCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#404040] font-medium">
                {vinylCount} Vinyl
              </span>
            )}
            {cdCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#404040] font-medium">
                {cdCount} CD
              </span>
            )}
            {boxSetCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#404040] font-medium">
                {boxSetCount} Boxset
              </span>
            )}
            {cassetteCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#404040] font-medium">
                {cassetteCount} Cassette
              </span>
            )}
            {otherCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#282828] text-[#333333] dark:text-[#e0e0e0] border border-[#cccccc] dark:border-[#404040] font-medium">
                {otherCount} Other
              </span>
            )}
            {totalItems === 0 && (
              <span className="text-[12px] text-[#888888] dark:text-[#777777] italic">No releases added yet</span>
            )}
          </div>
        </div>

        {mostValuableItem && totalItems > 0 && (
          <div className="text-[12px] text-[#666666] dark:text-[#9e9e9e] mt-2 pt-2 border-t border-[#f0f0f0] dark:border-[#2a2a2a] truncate">
            Top record:{' '}
            <span className="text-[#0275d8] dark:text-[#58a6ff] font-bold">
              {formatCurrency(
                showRealValueCalculator
                  ? mostValuableItem.estimatedValueUSD
                  : mostValuableItem.medianPriceUSD,
                currency,
                rates
              )}
            </span>{' '}
            <span className="text-[#555555] dark:text-[#bbbbbb] truncate">
              ({mostValuableItem.artist} - {mostValuableItem.title})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

