import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

/** Lowercase, strip punctuation, collapse whitespace */
function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parkSearchText(park) {
  return normalize(
    [
      park.parkName,
      park.ParkName,
      park.parkAddress,
      park.ParkAddress,
      park.parkDescription,
      park.ParkDescription,
      park.parkStatus,
      park.ParkStatus,
    ]
      .filter(Boolean)
      .join(' ')
  );
}

/**
 * Fuzzy-ish match: every query token must appear in the park text,
 * or be within 1 edit of a word in the park text (typo tolerance).
 */
function parkMatchesQuery(park, query) {
  const haystack = parkSearchText(park);
  if (!haystack) return false;

  const tokens = normalize(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return false;

  const words = haystack.split(' ');

  return tokens.every((token) => {
    if (haystack.includes(token)) return true;
    // Allow short prefix matches (e.g. "fair" → fairmont)
    if (token.length >= 2 && words.some((w) => w.startsWith(token))) return true;
    // Simple typo tolerance for tokens length >= 4
    if (token.length >= 4) {
      return words.some((w) => w.length >= 4 && editDistance(token, w) <= 1);
    }
    return false;
  });
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 99;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function scorePark(park, query) {
  const name = normalize(park.parkName || park.ParkName || '');
  const q = normalize(query);
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (parkSearchText(park).includes(q)) return 40;
  return 20;
}

const QuickSearch = ({ parks = [], onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const results = useMemo(() => {
    const q = searchTerm.trim();
    if (q.length < 1) return [];
    return parks
      .filter((park) => parkMatchesQuery(park, q))
      .sort((a, b) => scorePark(b, q) - scorePark(a, q))
      .slice(0, 8);
  }, [searchTerm, parks]);

  useEffect(() => {
    setSelectedIndex(-1);
    if (searchTerm.trim().length >= 1) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm, results.length]);

  // Prefill keyboard selection when there's a clear single match (e.g. "kearns")
  useEffect(() => {
    if (results.length === 1 && scorePark(results[0], searchTerm) >= 60) {
      setSelectedIndex(0);
    }
  }, [results, searchTerm]);

  // Auto-open the unique strong match after a short pause (skip if already selected)
  useEffect(() => {
    if (results.length !== 1) return;
    const park = results[0];
    const name = park.parkName || park.ParkName || '';
    if (normalize(searchTerm) === normalize(name)) return;
    if (scorePark(park, searchTerm) < 60) return;

    const t = window.setTimeout(() => {
      setSearchTerm(name);
      setShowResults(false);
      setSelectedIndex(-1);
      onResultClick?.(park);
    }, 550);
    return () => window.clearTimeout(t);
  }, [results, searchTerm, onResultClick]);

  const handleKeyDown = (e) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (results[0]) {
          handleResultClick(results[0]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleResultClick = (park) => {
    setSearchTerm(park.parkName || park.ParkName || '');
    setShowResults(false);
    setSelectedIndex(-1);
    onResultClick?.(park);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setShowResults(false);
      }
    }, 150);
  };

  const getName = (park) => park.parkName || park.ParkName || 'Unknown park';
  const getAddress = (park) => park.parkAddress || park.ParkAddress || '';
  const getId = (park) => park.id ?? park.ParkId;
  const getHours = (park) => {
    const opens = park.opens || park.Opens;
    const closes = park.closes || park.Closes;
    if (opens && closes) return `${opens} – ${closes}`;
    return null;
  };

  const queryActive = searchTerm.trim().length >= 1;

  return (
    <div className="relative z-40 w-full">
      <label htmlFor="park-search" className="sr-only">
        Search skate parks
      </label>
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <svg
            className="h-6 w-6 text-slate-500 group-focus-within:text-amber-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="park-search"
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => queryActive && setShowResults(true)}
          onBlur={handleBlur}
          placeholder="Search parks by name, city, or address…"
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-600/80 bg-slate-800/90 py-4 pl-14 pr-5 text-lg text-slate-100 placeholder:text-slate-500 shadow-lg shadow-black/30 outline-none transition-all focus:border-amber-400/70 focus:ring-4 focus:ring-amber-400/15"
        />
      </div>

      {showResults && queryActive && parks.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-center shadow-2xl">
          <p className="text-slate-300">Park list not loaded yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Wait for the map to finish loading, then try again
          </p>
        </div>
      )}

      {showResults && queryActive && parks.length > 0 && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/50"
          role="listbox"
        >
          {results.map((park, index) => (
            <button
              key={getId(park)}
              type="button"
              role="option"
              aria-selected={selectedIndex === index}
              className={`flex w-full items-start justify-between gap-3 border-b border-slate-700/80 px-4 py-3 text-left last:border-b-0 transition-colors ${
                selectedIndex === index ? 'bg-slate-700/80' : 'hover:bg-slate-700/50'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleResultClick(park)}
            >
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold text-slate-100">{getName(park)}</h4>
                {getAddress(park) && (
                  <p className="mt-0.5 truncate text-sm text-slate-400">{getAddress(park)}</p>
                )}
                {getHours(park) && (
                  <p className="mt-1 text-xs text-slate-500">{getHours(park)}</p>
                )}
              </div>
              <span className="shrink-0 rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-400">
                Show on map
              </span>
            </button>
          ))}

          <div className="border-t border-slate-700 bg-slate-900/60 px-4 py-2">
            <Link
              to={`/parks?search=${encodeURIComponent(searchTerm)}`}
              className="block text-center text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              Browse all parks
            </Link>
          </div>
        </div>
      )}

      {showResults && queryActive && parks.length > 0 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-center shadow-2xl">
          <p className="text-slate-300">No parks found for “{searchTerm}”</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a city (Ogden, Provo) or part of a name (Fairmont, Vans)
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;
