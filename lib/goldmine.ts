import { GoldmineGrade, GradeDefinition } from './types';

export const GOLDMINE_GRADES: Record<GoldmineGrade, GradeDefinition> = {
  'M': {
    code: 'M',
    name: 'Mint',
    multiplier: 1.0,
    description: 'Perfect, flawless condition. Often factory sealed or never played.',
    color: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-[#122b17] border-emerald-300 dark:border-[#1e4825] text-emerald-800 dark:text-emerald-300'
  },
  'NM': {
    code: 'NM',
    name: 'Near Mint',
    multiplier: 0.85,
    description: 'Nearly perfect, shows no obvious signs of wear. Exceptional quality.',
    color: 'text-teal-700 dark:text-teal-400',
    badgeBg: 'bg-teal-50 dark:bg-[#102b28] border-teal-300 dark:border-[#174641] text-teal-800 dark:text-teal-300'
  },
  'VG+': {
    code: 'VG+',
    name: 'Very Good Plus',
    multiplier: 0.70,
    description: 'Shows some signs of play, light scuffs or hairline marks that do not affect playability.',
    color: 'text-blue-700 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-[#102a45] border-blue-300 dark:border-[#1d446f] text-blue-800 dark:text-blue-300'
  },
  'VG': {
    code: 'VG',
    name: 'Very Good',
    multiplier: 0.50,
    description: 'Surface noise evident upon play, groove wear, visible scratches or ring wear.',
    color: 'text-amber-800 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-[#2b2410] border-amber-300 dark:border-[#463b17] text-amber-900 dark:text-amber-300'
  },
  'G+': {
    code: 'G+',
    name: 'Good Plus',
    multiplier: 0.35,
    description: 'Significant wear, continuous crackle/pops, seam splits on cover, but plays through.',
    color: 'text-yellow-800 dark:text-yellow-400',
    badgeBg: 'bg-yellow-50 dark:bg-[#2b2810] border-yellow-300 dark:border-[#464017] text-yellow-900 dark:text-yellow-300'
  },
  'G': {
    code: 'G',
    name: 'Good',
    multiplier: 0.25,
    description: 'Heavy wear, scratches, possible skips or repetitive ticks. Deep cosmetic wear.',
    color: 'text-stone-700 dark:text-stone-400',
    badgeBg: 'bg-stone-100 dark:bg-[#2a2a2a] border-stone-300 dark:border-[#444444] text-stone-800 dark:text-stone-300'
  },
  'F': {
    code: 'F',
    name: 'Fair',
    multiplier: 0.15,
    description: 'Severely damaged, cracked or badly warped. Will not play without skipping.',
    color: 'text-red-700 dark:text-red-400',
    badgeBg: 'bg-red-50 dark:bg-[#2b1010] border-red-300 dark:border-[#461717] text-red-800 dark:text-red-300'
  },
  'P': {
    code: 'P',
    name: 'Poor',
    multiplier: 0.08,
    description: 'Collection filler only until a better copy is found. Significant damage.',
    color: 'text-rose-800 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-[#2b1014] border-rose-300 dark:border-[#46171d] text-rose-900 dark:text-rose-300'
  }
};

export const ORDERED_GRADES: GoldmineGrade[] = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'];

/**
 * Calculates a condition-adjusted estimated realistic market value.
 * Takes into account:
 * - Media grade multiplier (70-85% weight)
 * - Sleeve grade multiplier (15-30% weight)
 * - Historical Min, Median, and Max Discogs sales
 */
export function calculateConditionAdjustedValue(
  mediaGrade: GoldmineGrade,
  sleeveGrade: GoldmineGrade,
  minPrice: number,
  medianPrice: number,
  maxPrice: number,
  formatCategory: 'Vinyl' | 'CD' | 'Cassette' | 'Box Set' | 'Other' = 'Vinyl'
): number {
  const mediaMultiplier = GOLDMINE_GRADES[mediaGrade]?.multiplier ?? 0.70;
  const sleeveMultiplier = GOLDMINE_GRADES[sleeveGrade]?.multiplier ?? 0.70;

  // Weight distribution: CD jewel cases are replaceable, so media carries more weight.
  // Vinyl jackets, inserts, and gatefolds have significant collectible weight.
  let mediaWeight = 0.70;
  let sleeveWeight = 0.30;

  if (formatCategory === 'CD') {
    mediaWeight = 0.85;
    sleeveWeight = 0.15;
  } else if (formatCategory === 'Box Set') {
    mediaWeight = 0.60;
    sleeveWeight = 0.40;
  }

  const combinedMultiplier = (mediaMultiplier * mediaWeight) + (sleeveMultiplier * sleeveWeight);

  // If min and max are available and reasonable
  if (minPrice > 0 && maxPrice >= minPrice) {
    if (combinedMultiplier >= 0.80) {
      // High grade (VG+ to Mint): scales between median and max
      const ratio = (combinedMultiplier - 0.80) / 0.20; // 0.0 to 1.0
      const estimated = medianPrice + (maxPrice - medianPrice) * Math.min(1, Math.max(0, ratio * 0.9));
      return Number(Math.max(minPrice, estimated).toFixed(2));
    } else {
      // Lower grade (Fair to VG): scales between min and median
      const ratio = combinedMultiplier / 0.80; // 0.0 to 1.0
      const estimated = minPrice + (medianPrice - minPrice) * Math.min(1, Math.max(0, ratio));
      return Number(Math.max(minPrice * 0.5, estimated).toFixed(2));
    }
  }

  // Fallback if only median is present:
  // Baseline Discogs median corresponds to ~VG+ / NM (approx 0.75 combined score)
  const basePrice = medianPrice > 0 ? medianPrice : (minPrice > 0 ? minPrice * 1.5 : 10.0);
  const normalizedMultiplier = combinedMultiplier / 0.75;
  const estimated = basePrice * normalizedMultiplier;

  return Number(Math.max(0.5, estimated).toFixed(2));
}

/**
 * Determine format category from format strings (e.g. ["Vinyl", "LP", "Album"])
 */
export function categorizeFormat(formats: string[] | string | undefined): 'Vinyl' | 'CD' | 'Cassette' | 'Box Set' | 'Other' {
  if (!formats) return 'Other';
  const formatStr = Array.isArray(formats) ? formats.join(' ').toLowerCase() : formats.toLowerCase();
  
  if (formatStr.includes('box set') || formatStr.includes('boxset') || formatStr.includes('deluxe edition')) {
    return 'Box Set';
  }
  if (formatStr.includes('vinyl') || formatStr.includes('lp') || formatStr.includes('12"') || formatStr.includes('7"') || formatStr.includes('45 rpm')) {
    return 'Vinyl';
  }
  if (formatStr.includes('cd') || formatStr.includes('compact disc') || formatStr.includes('cd-rom')) {
    return 'CD';
  }
  if (formatStr.includes('cassette') || formatStr.includes('tape')) {
    return 'Cassette';
  }
  return 'Other';
}
