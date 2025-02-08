const coordinates = listing.geometry.coordinates;  // Parse the string if needed

// Initialize the map
const map = new maplibregl.Map({
  container: 'map',
  style: `https://tiles.locationiq.com/v3/streets/vector.json?key=${accessToken}`,
  center: coordinates,
  zoom: 12
});

// Add zoom and rotation controls to the map
const navControl = new maplibregl.NavigationControl({
  showZoom: true, // Show zoom-in and zoom-out buttons
  showCompass: false // Hide the compass button
});
map.addControl(navControl, 'top-left');

if (coordinates && coordinates.length === 2) {
  // Create a new marker and store it in the marker variable
  const marker = new maplibregl.Marker({color: 'red'})
    .setLngLat([coordinates[0], coordinates[1]]) // Coordinates should be [longitude, latitude]
    .addTo(map);
  
  // Create a popup with some content
  const popup = new maplibregl.Popup({ offset: 25 })  // Offset makes the popup not overlap the marker
    .setHTML(`<h4>${listing.location}</h4><p>Exact Location will be provided after booking.</p>`);  // HTML content for the popup

  // Attach the popup to the marker
  marker.setPopup(popup);
} else {
  console.log("Invalid coordinates", coordinates);
}
