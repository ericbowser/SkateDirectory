import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';

const QuickSearch = ({ parks, onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = parks.filter(park =>
        park.ParkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        park.ParkAddress.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to 5 results for quick display

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
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (park) => {
    setSearchTerm('');
    setShowResults(false);
    setSelectedIndex(-1);
    if (onResultClick) {
      onResultClick(park);
    }
  };

  const handleBlur = (e) => {
    // Delay hiding results to allow clicks on results
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setShowResults(false);
      }
    }, 150);
  };

  const getDistanceFromUser = (park) => {
    // Placeholder for geolocation distance calculation
    // You can implement this later with user's location
    return null;
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length > 1 && setShowResults(true)}
          onBlur={handleBlur}
          placeholder="Quick search for skate parks..."
          className="w-full p-3 pl-10 pr-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <div className="absolute left-3 top-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Quick Results Dropdown */}
      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto"
        >
          {results.map((park, index) => (
            <div
              key={park.ParkId}
              className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                selectedIndex === index ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleResultClick(park)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{park.ParkName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{park.ParkAddress}</p>

                  {/* Quick Info Row */}
                  <div className="flex items-center gap-2 mt-2">
                    {park.HasVariableHours ? (
                      <span className="text-xs text-gray-500">
                        {park.Opens} - Dusk
                      </span>
                    ) : park.Opens && park.Closes ? (
                      <span className="text-xs text-gray-500">
                        {park.Opens} - {park.Closes}
                      </span>
                    ) : null}

                    {getDistanceFromUser(park) && (
                      <span className="text-xs text-blue-600">
                        {getDistanceFromUser(park)} mi
                      </span>
                    )}
                  </div>

                  {/* Features Preview */}
                  {park.Features && park.Features.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        {park.Features.slice(0, 3).map(f => f.FeatureName).join(', ')}
                        {park.Features.length > 3 && ` +${park.Features.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-3 flex flex-col gap-1">
                  <Link
                    to={`/park/${park.ParkId}`}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details
                  </Link>
                  {park.LocationLatitude && park.LocationLongitude && (
                    <a
                      href={`https://maps.google.com/maps?q=${park.LocationLatitude},${park.LocationLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Directions
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* View All Results */}
          {parks.filter(park =>
            park.ParkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            park.ParkAddress.toLowerCase().includes(searchTerm.toLowerCase())
          ).length > 5 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <Link
                to={`/parks?search=${encodeURIComponent(searchTerm)}`}
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all results ({parks.filter(park =>
                park.ParkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                park.ParkAddress.toLowerCase().includes(searchTerm.toLowerCase())
              ).length})
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && searchTerm.length > 1 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3">
          <div className="text-center text-gray-500">
            <p>No parks found for "{searchTerm}"</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;