import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const QuickSearch = ({ parks = [], onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const query = searchTerm.toLowerCase();
      const filtered = parks
        .filter((park) => {
          const name = (park.parkName || park.ParkName || '').toLowerCase();
          const address = (park.parkAddress || park.ParkAddress || '').toLowerCase();
          return name.includes(query) || address.includes(query);
        })
        .slice(0, 6);

      setResults(filtered);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [searchTerm, parks]);

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
  const getId = (park) => park.id || park.ParkId;
  const getHours = (park) => {
    const opens = park.opens || park.Opens;
    const closes = park.closes || park.Closes;
    if (opens && closes) return `${opens} – ${closes}`;
    return null;
  };

  return (
    <div className="relative w-full">
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
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length > 1 && setShowResults(true)}
          onBlur={handleBlur}
          placeholder="Search parks by name or address…"
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-600/80 bg-slate-800/90 py-4 pl-14 pr-5 text-lg text-slate-100 placeholder:text-slate-500 shadow-lg shadow-black/30 outline-none transition-all focus:border-amber-400/70 focus:ring-4 focus:ring-amber-400/15"
        />
      </div>

      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/50"
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

      {showResults && results.length === 0 && searchTerm.length > 1 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-center shadow-2xl">
          <p className="text-slate-300">No parks found for “{searchTerm}”</p>
          <p className="mt-1 text-sm text-slate-500">Try another name or part of an address</p>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;
