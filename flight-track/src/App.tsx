import './App.css'
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { FlightInfo } from './FlightInfo';
import { FlightMatrix } from './FlightMatrix';

interface Aircraft {
  lat: number;
  lon: number;
  callsign?: string;
  altitude?: number;
}



function App() {
  const defaultPosition = [35.508972,-80.881011] as [number, number];
  const [aircraftPosition, setAircraftPosition] = useState<[number, number]>(defaultPosition);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [callsign, setCallsign] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [airline, setAirline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // The API returns an array with the closest aircraft
        const aircraft = data.ac[0];
        if (aircraft.lat && aircraft.lon) {
          setAircraftPosition([aircraft.lat, aircraft.lon]);
          setCallsign(aircraft.flight || 'N/A');
          setAltitude(aircraft.alt_baro || null);
          setHeading(aircraft.nav_heading || null);
          setSpeed(aircraft.gs|| null);
          console.log('Aircraft flight', aircraft.flight);
          console.log('Aircraft position set to:', [aircraft.lat, aircraft.lon]);
          try {
            const odResponse = await fetch(`http://localhost:8080/api/odinfo?callsign=${aircraft.flight}`);
            if (odResponse.ok) {
              const odData = await odResponse.json();
              console.log('Aircraft info:', odData);
              setOrigin(odData.response.flightroute.origin.icao_code || 'Unknown');
              setDestination(odData.response.flightroute.destination.icao_code || 'Unknown');
              setAirline(odData.response.flightroute.airline || null);
              console.log('Origin:', odData.response.flightroute.origin.icao_code, 'Destination:', odData.response.flightroute.destination.icao_code);
            } else {
              console.warn('Failed to fetch aircraft details:', odResponse.statusText);
            }
          } catch (odError) {
            console.warn('Error fetching aircraft details:', odError);
            // App continues to work without aircraft details
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch aircraft');
        console.error('Error fetching aircraft:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchClosestAircraft();

    // Set up interval to fetch every 5 seconds (5000 ms)
    const interval = setInterval(fetchClosestAircraft, 50000);

    // Cleanup: clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <FlightInfo callsign={callsign} origin={origin} destination={destination} altitude={altitude} heading={heading} speed={speed} airline={airline} loading={loading} />
      <FlightMatrix callsign={callsign} origin={origin} destination={destination} altitude={altitude} heading={heading} speed airline={airline} loading={loading} />
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={defaultPosition}>
        <Popup>Search location</Popup>
      </Marker>

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
    </div>
  );
}

export default App
