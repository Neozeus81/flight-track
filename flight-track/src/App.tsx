import './App.css'
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';

interface Aircraft {
  lat: number;
  lon: number;
  callsign?: string;
  altitude?: number;
}

function App() {
  const defaultPosition = [0,0] as [number, number];
  const [aircraftPosition, setAircraftPosition] = useState<[number, number]>(defaultPosition);
  const [callsign, setCallsign] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect hook triggered');
    const fetchClosestAircraft = async () => {
      try {
        const lat = defaultPosition[0];
        const lon = defaultPosition[1];
        const distance = 250;

        const url = `http://localhost:8080/api/closest?lat=${lat}&lon=${lon}&distance=${distance}`;
        console.log('Fetching from:', url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        console.log('Data type:', typeof data);
        console.log('Is data an array?', Array.isArray(data));
        console.log('Data length:', data.length);
        console.log(data.ac[0]); // Log the first aircraft object if it exists

        // The API returns an array with the closest aircraft
        // Extract lat/lon from the response
          const aircraft = data.ac[0];
          if (aircraft.lat && aircraft.lon) {
            setAircraftPosition([aircraft.lat, aircraft.lon]);
            setCallsign(aircraft.flight || 'N/A');
            console.log('Aircraft position set to:', [aircraft.lat, aircraft.lon]);
          }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch aircraft');
        console.error('Error fetching aircraft:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosestAircraft();
  }, []);

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Default location marker */}
      <Marker position={defaultPosition}>
        <Popup>Search location</Popup>
      </Marker>

      {/* Aircraft marker */}
      {!loading && !error && (
        <Marker position={aircraftPosition}>
          <Popup>{callsign}</Popup>
        </Marker>
      )}

      {error && (
        <div style={{ color: 'red', padding: '10px' }}>
          Error: {error}
        </div>
      )}
    </MapContainer>
  );
}

export default App
