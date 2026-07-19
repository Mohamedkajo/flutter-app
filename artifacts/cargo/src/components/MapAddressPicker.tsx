import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icons (Vite/webpack bundling issue with leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom branded pin icon
const cargoIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:40px;height:48px;
      display:flex;flex-direction:column;align-items:center;
      filter: drop-shadow(0 4px 8px rgba(94,45,145,0.4));
    ">
      <div style="
        width:40px;height:40px;
        background:linear-gradient(135deg,#5E2D91,#47206E);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        display:flex;align-items:center;justify-content:center;
      ">
        <svg style="transform:rotate(45deg);color:white;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="width:2px;height:8px;background:#5E2D91;border-radius:1px;"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48],
});

interface LatLng { lat: number; lng: number }

interface ReverseGeocodeResult {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    country?: string;
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data: ReverseGeocodeResult = await res.json();
    const { road, suburb, city, town } = data.address;
    const parts = [road, suburb, city || town].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : data.display_name;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// Inner component that handles map click events
function DraggableMarker({ position, onChange }: { position: LatLng; onChange: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return (
    <Marker
      position={position}
      icon={cargoIcon}
      draggable
      eventHandlers={{ dragend: (e) => { const m = e.target; onChange(m.getLatLng()); } }}
    />
  );
}

interface MapAddressPickerProps {
  onAddressSelected: (address: string, lat: number, lng: number) => void;
}

export function MapAddressPicker({ onAddressSelected }: MapAddressPickerProps) {
  // Default to Dubai center
  const [position, setPosition] = useState<LatLng>({ lat: 25.2048, lng: 55.2708 });
  const [resolvedAddress, setResolvedAddress] = useState<string>('');
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveAddress = useCallback(async (pos: LatLng) => {
    setGeocoding(true);
    const addr = await reverseGeocode(pos.lat, pos.lng);
    setResolvedAddress(addr);
    onAddressSelected(addr, pos.lat, pos.lng);
    setGeocoding(false);
  }, [onAddressSelected]);

  const handlePositionChange = useCallback((pos: LatLng) => {
    setPosition(pos);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => resolveAddress(pos), 600);
  }, [resolveAddress]);

  useEffect(() => {
    resolveAddress(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        mapRef.current?.flyTo(newPos, 16, { duration: 1 });
        resolveAddress(newPos);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height: 240 }}>
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <DraggableMarker position={position} onChange={handlePositionChange} />
        </MapContainer>

        {/* Locate me button overlay */}
        <button
          onClick={handleLocateMe}
          className="absolute bottom-3 right-3 z-[1000] w-10 h-10 bg-white rounded-xl shadow-lg border border-border flex items-center justify-center text-primary hover:bg-surface transition-colors"
          title="Use my location"
        >
          {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
        </button>

        {/* Instruction badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          Tap map or drag pin to set location
        </div>
      </div>

      {/* Resolved address */}
      <div className="flex items-start gap-2 px-1">
        {geocoding
          ? <Loader2 size={16} className="text-primary mt-0.5 shrink-0 animate-spin" />
          : <div className="w-4 h-4 rounded-full bg-primary mt-0.5 shrink-0" />
        }
        <p className="text-sm text-foreground leading-snug">
          {geocoding ? 'Resolving address…' : resolvedAddress || 'Tap the map to select a location'}
        </p>
      </div>
    </div>
  );
}
