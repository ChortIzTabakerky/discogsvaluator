export type GoldmineGrade = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P';

export interface GradeDefinition {
  code: GoldmineGrade;
  name: string;
  multiplier: number; // e.g. 1.0 for M, 0.85 for NM, 0.70 for VG+
  description: string;
  color: string;
  badgeBg: string;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rateToUSD currency
}

export interface DiscogsPriceStats {
  lowest_price?: number | null;
  median_price?: number | null;
  highest_price?: number | null;
  blocked_from_sale?: boolean;
}

export interface CollectionItem {
  id: string; // unique ID in user's collection
  discogsId: number;
  title: string;
  artist: string;
  year?: number | string;
  format: string; // e.g. "Vinyl, LP", "CD, Album"
  formatCategory: 'Vinyl' | 'CD' | 'Cassette' | 'Box Set' | 'Other';
  label?: string;
  catalogNumber?: string;
  country?: string;
  thumb?: string;
  coverImage?: string;
  genres?: string[];
  styles?: string[];
  
  // Grading
  mediaGrade: GoldmineGrade;
  sleeveGrade: GoldmineGrade;
  
  // Historical / Marketplace Base Prices (stored in USD as baseline)
  minPriceUSD: number;
  medianPriceUSD: number;
  maxPriceUSD: number;
  numForSale?: number;
  currentLowestPriceUSD?: number | null; // Current active marketplace price it is selling for
  
  // Condition Adjusted Valuation (in USD)
  estimatedValueUSD: number;
  
  // User notes & date
  notes?: string;
  dateAdded: string;
}

export interface SearchResultItem {
  id: number;
  title: string; // usually "Artist - Title"
  artist?: string;
  titleOnly?: string;
  year?: string;
  format?: string[];
  formatCategory: 'Vinyl' | 'CD' | 'Cassette' | 'Box Set' | 'Other';
  label?: string[];
  catno?: string;
  country?: string;
  thumb?: string;
  cover_image?: string;
  genre?: string[];
  style?: string[];
  lowest_price?: number;
  estimated_median?: number;
}
