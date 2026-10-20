import { NextResponse } from 'next/server';
import { DEFAULT_CURRENCIES } from '@/lib/currencies';
import { proxyCache } from '@/lib/cache';

export async function GET() {
  const cacheKey = 'currency_rates_usd';
  const cached = proxyCache.get<Record<string, number>>(cacheKey);

  if (cached) {
    return NextResponse.json({
      rates: cached.data,
      cached: true,
      lastUpdated: new Date(cached.timestamp).toISOString(),
    });
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.rates) {
        const rates: Record<string, number> = {
          USD: 1.0,
          EUR: data.rates.EUR || DEFAULT_CURRENCIES.EUR.rateToUSD,
          GBP: data.rates.GBP || DEFAULT_CURRENCIES.GBP.rateToUSD,
          JPY: data.rates.JPY || DEFAULT_CURRENCIES.JPY.rateToUSD,
          CAD: data.rates.CAD || DEFAULT_CURRENCIES.CAD.rateToUSD,
          AUD: data.rates.AUD || DEFAULT_CURRENCIES.AUD.rateToUSD,
        };

        proxyCache.set(cacheKey, rates, 24);
        return NextResponse.json({
          rates,
          cached: false,
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Could not fetch external currency rates, using defaults:', err);
  }

  // Fallback default rates
  const fallbackRates: Record<string, number> = {
    USD: DEFAULT_CURRENCIES.USD.rateToUSD,
    EUR: DEFAULT_CURRENCIES.EUR.rateToUSD,
    GBP: DEFAULT_CURRENCIES.GBP.rateToUSD,
    JPY: DEFAULT_CURRENCIES.JPY.rateToUSD,
    CAD: DEFAULT_CURRENCIES.CAD.rateToUSD,
    AUD: DEFAULT_CURRENCIES.AUD.rateToUSD,
  };

  return NextResponse.json({
    rates: fallbackRates,
    cached: false,
    isFallback: true,
    lastUpdated: new Date().toISOString(),
  });
}
