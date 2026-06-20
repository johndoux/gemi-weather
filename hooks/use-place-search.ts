import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoResult, GeocodingError, searchPlaces } from '@/lib/geocoding';

export type PlaceSearchStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
export type PlaceSearchErrorKey = 'search_network_error' | 'search_generic_error';

export interface UsePlaceSearchReturn {
  results: GeoResult[];
  status: PlaceSearchStatus;
  errorKey?: PlaceSearchErrorKey;
  search: (query: string) => Promise<void>;
  reset: () => void;
}

export function usePlaceSearch(): UsePlaceSearchReturn {
  const [results,  setResults]  = useState<GeoResult[]>([]);
  const [status,   setStatus]   = useState<PlaceSearchStatus>('idle');
  const [errorKey, setErrorKey] = useState<PlaceSearchErrorKey | undefined>();

  // Incremented on every search invocation. Any async response from an older
  // generation is dropped so out-of-order results never overwrite newer ones.
  const searchGenRef    = useRef(0);
  const abortCtrlRef    = useRef<AbortController | null>(null);

  useEffect(() => () => abortCtrlRef.current?.abort(), []);

  const search = useCallback(async (query: string) => {
    abortCtrlRef.current?.abort();
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;
    const gen = ++searchGenRef.current;

    setStatus('loading');
    setErrorKey(undefined);

    try {
      const found = await searchPlaces(query, ctrl.signal);
      if (gen !== searchGenRef.current) return;
      setResults(found);
      setStatus(found.length > 0 ? 'ready' : 'empty');
    } catch (e) {
      if (gen !== searchGenRef.current) return;
      if ((e as Error).name === 'AbortError') return;
      const kind = (e as GeocodingError).kind;
      setResults([]);
      setStatus('error');
      setErrorKey(kind === 'network' ? 'search_network_error' : 'search_generic_error');
    }
  }, []);

  const reset = useCallback(() => {
    abortCtrlRef.current?.abort();
    searchGenRef.current++;
    setResults([]);
    setStatus('idle');
    setErrorKey(undefined);
  }, []);

  return { results, status, errorKey, search, reset };
}
