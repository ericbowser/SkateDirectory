// components/Map.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import config from '../../env.json'

// Error Boundary Component
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-error">
          <h3>Map Loading Error</h3>
          <p>Unable to load the map. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Component
const MapLoadingState = () => (
  <div className="map-loading">
    <div className="loading-spinner"></div>
    <p>Loading skate parks...</p>
  </div>
);

// Main Map Component
const SkateParksMap = ({
                         center = { lat: 40.7128, lng: -74.0060 },
                         zoom = 11,
                         skateparks = [],
                         onParkSelect
                       }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const handleApiLoad = useCallback(() => {
    setIsLoaded(true);
    console.log('Maps API loaded successfully');
  }, []);

  const handleApiError = useCallback((error) => {
    setLoadError(error);
    console.error('Maps API failed to load:', error);
  }, []);

  const handleMarkerClick = useCallback((park) => {
    setSelectedPark(park);
    setInfoWindowOpen(true);
    onParkSelect?.(park);
  }, [onParkSelect]);

  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowOpen(false);
    setSelectedPark(null);
  }, []);

  // Create markers with custom styling based on difficulty
  const markers = useMemo(() => {
    return skateparks.map(park => ({
      key: `park-${park.Id || park.id}`,
      position: {
        lat: park.LocationLatitude,
        lng: park.LocationLongitude
      },
      park,
      difficulty: park.DifficultyOpinion
    }));
  }, [skateparks]);

  if (loadError) {
    return (
      <div className="map-error">
        <p>Failed to load Google Maps: {loadError.message}</p>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <APIProvider
        apiKey={config.GOOGLE_MAPS_JS_KEY}
        onLoad={handleApiLoad}
        onError={handleApiError}
      >
        {!isLoaded && <MapLoadingState />}
        <Map
          mapId="2f0f02dd437a53e8f6d66376"  // Your custom Map ID
          defaultCenter={center}
          defaultZoom={zoom}
          style={{ width: '100%', height: '500px' }}
          options={{
            gestureHandling: 'greedy',
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            disableDefaultUI: false
          }}
        >
          {markers.map(({ key, position, park, difficulty }) => (
            <AdvancedMarker
              key={key}
              position={position}
              onClick={() => handleMarkerClick(park)}
              title={`${park.ParkName} (${difficulty})`}
            >
              <DifficultyPin difficulty={difficulty} />
            </AdvancedMarker>
          ))}

          {infoWindowOpen && selectedPark && (
            <InfoWindow
              position={{
                lat: selectedPark.LocationLatitude,
                lng: selectedPark.LocationLongitude
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <ParkInfoContent park={selectedPark} />
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </MapErrorBoundary>
  );
};

// Custom Pin Component for Different Difficulties
const DifficultyPin = ({ difficulty }) => {
  const difficultyConfig = {
    'Beginner': { background: '#4CAF50', glyph: '🟢' },
    'Intermediate': { background: '#FF9800', glyph: '🟡' },
    'Advanced': { background: '#F44336', glyph: '🔴' },
    'Expert': { background: '#9C27B0', glyph: '🟣' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig['Beginner'];

  return (
    <Pin
      background={config.background}
      borderColor="#FFFFFF"
      glyphColor="#FFFFFF"
      glyph={config.glyph}
      scale={1.2}
    />
  );
};

// Info Window Content Component
const ParkInfoContent = ({ park }) => (
  <div className="park-info-window">
    <h3>{park.ParkName}</h3>
    <p><strong>Address:</strong> {park.ParkAddress}</p>
    <p><strong>Difficulty:</strong> {park.DifficultyOpinion}</p>
    {park.Description && <p>{park.Description}</p>}
    <div className="info-actions">
      <button onClick={() => window.open(`https://maps.google.com/dir/?api=1&destination=${park.LocationLatitude},${park.LocationLongitude}`)}>
        Get Directions
      </button>
    </div>
  </div>
);

export default SkateParksMap;