import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

const COUNTRY_CURRENCY = {
  'United States': 'USD', 'United Kingdom': 'GBP', 'Canada': 'CAD',
  'Australia': 'AUD', 'Nigeria': 'NGN', 'Ghana': 'GHS', 'Kenya': 'KES',
  'South Africa': 'ZAR', 'Uganda': 'UGX', 'Tanzania': 'TZS', 'Rwanda': 'RWF',
  'Egypt': 'EGP', 'Morocco': 'MAD', 'Ethiopia': 'ETB', 'Senegal': 'XOF',
  'Cameroon': 'XAF', 'India': 'INR', 'Pakistan': 'PKR', 'Bangladesh': 'BDT',
  'United Arab Emirates': 'AED', 'Saudi Arabia': 'SAR', 'Qatar': 'QAR',
  'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR',
  'Netherlands': 'EUR', 'Ireland': 'EUR', 'Portugal': 'EUR', 'Belgium': 'EUR',
  'Austria': 'EUR', 'Brazil': 'BRL', 'Mexico': 'MXN', 'Argentina': 'ARS',
  'Colombia': 'COP', 'Chile': 'CLP', 'Japan': 'JPY', 'China': 'CNY',
  'South Korea': 'KRW', 'Singapore': 'SGD', 'Malaysia': 'MYR',
  'Indonesia': 'IDR', 'Philippines': 'PHP', 'Thailand': 'THB',
  'Vietnam': 'VND', 'New Zealand': 'NZD', 'Switzerland': 'CHF',
  'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK', 'Poland': 'PLN',
  'Turkey': 'TRY', 'Israel': 'ILS',
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState({ city: '', country: '' });
  const [currency, setCurrency] = useState('USD');
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLoading(false);
        resolve(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setGranted(true);
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
            const data = await resp.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const country = data.address?.country || '';
            setLocationInfo({ city, country });
            if (country && COUNTRY_CURRENCY[country]) {
              setCurrency(COUNTRY_CURRENCY[country]);
            }
          } catch { /* ignore */ }
          setLoading(false);
          resolve(true);
        },
        () => {
          setLoading(false);
          resolve(false);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <LocationContext.Provider value={{ location, locationInfo, currency, granted, loading, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
