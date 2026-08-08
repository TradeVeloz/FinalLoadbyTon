import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UAE_LOCATIONS, UaeLocation } from '../../data/uae-locations';

export interface GeoLocation {
  name: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationOption {
  key: string;
  name: string;
  lat: number;
  lng: number;
}

interface LocationInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onSelect'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (location: GeoLocation) => void;
  onClear?: () => void;
  error?: string;
}

const NOMINATIM_ENDPOINT =
  import.meta.env.VITE_GEOCODING_API_URL || 'https://nominatim.openstreetmap.org/search';

const UAE_VIEWBOX = '51.5,22.6,57.0,26.5';
const DEBOUNCE_MS = 300;
const MIN_NETWORK_QUERY_LENGTH = 2;
const MIN_REQUEST_INTERVAL_MS = 1000;
const RESULTS_LIMIT = 6;

function matchLocal(query: string): LocationOption[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const matches: (UaeLocation & { score: number })[] = [];
  for (const loc of UAE_LOCATIONS) {
    const haystack = `${loc.name} ${loc.keywords.join(' ')}`.toLowerCase();
    if (!tokens.every((token) => haystack.includes(token))) continue;
    const nameLower = loc.name.toLowerCase();
    const score = nameLower.startsWith(q) ? 0 : nameLower.includes(q) ? 1 : 2;
    matches.push({ ...loc, score });
  }

  matches.sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return matches.slice(0, RESULTS_LIMIT).map((loc) => ({
    key: `local-${loc.name}`,
    name: loc.name,
    lat: loc.lat,
    lng: loc.lng,
  }));
}

function toOption(result: NominatimResult): LocationOption {
  return {
    key: `nom-${result.place_id}`,
    name: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
  };
}

export const LocationInput = React.forwardRef<HTMLInputElement, LocationInputProps>(
  ({ label, value, onChange, onSelect, onClear, error, placeholder, className, ...props }, ref) => {
    const [query, setQuery] = useState(value);
    const [nomResults, setNomResults] = useState<LocationOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [searchedQuery, setSearchedQuery] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const lastRequestAtRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    const requestSeqRef = useRef(0);

    const localResults = useMemo(() => matchLocal(query), [query]);

    const merged: LocationOption[] = useMemo(() => {
      const seen = new Set<string>();
      const out: LocationOption[] = [];
      for (const option of localResults) {
        if (seen.has(option.name)) continue;
        seen.add(option.name);
        out.push(option);
      }
      for (const option of nomResults) {
        if (seen.has(option.name)) continue;
        seen.add(option.name);
        out.push(option);
      }
      return out;
    }, [localResults, nomResults]);

    useEffect(() => {
      setQuery(value);
    }, [value]);

    useEffect(() => {
      const handlePointerDown = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handlePointerDown);
      return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    useEffect(() => () => abortRef.current?.abort(), []);

    const runNetworkSearch = useCallback((raw: string) => {
      const q = raw.trim();
      if (q.length < MIN_NETWORK_QUERY_LENGTH) {
        setNomResults([]);
        setLoading(false);
        return;
      }

      const seq = ++requestSeqRef.current;
      const now = Date.now();
      const wait = Math.max(0, lastRequestAtRef.current + MIN_REQUEST_INTERVAL_MS - now);

      const perform = () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        lastRequestAtRef.current = Date.now();
        setLoading(true);

        const params = new URLSearchParams({
          q,
          format: 'json',
          addressdetails: '0',
          limit: String(RESULTS_LIMIT),
          countrycodes: 'ae',
          viewbox: UAE_VIEWBOX,
          bounded: '1',
          'accept-language': 'en',
        });

        fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Geocoding request failed (${res.status})`);
            return res.json() as Promise<NominatimResult[]>;
          })
          .then((data) => {
            if (seq !== requestSeqRef.current) return;
            setNomResults(data.map(toOption));
            setSearchedQuery(q);
            setOpen(true);
          })
          .catch((err: unknown) => {
            if ((err as Error).name === 'AbortError') return;
            if (seq !== requestSeqRef.current) return;
            setNomResults([]);
          })
          .finally(() => {
            if (seq === requestSeqRef.current) setLoading(false);
          });
      };

      if (wait > 0) {
        window.setTimeout(perform, wait);
      } else {
        perform();
      }
    }, []);

    const debouncedNetworkSearch = useMemo(() => {
      let timer: number | undefined;
      return (q: string) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => runNetworkSearch(q), DEBOUNCE_MS);
      };
    }, [runNetworkSearch]);

    const handleChange = (next: string) => {
      setQuery(next);
      setHighlighted(-1);
      onChange(next);
      if (next.trim().length >= MIN_NETWORK_QUERY_LENGTH) {
        debouncedNetworkSearch(next);
      } else {
        setNomResults([]);
        setLoading(false);
      }
      if (matchLocal(next).length > 0) setOpen(true);
    };

    const selectOption = (option: LocationOption) => {
      setQuery(option.name);
      onChange(option.name);
      onSelect?.({ name: option.name, lat: option.lat, lng: option.lng });
      setOpen(false);
      setNomResults([]);
      setHighlighted(-1);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || merged.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlighted((i) => (i + 1) % merged.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlighted((i) => (i - 1 + merged.length) % merged.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (highlighted >= 0 && highlighted < merged.length) {
          selectOption(merged[highlighted]);
        }
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleClear = () => {
      setQuery('');
      onChange('');
      onClear?.();
      setNomResults([]);
      setOpen(false);
      setHighlighted(-1);
    };

    const hasLocalOnly = localResults.length > 0 && nomResults.length === 0;
    const showNoResults =
      open && !loading && merged.length === 0 && query.trim().length >= MIN_NETWORK_QUERY_LENGTH;

    return (
      <div ref={containerRef} className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={ref}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="location-suggestions"
            aria-label={label || 'Location'}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (merged.length > 0) setOpen(true);
            }}
            placeholder={placeholder}
            className={cn(
              'flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-9 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
              'focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-gray-700 dark:bg-navy-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-brand-orange',
              error && 'border-red-500 focus:ring-red-500/20 dark:border-red-500',
              className
            )}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {loading ? (
              <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />
            ) : value && query === value ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear location"
                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {open && merged.length > 0 && (
            <ul
              id="location-suggestions"
              role="listbox"
              className="absolute z-50 mt-1.5 w-full max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-navy-900 animate-fade-in"
            >
              {merged.map((option, index) => (
                <li key={option.key} role="option" aria-selected={index === highlighted}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectOption(option)}
                    className={cn(
                      'w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors',
                      index === highlighted
                        ? 'bg-brand-orange/10 text-navy-900 dark:text-gray-100'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-800'
                    )}
                  >
                    <MapPin className={cn('w-4 h-4 mt-0.5 shrink-0', index === highlighted ? 'text-brand-orange' : 'text-gray-400')} />
                    <span className="min-w-0 flex-1 break-words">{option.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showNoResults && (
            <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-2xl px-3.5 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-navy-900 dark:text-gray-400 animate-fade-in">
              No locations found for "{searchedQuery || query}"
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {(open || hasLocalOnly) && (
          <p className="text-[10px] text-gray-400">
            {hasLocalOnly
              ? 'Showing UAE locations instantly · Powered by OpenStreetMap Nominatim'
              : 'Search covers all seven emirates · Powered by OpenStreetMap Nominatim'}
          </p>
        )}
      </div>
    );
  }
);

LocationInput.displayName = 'LocationInput';
