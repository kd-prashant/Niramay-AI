import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  humidity: number;
  condition: string;
  location: string;
  loading: boolean;
  lat?: number;
  lng?: number;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    humidity: 0,
    condition: 'Clear',
    location: 'Searching...',
    loading: true
  });

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeather(prev => ({ ...prev, loading: false, location: 'Location Disabled' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        setWeather({
          temp: Math.round(data.main.temp),
          humidity: data.main.humidity,
          condition: data.weather[0].main,
          location: data.name,
          loading: false,
          lat: latitude,
          lng: longitude
        });
      } catch (err) {
        console.error('Weather Fetch Error:', err);
        setWeather(prev => ({ ...prev, loading: false }));
      }
    }, () => {
      setWeather(prev => ({ ...prev, loading: false, location: 'Permission Denied' }));
    });
  }, []);

  return weather;
}
