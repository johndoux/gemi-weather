import { strings } from '@/constants/strings';
import { GeoResult } from '@/lib/geocoding';
import { toUsStateAbbrev } from '@/lib/us-states';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

const STORE_KEY = 'wloc';
const STALE_MS = 30 * 60 * 1000;

interface CachedLocation {
  lat: number;
  lon: number;
  cityName: string;
}

type WeatherState =
  | { status: 'loading' }
  | {
      status: 'needs-location';
      isResolving: boolean;
      locationError?: string;
      canAskAgain: boolean;
    }
  | {
      status: 'ok';
      apparentTempF: number;
      weatherCode: number;
      isDay: boolean;
      cityName: string;
      canUseGPS: boolean;
      isResolvingManual: boolean;
      manualLocationError?: string;
      isGPSRefreshing: boolean;
    }
  | { status: 'error'; message: string };

export type UseWeatherReturn = WeatherState & {
  refresh: () => Promise<void>;
  refreshGPSLocation: () => Promise<void>;
  setManualLocation: (text: string) => Promise<void>;
  selectPlace: (place: GeoResult) => Promise<void>;
};

async function loadCache(): Promise<CachedLocation | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedLocation;
  } catch {
    return null;
  }
}

async function saveCache(loc: CachedLocation): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(loc));
  } catch (e) {
    if (__DEV__) console.warn('[useWeather] saveCache failed:', e);
  }
}

async function fetchWeather(lat: number, lon: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=apparent_temperature,wind_speed_10m,weather_code,is_day` +
    `&temperature_unit=fahrenheit` +
    `&wind_speed_unit=mph`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return {
    apparentTempF: data.current.apparent_temperature as number,
    weatherCode:   data.current.weather_code as number,
    isDay:         data.current.is_day === 1,
  };
}

async function runGPSFlow(): Promise<CachedLocation> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
  });
  const { latitude: lat, longitude: lon } = pos.coords;
  const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
  const place  = geo[0];
  const city   = place?.city;
  // Normalize region to a USPS abbreviation for US results so GPS and manual
  // selections format the same way (e.g. "California" → "CA").
  const region = place?.isoCountryCode === 'US' ? toUsStateAbbrev(place?.region) : place?.region;
  const cityName =
    [city, region].filter(Boolean).join(', ') ||
    region ||
    strings.location_fallback_city;
  const loc: CachedLocation = { lat, lon, cityName };
  await saveCache(loc);
  return loc;
}

// Returns a setState updater — passed directly to setState(locationErrorUpdater(msg))
// which React calls as a functional update: setState(prev => ...).
function locationErrorUpdater(msg: string) {
  return (prev: WeatherState): WeatherState => {
    if (prev.status === 'needs-location') return { ...prev, isResolving: false, locationError: msg };
    if (prev.status === 'ok') return { ...prev, isResolvingManual: false, manualLocationError: msg };
    return prev;
  };
}

export function useWeather(): UseWeatherReturn {
  const [state, setState] = useState<WeatherState>({ status: 'loading' });
  const lastFetchRef = useRef<number>(0);
  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);
  // Tracks whether GPS permission is currently granted — independent of which
  // coordinates we're displaying. Used so the GPS button stays visible even
  // after the user switches to a manual location.
  const gpsPermittedRef = useRef(false);
  // Tracks whether the app can still ask for GPS permission (not permanently denied).
  // Button stays visible when this is true so tapping it triggers the permission prompt.
  const canAskGPSRef = useRef(false);
  // Incremented on every user-initiated location change. Any async callback
  // that completes with a stale generation is discarded, preventing a slow
  // geocode or weather fetch from overwriting a newer result.
  const locationGenRef = useRef(0);

  const fetchAndSetOk = useCallback(
    async (lat: number, lon: number, cityName: string, gen: number) => {
      coordsRef.current = { lat, lon };
      const weather = await fetchWeather(lat, lon);
      if (locationGenRef.current !== gen) return;
      lastFetchRef.current = Date.now();
      setState({
        status: 'ok',
        apparentTempF: weather.apparentTempF,
        weatherCode:   weather.weatherCode,
        isDay:         weather.isDay,
        cityName,
        canUseGPS: gpsPermittedRef.current || canAskGPSRef.current,
        isResolvingManual: false,
        isGPSRefreshing: false,
      });
    },
    // [] is correct — gpsPermittedRef, canAskGPSRef, coordsRef, and locationGenRef
    // are refs with stable identity; .current is always the latest value without
    // them needing to be in the dependency array.
    []
  );

  const refresh = useCallback(async () => {
    const coords = coordsRef.current;
    if (!coords) return;
    try {
      const weather = await fetchWeather(coords.lat, coords.lon);
      lastFetchRef.current = Date.now();
      setState((prev) => {
        if (prev.status !== 'ok') return prev;
        return { ...prev, apparentTempF: weather.apparentTempF, weatherCode: weather.weatherCode, isDay: weather.isDay };
      });
    } catch (e) {
      if (__DEV__) console.warn('[useWeather] refresh failed:', e);
    }
  }, []);

  const refreshGPSLocation = useCallback(async () => {
    const gen = ++locationGenRef.current;
    setState((prev) => {
      if (prev.status !== 'ok') return prev;
      return { ...prev, isGPSRefreshing: true };
    });
    try {
      if (!gpsPermittedRef.current) {
        const requested = await Location.requestForegroundPermissionsAsync();
        if (locationGenRef.current !== gen) return;
        if (requested.status !== 'granted') {
          canAskGPSRef.current = requested.canAskAgain ?? false;
          setState((prev) => {
            if (prev.status !== 'ok') return prev;
            return { ...prev, isGPSRefreshing: false, canUseGPS: canAskGPSRef.current };
          });
          return;
        }
        gpsPermittedRef.current = true;
        canAskGPSRef.current = false;
      }
      const loc = await runGPSFlow();
      if (locationGenRef.current !== gen) return;
      await fetchAndSetOk(loc.lat, loc.lon, loc.cityName, gen);
    } catch (e) {
      if (__DEV__) console.warn('[useWeather] refreshGPSLocation failed:', e);
      if (locationGenRef.current !== gen) return;
      setState((prev) => {
        if (prev.status !== 'ok') return prev;
        return { ...prev, isGPSRefreshing: false };
      });
    }
  }, [fetchAndSetOk]);

  // Mark a manual-location attempt as in-flight in the right state slice.
  const markManualResolving = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'needs-location') {
        return { ...prev, isResolving: true, locationError: undefined };
      }
      if (prev.status === 'ok') {
        return { ...prev, isResolvingManual: true, manualLocationError: undefined };
      }
      return prev;
    });
  }, []);

  const setManualLocation = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const gen = ++locationGenRef.current;
      markManualResolving();

      try {
        const results = await Location.geocodeAsync(trimmed);
        if (locationGenRef.current !== gen) return;
        if (!results || results.length === 0) {
          setState(locationErrorUpdater(strings.error_location_not_found));
          return;
        }
        const { latitude: lat, longitude: lon } = results[0];
        await saveCache({ lat, lon, cityName: trimmed });
        await fetchAndSetOk(lat, lon, trimmed, gen);
      } catch {
        if (locationGenRef.current !== gen) return;
        setState(locationErrorUpdater(strings.error_connection));
      }
    },
    [fetchAndSetOk, markManualResolving]
  );

  const selectPlace = useCallback(
    async (place: GeoResult) => {
      const gen = ++locationGenRef.current;
      markManualResolving();

      // For US results, show the USPS state abbreviation so the display
      // matches what reverseGeocodeAsync returns from GPS ("CA" not "California").
      const region = place.countryCode === 'US' ? toUsStateAbbrev(place.admin1) : place.admin1;
      const cityName = [place.name, region].filter(Boolean).join(', ');
      try {
        await saveCache({ lat: place.lat, lon: place.lon, cityName });
        await fetchAndSetOk(place.lat, place.lon, cityName, gen);
      } catch {
        if (locationGenRef.current !== gen) return;
        setState(locationErrorUpdater(strings.error_connection));
      }
    },
    [fetchAndSetOk, markManualResolving]
  );

  useEffect(() => {
    let cancelled = false;

    async function handleNoCache(perm: Location.LocationPermissionResponse): Promise<void> {
      if (perm.status === 'undetermined') {
        let requested: Location.LocationPermissionResponse;
        try {
          requested = await Location.requestForegroundPermissionsAsync();
        } catch {
          setState({ status: 'needs-location', isResolving: false, canAskAgain: true });
          return;
        }
        if (requested.status === 'granted') {
          gpsPermittedRef.current = true;
          canAskGPSRef.current = false;
          try {
            const loc = await runGPSFlow();
            if (!cancelled) await fetchAndSetOk(loc.lat, loc.lon, loc.cityName, 0);
          } catch {
            if (!cancelled) setState({ status: 'needs-location', isResolving: false, canAskAgain: requested.canAskAgain ?? true });
          }
        } else {
          canAskGPSRef.current = requested.canAskAgain ?? false;
          if (!cancelled) setState({ status: 'needs-location', isResolving: false, canAskAgain: requested.canAskAgain ?? false });
        }
      } else {
        setState({ status: 'needs-location', isResolving: false, canAskAgain: perm.canAskAgain ?? true });
      }
    }

    async function handleGranted(cache: CachedLocation | null): Promise<void> {
      try {
        const loc = await runGPSFlow();
        if (!cancelled) await fetchAndSetOk(loc.lat, loc.lon, loc.cityName, 0);
      } catch {
        if (cache && !cancelled) {
          await fetchAndSetOk(cache.lat, cache.lon, cache.cityName, 0);
        } else if (!cancelled) {
          setState({ status: 'error', message: strings.error_gps });
        }
      }
    }

    async function handleCacheOnly(cache: CachedLocation): Promise<void> {
      try {
        await fetchAndSetOk(cache.lat, cache.lon, cache.cityName, 0);
      } catch (e) {
        if (__DEV__) console.warn('[useWeather] handleCacheOnly: weather fetch failed:', e);
        if (!cancelled) setState({ status: 'error', message: strings.error_weather_fetch });
      }
    }

    async function init(): Promise<void> {
      const cache = await loadCache();
      if (cancelled) return;

      let perm: Location.LocationPermissionResponse;
      try {
        perm = await Location.getForegroundPermissionsAsync();
      } catch (e) {
        if (__DEV__) console.warn('[useWeather] init: could not check location permissions:', e);
        if (cache) await fetchAndSetOk(cache.lat, cache.lon, cache.cityName, 0);
        else setState({ status: 'error', message: strings.error_permissions });
        return;
      }

      const granted = perm.status === 'granted';
      const canAskAgain = perm.canAskAgain ?? true;

      if (granted) {
        gpsPermittedRef.current = true;
      } else {
        canAskGPSRef.current = canAskAgain;
      }

      if (!cache && !granted) { await handleNoCache(perm); return; }
      if (granted)             { await handleGranted(cache); return; }
      if (cache)                 await handleCacheOnly(cache);
    }

    init();

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && Date.now() - lastFetchRef.current > STALE_MS) {
        refresh();
      }
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [fetchAndSetOk, refresh]);

  return { ...state, refresh, refreshGPSLocation, setManualLocation, selectPlace } as UseWeatherReturn;
}
