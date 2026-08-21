// components/Map.js
import React, {useState, useCallback, useEffect} from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  InfoWindow
} from '@vis.gl/react-google-maps';
import {FetchData} from "../../api/http";
import { apiBaseUrl, apiRoutes, googleMapsApiKey, googleMapsMapId } from '../config/env';
import { NIGHT_MAP_STYLES, getPinColors } from '../config/mapLayout';
import SkateboardMarker from './SkateboardMarker';

const MapLoadingState = () => (
  <div className="flex justify-center items-center h-full bg-slate-800 text-slate-300">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
    <p className="ml-4">Loading skate parks...</p>
  </div>
);

const ParkInfoContent = ({park}) => (
  <div className="p-3.5 max-w-xs bg-slate-800 border border-slate-700 rounded-2xl shadow-xl font-sans text-slate-100">
    <h3 className="m-0 mb-1.5 font-semibold text-slate-100">{park.parkName}</h3>
    <p className="m-0 mb-1.5 text-sm text-slate-400"><span className="text-slate-300 font-medium">Address:</span> {park.parkAddress}</p>
    {park.parkDescription && <p className="m-0 mb-2.5 text-sm text-slate-400">{park.parkDescription}</p>}
    <div className="info-actions">
      <button
        className="px-3 py-2 border-none bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium cursor-pointer transition-colors"
        onClick={() => window.open(`https://maps.google.com/dir/?api=1&destination=${park.locationLatitude},${park.locationLongitude}`)}>
        Get Directions
      </button>
    </div>
  </div>
);

const SkateParksMap = ({
                         center = {lat: 40.75494942, lng: -111.90282008},
                         zoom = 11,
                         onParkSelect
                       }) => {
  const [skateparks, setSkateparks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);

  useEffect(() => {
    const fetchParks = async () => {
      setLoading(true);
      try {
        const response = await FetchData(`${apiBaseUrl}${apiRoutes.getParks}`);
        if (!Array.isArray(response)) {
          throw new Error(`Expected park list array, got ${typeof response}`);
        }
        setSkateparks(response);
      } catch (err) {
        setError('Failed to load skatepark data. Please try again later.');
        console.error('Error fetching skateparks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParks();
  }, []);

  const handleMarkerClick = useCallback((park) => {
    setSelectedPark(park);
    onParkSelect?.(park);
  }, [onParkSelect]);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPark(null);
  }, []);

  if (loading) {
    return <div style={{height: '500px'}}><MapLoadingState/></div>;
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-rose-500/40 text-rose-400 px-4 py-3 rounded-xl relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="bg-slate-800 border border-rose-500/40 text-rose-400 px-4 py-3 rounded-xl relative" role="alert">
        <strong className="font-bold">Google Maps key missing.</strong>
        <span className="block sm:inline"> Set GOOGLE_MAPS_JS_KEY in SkateDirectory/.env and restart Vite.</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl" style={{height: '500px', width: '100%'}}>
      <APIProvider apiKey={googleMapsApiKey}>
        <Map
          {...(googleMapsMapId ? { mapId: googleMapsMapId } : { styles: NIGHT_MAP_STYLES })}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {skateparks.map((park) => {
            const position = {
              lat: park.locationLatitude,
              lng: park.locationLongitude
            };

            if (googleMapsMapId) {
              const pinColors = getPinColors(park.difficultyOpinion);
              const isSelected = selectedPark?.id === park.id;
              return (
                <AdvancedMarker
                  key={park.id}
                  position={position}
                  onClick={() => handleMarkerClick(park)}
                  title={park.parkName}
                >
                  <SkateboardMarker colors={pinColors} selected={isSelected} />
                </AdvancedMarker>
              );
            }

            return (
              <Marker
                key={park.id}
                position={position}
                onClick={() => handleMarkerClick(park)}
                title={park.parkName}
              />
            );
          })}

          {selectedPark && (
            <InfoWindow
              position={{
                lat: selectedPark.locationLatitude,
                lng: selectedPark.locationLongitude
              }}
              onCloseClick={handleInfoWindowClose}
              pixelOffset={[0, -40]}
            >
              <ParkInfoContent park={selectedPark}/>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default SkateParksMap;
