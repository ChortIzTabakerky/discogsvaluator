'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CollectionItem, SupportedCurrency, GoldmineGrade } from '@/lib/types';
import { calculateConditionAdjustedValue } from '@/lib/goldmine';
import { Header } from '@/components/Header';
import { MetricsCards } from '@/components/MetricsCards';
import { SearchBar } from '@/components/SearchBar';
import { CollectionTable } from '@/components/CollectionTable';
import { ManualAddModal } from '@/components/ManualAddModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MethodologyDrawer } from '@/components/MethodologyDrawer';

const STORAGE_KEY_COLLECTION = 'discogs_collection_v2';
const STORAGE_KEY_TOKEN = 'discogs_token_v1';
const STORAGE_KEY_CURRENCY = 'discogs_currency_v1';
const STORAGE_KEY_THEME = 'discogs_theme_v1';
const STORAGE_KEY_SHOW_RVC = 'discogs_show_real_value_v1';

export default function Home() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number> | undefined>();
  const [token, setToken] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showRealValueCalculator, setShowRealValueCalculator] = useState<boolean>(true);
  
  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state and theme from LocalStorage on mount
  useEffect(() => {
    try {
      // Clear legacy storage key if present from initial dev test
      localStorage.removeItem('discogs_collection_v1');

      // Theme initialization (check localStorage or system preference)
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      let enableDark = false;
      if (savedTheme) {
        enableDark = savedTheme === 'dark';
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enableDark = true;
      }

      setIsDark(enableDark);
      if (enableDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const savedItems = localStorage.getItem(STORAGE_KEY_COLLECTION);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } else {
        setItems([]);
      }

      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (savedToken) setToken(savedToken);

      const savedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY) as SupportedCurrency;
      if (savedCurrency) setCurrency(savedCurrency);

      const savedShowRVC = localStorage.getItem(STORAGE_KEY_SHOW_RVC);
      if (savedShowRVC !== null) {
        setShowRealValueCalculator(savedShowRVC !== 'false');
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Theme toggle handler
  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextDark ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }

    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Sync collection to LocalStorage on changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_COLLECTION, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save collection to localStorage:', e);
      }
    }
  }, [items, isLoaded]);

  // Fetch currency rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/currencies');
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            setExchangeRates(data.rates);
          }
        }
      } catch (err) {
        console.warn('Using default currency rates:', err);
      }
    }
    fetchRates();
  }, []);

  // Save token
  const handleSaveToken = (newToken: string) => {
    setToken(newToken);
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, newToken);
    } catch (e) {
      console.error(e);
    }
  };

  // Change currency
  const handleCurrencyChange = (curr: SupportedCurrency) => {
    setCurrency(curr);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, curr);
    } catch (e) {
      console.error(e);
    }
  };

  // Clear collection
  const handleClearCollection = () => {
    if (window.confirm('Are you sure you want to clear your entire collection calculator?')) {
      setItems([]);
    }
  };

  // Toggle Real Value Calculator visibility
  const handleToggleRealValueCalculator = () => {
    setShowRealValueCalculator((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_SHOW_RVC, String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Add release from Discogs search
  const handleAddRelease = async (
    discogsId: number,
    mediaGrade: GoldmineGrade,
    sleeveGrade: GoldmineGrade
  ) => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['x-discogs-token'] = token;
      }

      const res = await fetch(`/api/discogs/release/${discogsId}`, { headers });
      const releaseData = await res.json();

      const minPrice = releaseData.minPriceUSD || 10;
      const medianPrice = releaseData.medianPriceUSD || 25;
      const maxPrice = releaseData.maxPriceUSD || 60;
      const formatCategory = releaseData.formatCategory || 'Vinyl';

      const estimated = calculateConditionAdjustedValue(
        mediaGrade,
        sleeveGrade,
        minPrice,
        medianPrice,
        maxPrice,
        formatCategory
      );

      const newItem: CollectionItem = {
        id: `release-${discogsId}-${Date.now()}`,
        discogsId,
        title: releaseData.title || 'Untitled',
        artist: releaseData.artist || 'Unknown Artist',
        year: releaseData.year,
        format: releaseData.format || 'Vinyl, LP',
        formatCategory,
        label: releaseData.label || '',
        catalogNumber: releaseData.catalogNumber || '',
        country: releaseData.country || '',
        thumb: releaseData.thumb || releaseData.coverImage || '',
        genres: releaseData.genres || [],
        styles: releaseData.styles || [],
        mediaGrade,
        sleeveGrade,
        minPriceUSD: minPrice,
        medianPriceUSD: medianPrice,
        maxPriceUSD: maxPrice,
        numForSale: releaseData.numForSale,
        currentLowestPriceUSD: releaseData.currentLowestPriceUSD ?? null,
        estimatedValueUSD: estimated,
        notes: releaseData.notes || '',
        dateAdded: new Date().toISOString(),
      };

      setItems((prev) => [newItem, ...prev]);
    } catch (err) {
      console.error('Error fetching release details:', err);
    }
  };

  // Manual Item Add
  const handleAddManualItem = (item: CollectionItem) => {
    setItems((prev) => [item, ...prev]);
  };

  // Update item grade (Recalculate condition value immediately)
  const handleUpdateItemGrade = useCallback(
    (id: string, mediaGrade: GoldmineGrade, sleeveGrade: GoldmineGrade) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          const updatedEstimated = calculateConditionAdjustedValue(
            mediaGrade,
            sleeveGrade,
            item.minPriceUSD,
            item.medianPriceUSD,
            item.maxPriceUSD,
            item.formatCategory
          );

          return {
            ...item,
            mediaGrade,
            sleeveGrade,
            estimatedValueUSD: updatedEstimated,
          };
        })
      );
    },
    []
  );

  // Update item notes
  const handleUpdateItemNotes = useCallback((id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  }, []);

  // Remove item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f6] dark:bg-[#121212] text-[#333333] dark:text-[#f0f0f0] font-sans text-[14px] transition-colors duration-150">
      {/* Sticky Header */}
      <Header
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearCollection={handleClearCollection}
        onToggleMethodology={() => setIsMethodologyOpen(true)}
        itemCount={items.length}
        hasCustomToken={Boolean(token)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Single-Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">
        {/* KPI Metrics Dashboard */}
        <section aria-label="Collection Value Summary">
          <MetricsCards
            items={items}
            currency={currency}
            rates={exchangeRates}
            showRealValueCalculator={showRealValueCalculator}
          />
        </section>

        {/* Search Bar & Add to Calculator */}
        <section aria-label="Discogs Item Search and Add">
          <div className="p-4 rounded bg-white dark:bg-[#1e1e1e] border border-[#e0e0e0] dark:border-[#333333] shadow-sm space-y-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-bold text-[#222222] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0275d8] dark:bg-[#388bfd]" />
                Find & Add Music to Calculator
              </h2>
              <span className="text-[12px] text-[#777777] dark:text-[#9e9e9e] hidden sm:inline">
                Real-time Discogs search with server proxy caching
              </span>
            </div>

            <SearchBar
              onAddRelease={handleAddRelease}
              onOpenManualAdd={() => setIsManualAddOpen(true)}
              token={token}
            />
          </div>
        </section>

        {/* Collection Interactive Data Table */}
        <section aria-label="Collection Items Data Table">
          <CollectionTable
            items={items}
            currency={currency}
            rates={exchangeRates}
            onUpdateItemGrade={handleUpdateItemGrade}
            onUpdateItemNotes={handleUpdateItemNotes}
            onRemoveItem={handleRemoveItem}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
            showRealValueCalculator={showRealValueCalculator}
            onToggleRealValueCalculator={handleToggleRealValueCalculator}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e0e0e0] dark:border-[#2a2a2a] py-5 text-center text-[12px] text-[#777777] dark:text-[#9e9e9e] bg-white dark:bg-[#181818] mt-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Discogs Music Collection Valuator • Powered by Discogs database & Goldmine Grading
          </p>
          <div className="flex items-center gap-3 text-[#666666] dark:text-[#9e9e9e]">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="hover:text-[#0275d8] dark:hover:text-[#58a6ff] transition-colors"
            >
              Grading Standards
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[#0275d8] dark:hover:text-[#58a6ff] transition-colors"
            >
              API & Cache
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ManualAddModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        onAddManualItem={handleAddManualItem}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={token}
        onSaveToken={handleSaveToken}
      />

      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
