// components/Map.js
import React, {useState, useCallback, useEffect} from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import config from '../../env.json';
import {FetchData} from "../../api/http";

const MapLoadingState = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-4">Loading skate parks...</p>
  </div>
);

const ParkInfoContent = ({park}) => (
  <div className="p-2.5 max-w-xs bg-white rounded-lg shadow-lg font-sans">
    <h3 className="m-0 mb-1.5 font-bold">{park.parkName}</h3>
    <p className="m-0 mb-1.5"><strong>Address:</strong> {park.parkAddress}</p>
    {park.parkDescription && <p className="m-0 mb-2.5">{park.parkDescription}</p>}
    <div className="info-actions">
      <button
        className="px-3 py-2 border-none bg-blue-600 text-white rounded cursor-pointer"
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
        const response = await FetchData(`${config.BASE_URL}${config.REL_GET_PARK}`);
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div style={{height: '500px', width: '100%'}}>
      <APIProvider apiKey={config.GOOGLE_MAPS_JS_KEY}>
        <Map
          id={'2f0f02dd437a53e8af5f16ee'}
          mapId={'2f0f02dd437a53e8af5f16ee'}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {skateparks.map((park) => (
            <AdvancedMarker
              key={park.id}
              position={{
                lat: park.locationLatitude,
                lng: park.locationLongitude
              }}
              onClick={() => handleMarkerClick(park)}
              title={park.parkName}
            >
              <Pin/>
            </AdvancedMarker>
          ))}

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
