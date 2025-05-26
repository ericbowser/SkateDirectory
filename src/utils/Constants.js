let map;
let markers = [];

function initMap() {
  // Initialize the map centered on Salt Lake City
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7608, lng: -111.8910 },
    zoom: 12,
  });

  // Add all markers initially
  addMarkers('all');
}

function addMarkers(filter) {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Filter parks based on selection
  const filteredParks = skateparks.filter(park => {
    if (filter === 'all') return true;
    if (filter === 'beginner') return park.difficulty === 'beginner';
    if (filter === 'advanced') return park.difficulty === 'advanced';
    if (filter === 'indoor') return park.type === 'indoor';
    return true;
  });

  // Add new markers
  filteredParks.forEach(park => {
    const marker = new google.maps.Marker({
      position: park.position,
      map: map,
      title: park.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
            <div>
              <h3>${park.name}</h3>
              <p>${park.description}</p>
              <p>Difficulty: ${park.difficulty}</p>
              <button onclick="location.href='/parks/${park.name.toLowerCase().replace(/\s+/g, '-')}'">
                View Details
              </button>
            </div>
          `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

function filterParks(filter) {
  addMarkers(filter);
}

// Note: In a real implementation, you would replace this with your actual Google Maps API key
// window.initMap = initMap;
