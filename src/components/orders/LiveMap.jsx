import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const STREET_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  subdomains: ['a', 'b', 'c', 'd'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

function makeIcon(color, emoji) {
  return L.divIcon({
    className: 'eb-marker',
    html: `<div style="position:relative;width:34px;height:42px;">
      <svg width="34" height="42" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.6 0 4 3.6 4 8c0 5.4 7 15.5 7.3 16 .2.3.5.4.7.4s.5-.1.7-.4C13 23.5 20 13.4 20 8c0-4.4-3.6-8-8-8z"/>
        <circle cx="12" cy="8" r="3.2" fill="white"/>
      </svg>
      <span style="position:absolute;top:1px;left:0;width:34px;text-align:center;font-size:11px;line-height:1;">${emoji}</span>
    </div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

function FitBounds({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [markers, map]);
  return null;
}

const ICONS = {
  pickup: makeIcon('#16a34a', '📦'),
  delivery: makeIcon('#dc2626', '📍'),
  you: makeIcon('#2563eb', '🏃'),
  default: makeIcon('#f97316', ''),
};

export default function LiveMap({ center, markers = [], route = null, height = '220px', live = false }) {
  if (!center && (!markers || markers.length === 0)) return null;
  const fallback = center || markers[0];
  const positions = markers.length ? markers : [{ lat: fallback.lat, lng: fallback.lng }];

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-border relative">
      <MapContainer
        center={[fallback.lat, fallback.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer {...STREET_TILES} />
        <FitBounds markers={positions} />
        {route && route.length >= 2 && (
          <Polyline positions={route} pathOptions={{ color: '#f97316', weight: 4, opacity: 0.8, dashArray: '8 8' }} />
        )}
        {positions.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={ICONS[m.type] || ICONS.default}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
      {live && (
        <span className="absolute top-2 right-2 z-[1000] flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
        </span>
      )}
    </div>
  );
}
