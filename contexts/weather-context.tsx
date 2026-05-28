import { useWeather } from '@/hooks/use-weather';
import { createContext, useContext, type ReactNode } from 'react';

type WeatherValue = ReturnType<typeof useWeather>;

const WeatherContext = createContext<WeatherValue | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const weather = useWeather();
  return <WeatherContext.Provider value={weather}>{children}</WeatherContext.Provider>;
}

export function useWeatherContext(): WeatherValue {
  const value = useContext(WeatherContext);
  if (!value) throw new Error('useWeatherContext used outside WeatherProvider');
  return value;
}
