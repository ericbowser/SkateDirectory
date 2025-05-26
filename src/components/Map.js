import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router';
import {FetchData, PostData} from "../../api/http";

const MapView = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Load Google Maps API
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    googleMapScript.onload = () => setMapLoaded(true);
    document.head.appendChild(googleMapScript);

    // Fetch skatepark data
    fetchParks().then(parks => {
      console.log('parks', parks);
      setParks(parks);
      setLoading(false);
    });

    return () => {
      // Clean up Google Maps script
      document.head.removeChild(googleMapScript);
    };
  }, []);
  
  async function fetchParks() {
    const responseData = await FetchData(`${process.env.BASE_URL}${process.env.REL_GET_PARK}`)
    if(!responseData) {
      setError('Failed to load skatepark data. Please try again later.')
      return null;
    } 
    
    setParks(responseData);
  }

  // Initialize map once the script is loaded and parks are fetched
  useEffect(() => {
    if (mapLoaded && parks.length > 0) {
      initializeMap();
    }
  }, [mapLoaded, parks]);

  // Re-render markers when filter changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      filterMarkers();
    }
  }, [activeFilter]);

  const initializeMap = () => {
    // Center map on Salt Lake City
    const slc = { lat: 40.7608, lng: -111.8910 };

    const mapOptions = {
      center: slc,
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    };

    // Create the map
    const map = window.map
    mapInstanceRef.current = map;

    // Add markers for each park
    addMarkers(map);
  };

  const addMarkers = (map) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    parks.forEach((park) => {
      // Create marker
      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(park.LocationLatitude),
          lng: parseFloat(park.LocationLongitude)
        },
        map: map,
        title: park.ParkName,
        icon: getMarkerIcon(park.DifficultyOpinion),
        visible: shouldShowMarker(park)
      });

      // Create info window content
      const infoWindowContent = `
        <div class="info-window">
          <h3>${park.ParkName}</h3>
          <p>${park.ParkDescription.substring(0, 100)}${park.ParkDescription.length > 100 ? '...' : ''}</p>
          <p><strong>Difficulty:</strong> ${park.DifficultyOpinion}</p>
          <p><strong>Hours:</strong> ${park.Opens} - ${park.Closes}</p>
          <a href="/parks/${park.Id}" class="view-details">View Details</a>
        </div>
      `;

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Store marker for later reference
      markersRef.current.push(marker);
    });
  };

  const filterMarkers = () => {
    markersRef.current.forEach((marker, index) => {
      marker.setVisible(shouldShowMarker(parks[index]));
    });
  };

  const shouldShowMarker = (park) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'beginner') return park.DifficultyOpinion === 'Beginner';
    if (activeFilter === 'intermediate') return park.DifficultyOpinion === 'Intermediate';
    if (activeFilter === 'advanced') return park.DifficultyOpinion === 'Advanced';
    if (activeFilter === 'lighted') return park.HasLighting;
    return true;
  };

  const getMarkerIcon = (difficulty) => {
    // Different colored markers based on difficulty
    switch(difficulty) {
      case 'Beginner':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'Intermediate':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'Advanced':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return <div className="loading">Loading skatepark data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="map-view">
      <h2 className="text-2xl font-bold mb-4">Salt Lake City Skateparks</h2>
      <button id='fetchParks' onClick={fetchParks}>Fetch Parks</button>
      <div className="filters mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('all')}
          >
            All Parks
          </button>
          <button
            className={`px-4 py-2 rounded ${activeFilter === 'beginner' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('beginner')}
          >
            Beginner Friendly
          </button>
          <button
            className={`px-4 py-2 rounded ${activeFilter === 'intermediate' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('intermediate')}
          >
            Intermediate
          </button>
          <button
            className={`px-4 py-2 rounded ${activeFilter === 'advanced' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('advanced')}
          >
            Advanced
          </button>
          <button
            className={`px-4 py-2 rounded ${activeFilter === 'lighted' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleFilterChange('lighted')}
          >
            Night Lighting
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        className="h-[600px] w-full rounded-lg shadow-lg border border-gray-300"
      />

      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/green-dot.png" alt="Green marker" className="mr-2" />
            <span>Beginner Friendly</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" alt="Blue marker" className="mr-2" />
            <span>Intermediate</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Red marker" className="mr-2" />
            <span>Advanced</span>
          </div>
          <div className="flex items-center">
            <img src="http://maps.google.com/mapfiles/ms/icons/purple-dot.png" alt="Purple marker" className="mr-2" />
            <span>All Levels</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Park List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parks.filter(park => shouldShowMarker(park)).map(park => (
            <div key={park.Id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-semibold">{park.ParkName}</h4>
              <p className="text-gray-600 my-2">{park.ParkDescription.substring(0, 100)}...</p>
              <div className="flex justify-between items-center mt-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  park.DifficultyOpinion === 'Beginner' ? 'bg-green-100 text-green-800' :
                    park.DifficultyOpinion === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      park.DifficultyOpinion === 'Advanced' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                }`}>
                  {park.DifficultyOpinion}
                </span>
                <Link to={`/parks/${park.Id}`} className="text-blue-600 hover:underline">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;