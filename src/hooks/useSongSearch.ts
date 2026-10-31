import { useEffect, useState } from 'react';

import { errorMessage } from '@/lib/errors';
import { searchSongs, type SearchResult } from '@/lib/itunes';

export const MIN_SEARCH_LENGTH = 2;

// Busca músicas enquanto a pessoa digita, esperando ela parar por um instante.
export function useSongSearch(term: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const query = term.trim();
  const active = query.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (query.length < MIN_SEARCH_LENGTH) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const songs = await searchSongs(query);
        if (!cancelled) {
          setResults(songs);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return { results: active ? results : [], searching, error, active };
}
