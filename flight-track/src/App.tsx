import './App.css'
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {

  const position = [40.7588, -73.9851];
  return (
    // CRITICAL: The MapContainer MUST have an explicit height set via CSS
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Welcome to Times Square!
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default App
