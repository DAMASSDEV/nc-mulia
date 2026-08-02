import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface PlaceResult {
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
}

export function PlacesAutocomplete({ value, onChange, onPlaceSelect, placeholder = 'Ketik alamat...' }: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const initAutocomplete = useCallback(() => {
    if (!window.google || !inputRef.current) return;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    }
    if (!serviceRef.current) {
      const div = document.createElement('div');
      serviceRef.current = new google.maps.places.PlacesService(div);
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['address_components', 'formatted_address', 'geometry.location', 'url'],
      types: ['address'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.geometry?.location) return;
      const getComponent = (type: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (place as any).address_components?.find((c: { types: string[]; long_name: string }) => c.types.includes(type))?.long_name ?? '';

      const streetNumber = getComponent('street_number');
      const route = getComponent('route');
      const address = [streetNumber, route].filter(Boolean).join(' ');

      onPlaceSelect({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        address: address || (place as any).formatted_address || '',
        city: getComponent('locality') || getComponent('administrative_area_level_2') || '',
        province: getComponent('administrative_area_level_1') || '',
        lat: place.geometry!.location.lat(),
        lng: place.geometry!.location.lng(),
        mapsUrl: `https://www.google.com/maps?q=${place.geometry!.location.lat()},${place.geometry!.location.lng()}`,
      });

      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      setSuggestions([]);
      setShowDropdown(false);
    });
  }, [onPlaceSelect]);

  useEffect(() => {
    if (!API_KEY) return;

    if (window.google) {
      initAutocomplete();
      return;
    }

    window.initGoogleMaps = () => initAutocomplete();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [initAutocomplete]);

  const handleInputChange = (val: string) => {
    onChange(val);
    if (!window.google || !val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (!autocompleteServiceRef.current || !sessionTokenRef.current) {
      setShowDropdown(false);
      return;
    }

    const request: google.maps.places.AutocompleteRequest = { input: val, sessionToken: sessionTokenRef.current };
    autocompleteServiceRef.current.getPlacePredictions(request, (results) => {
      if (results) {
        setSuggestions(results.slice(0, 5));
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    });
  };

  const handleSuggestionClick = (placeId: string, description: string) => {
    if (!inputRef.current) return;
    inputRef.current.value = description;
    onChange(description);

    if (!serviceRef.current) return;
    serviceRef.current.getDetails(
      { placeId, fields: ['address_components', 'formatted_address', 'geometry.location', 'url'], sessionToken: sessionTokenRef.current! },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (place: any) => {
        if (!place?.geometry?.location) return;
        const getComponent = (type: string) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (place as any).address_components?.find((c: { types: string[]; long_name: string }) => c.types.includes(type))?.long_name ?? '';

        onPlaceSelect({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          address: (place as any).formatted_address || '',
          city: getComponent('locality') || getComponent('administrative_area_level_2') || '',
          province: getComponent('administrative_area_level_1') || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          mapsUrl: `https://www.google.com/maps?q=${place.geometry.location.lat()},${place.geometry.location.lng()}`,
        });

        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        setSuggestions([]);
        setShowDropdown(false);
      }
    );
  };

  if (!API_KEY) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-3 pl-10 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
        <p className="text-xs text-foreground-subtle mt-1">
          Tambahkan VITE_GOOGLE_MAPS_API_KEY di .env untuk enable Places Autocomplete
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted animate-spin" />}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={`w-full h-10 px-3 pl-10 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary ${loading ? 'pl-10' : ''}`}
          autoComplete="off"
        />
        {!loading && <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-lg border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion.place_id, suggestion.description)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-surface-secondary transition-colors flex items-start gap-2 border-b border-border/50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-foreground-subtle mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{suggestion.structured_formatting.main_text}</span>
              <span className="text-foreground-muted text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
