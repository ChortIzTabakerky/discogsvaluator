import { NextRequest, NextResponse } from 'next/server';
import { proxyCache } from '@/lib/cache';
import { categorizeFormat } from '@/lib/goldmine';
import { SearchResultItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim() || '';
  const formatFilter = searchParams.get('format')?.trim() || '';
  const userToken = request.headers.get('x-discogs-token')?.trim() || process.env.DISCOGS_TOKEN || '';

  if (!query) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const cacheKey = `search:${query.toLowerCase()}:${formatFilter.toLowerCase()}`;
  const cached = proxyCache.get<SearchResultItem[]>(cacheKey);

  if (cached) {
    return NextResponse.json({
      results: cached.data,
      total: cached.data.length,
      cached: true,
      cachedAt: new Date(cached.timestamp).toISOString(),
    });
  }

  try {
    const discogsUrl = new URL('https://api.discogs.com/database/search');
    discogsUrl.searchParams.set('q', query);
    discogsUrl.searchParams.set('type', 'release');
    discogsUrl.searchParams.set('per_page', '25');
    if (formatFilter && formatFilter !== 'All') {
      discogsUrl.searchParams.set('format', formatFilter);
    }

    const headers: Record<string, string> = {
      'User-Agent': 'DiscogsCollectionValuator/1.0 (+http://localhost:3000)',
      'Accept': 'application/json',
    };

    if (userToken) {
      headers['Authorization'] = `Discogs token=${userToken}`;
    }

    const res = await fetch(discogsUrl.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`Discogs search API returned status ${res.status}: ${res.statusText}`);
      return NextResponse.json({
        results: [],
        total: 0,
        notice: res.status === 429 
          ? 'Discogs rate limit reached. Please wait a minute or configure your Personal Access Token in Settings.' 
          : 'Discogs API returned an error or requires an API token for full results.',
      });
    }

    const data = await res.json();
    const rawResults = data.results || [];

    const mappedResults: SearchResultItem[] = rawResults.map((item: any) => {
      const formatCategory = categorizeFormat(item.format);
      
      // Discogs titles in search are usually "Artist - Title"
      let artist = '';
      let titleOnly = item.title || '';
      if (item.title && item.title.includes(' - ')) {
        const parts = item.title.split(' - ');
        artist = parts[0].trim();
        titleOnly = parts.slice(1).join(' - ').trim();
      }

      return {
        id: item.id,
        title: item.title,
        artist,
        titleOnly,
        year: item.year || '',
        format: item.format || [],
        formatCategory,
        label: item.label || [],
        catno: item.catno || '',
        country: item.country || '',
        thumb: item.thumb || item.cover_image || '',
        cover_image: item.cover_image || item.thumb || '',
        genre: item.genre || [],
        style: item.style || [],
        lowest_price: item.lowest_price || null,
      };
    });

    // Save in server proxy cache
    proxyCache.set(cacheKey, mappedResults, 24);

    return NextResponse.json({
      results: mappedResults,
      total: mappedResults.length,
      cached: false,
    });
  } catch (error: any) {
    console.error('Discogs search error:', error);
    return NextResponse.json({
      results: [],
      total: 0,
      error: error?.message || 'Failed to reach Discogs API',
    });
  }
}
