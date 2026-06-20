// Open-Meteo Geocoding API client.
// Endpoint handles both place names and postal codes (full and partial prefix).

export interface GeoResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  lat: number;
  lon: number;
  population?: number;
}

export interface GeocodingError extends Error {
  kind: 'network' | 'server';
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
  population?: number;
}

interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
  generationtime_ms?: number;
}

function makeError(kind: 'network' | 'server', message: string): GeocodingError {
  const err = new Error(message) as GeocodingError;
  err.kind = kind;
  return err;
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(query)}` +
    `&count=10&language=en&format=json`;

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw makeError('network', (e as Error).message);
  }

  if (!res.ok) {
    let reason: string | undefined;
    try {
      reason = ((await res.json()) as { reason?: string }).reason;
    } catch {
      // body wasn't JSON — fall back to status-only message
    }
    throw makeError('server', reason ?? `HTTP ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoResponse;
  if (!data.results) return [];

  return data.results
    .map((r) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      countryCode: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
      population: r.population,
    }))
    .sort((a, b) => (b.population ?? -1) - (a.population ?? -1));
}

export function formatPlace(r: GeoResult): { primary: string; secondary: string } {
  return {
    primary: r.name,
    secondary: [r.admin1, r.country].filter(Boolean).join(', '),
  };
}
