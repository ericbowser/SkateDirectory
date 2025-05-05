import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import axios from 'axios';

const ParkDetail = () => {
  const { id } = useParams();
  const [park, setPark] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps API
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.onload = () => setMapLoaded(true);
    document.head.appendChild(googleMapScript);

    // Fetch skatepark data
    fetchParkDetails();

    return () => {
      // Clean up Google Maps script
      document.head.removeChild(googleMapScript);
    };
  }, [id]);

  // Initialize map once the script is loaded and park data is fetched
  useEffect(() => {
    if (mapLoaded && park) {
      initializeMap();
    }
  }, [mapLoaded, park]);

  const fetchParkDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/skateparks/${id}`);
      setPark(response.data);
      setFeatures(response.data.features || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load skatepark details. Please try again later.');
      setLoading(false);
      console.error('Error fetching skatepark details:', err);
    }
  };

  const initializeMap = () => {
    if (!park) return;

    const parkLocation = {
      lat: parseFloat(park.LocationLatitude),
      lng: parseFloat(park.LocationLongitude)
    };

    const mapOptions = {
      center: parkLocation,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    };

    // Create the map
    const map = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker for the park
    const marker = new window.google.maps.Marker({
      position: parkLocation,
      map: map,
      title: park.ParkName,
      animation: window.google.maps.Animation.DROP
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div><h3>${park.ParkName}</h3><p>${park.ParkAddress}</p></div>`
    });

    // Open info window by default
    infoWindow.open(map, marker);

    // Add click listener to marker
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  };

  const groupFeaturesByCategory = () => {
    return features.reduce((acc, feature) => {
      const category = feature.FeatureCategory || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});
  };

  const getHoursDisplay = () => {
    if (!park) return '';

    if (park.HasVariableHours) {
      return `${park.Opens} - ${park.VariableClosingType || 'Dusk'}`;
    } else {
      return `${park.Opens} - ${park.Closes}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error || 'Park not found'}</span>
      </div>
    );
  }

  const groupedFeatures = groupFeaturesByCategory();

  return (
    <div className="park-detail">
      <div className="mb-4">
        <Link to="/parks" className="text-blue-600 hover:underline">&larr; Back to All Parks</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{park.ParkName}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              park.DifficultyOpinion === 'Beginner' ? 'bg-green-100 text-green-800' :
                park.DifficultyOpinion === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                  park.DifficultyOpinion === 'Advanced' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
            }`}>
              {park.DifficultyOpinion}
            </span>

            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              park.ParkStatus === 'Active' ? 'bg-green-100 text-green-800' :
                park.ParkStatus === 'Under Construction' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
            }`}>
              {park.ParkStatus}
            </span>

            {park.HasLighting && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                Night Lighting
              </span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{park.ParkDescription}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Hours of Operation</h2>
            <p className="text-gray-700">{getHoursDisplay()}</p>
            {park.HasLighting && (
              <p className="text-sm text-gray-500 mt-1">This park has lighting for night skating</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Address</h2>
            <p className="text-gray-700">{park.ParkAddress}</p>
            {park.ParkWebsite && (
              <p className="mt-2">
                <a
                  href={park.ParkWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit Website
                </a>
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            {Object.keys(groupedFeatures).length === 0 ? (
              <p className="text-gray-500">No features listed</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(groupedFeatures).map(([category, features]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <ul className="list-disc pl-5">
                      {features.map(feature => (
                        <li key={feature.Id} className="text-gray-700">
                          {feature.FeatureName}
                          {feature.FeatureType && ` (${feature.FeatureType})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div
            ref={mapRef}
            className="h-80 w-full rounded-lg shadow-lg border border-gray-300 mb-6"
          />

          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Location Details</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Latitude:</span> {park.LocationLatitude}
              </div>
              <div>
                <span className="text-gray-600 font-medium">Longitude:</span> {park.LocationLongitude}
              </div>
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${park.LocationLatitude},${park.LocationLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkDetail;