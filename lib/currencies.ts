import { SupportedCurrency, CurrencyConfig } from './types';

export const DEFAULT_CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateToUSD: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateToUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateToUSD: 0.77,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateToUSD: 152.5,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateToUSD: 1.38,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rateToUSD: 1.50,
  },
};

export function convertFromUSD(
  amountInUSD: number,
  targetCurrency: SupportedCurrency,
  customRates?: Record<SupportedCurrency, number>
): number {
  const rate = customRates?.[targetCurrency] ?? DEFAULT_CURRENCIES[targetCurrency]?.rateToUSD ?? 1.0;
  return amountInUSD * rate;
}

export function formatCurrency(
  amountInUSD: number,
  targetCurrency: SupportedCurrency,
  customRates?: Record<SupportedCurrency, number>
): string {
  const converted = convertFromUSD(amountInUSD, targetCurrency, customRates);
  const config = DEFAULT_CURRENCIES[targetCurrency] || DEFAULT_CURRENCIES.USD;

  if (targetCurrency === 'JPY') {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${config.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
