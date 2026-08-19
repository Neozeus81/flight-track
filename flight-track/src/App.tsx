import './App.css'
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { FlightInfo } from './FlightInfo';
import { FlightMatrix } from './FlightMatrix';
import { TrackingPosi } from './TrackingPosi';

interface Aircraft {
  lat: number;
  lon: number;
  callsign?: string;
  altitude?: number;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}



function App() {
  const defaultPosition = [28.038681,-82.529606] as [number, number];
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
  const [mapLat, setMapLat] = useState<string>('');
  const [mapLon, setMapLon] = useState<string>('');
  const [trackingPositions, setTrackingPositions] = useState<any[]>([]);
  const [trackingResults, setTrackingResults] = useState<any[]>([]);

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
          setSpeed(aircraft.gs || null);
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

  const searchTrackingPositions = async () => {
    if (trackingPositions.length === 0) {
      console.warn('No tracking positions to search');
      return;
    }

    const results: any[] = [];

    for (const position of trackingPositions) {
      try {
        const lat = position.lat;
        const lon = position.lon;
        const distance = 250;

        const url = `http://localhost:8080/api/closest?lat=${lat}&lon=${lon}&distance=${distance}`;
        console.log(`Fetching aircraft near [${lat}, ${lon}]`);

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch for position [${lat}, ${lon}]`);
          continue;
        }

        const data = await response.json();
        const aircraft = data.ac[0];

        if (aircraft && aircraft.lat && aircraft.lon) {
          // Fetch aircraft details
          try {
            const odResponse = await fetch(`http://localhost:8080/api/odinfo?callsign=${aircraft.flight}`);
            if (odResponse.ok) {
              const odData = await odResponse.json();
              results.push({
                searchPosition: { lat, lon },
                callsign: aircraft.flight || 'N/A',
                aircraftLat: aircraft.lat,
                aircraftLon: aircraft.lon,
                altitude: aircraft.alt_baro || null,
                heading: aircraft.nav_heading || null,
                speed: aircraft.gs || null,
                origin: odData.response.flightroute.origin.icao_code || 'Unknown',
                destination: odData.response.flightroute.destination.icao_code || 'Unknown',
                airline: odData.response.flightroute.airline || null,
              });
            } else {
              results.push({
                searchPosition: { lat, lon },
                callsign: aircraft.flight || 'N/A',
                aircraftLat: aircraft.lat,
                aircraftLon: aircraft.lon,
                altitude: aircraft.alt_baro || null,
                heading: aircraft.nav_heading || null,
                speed: aircraft.gs || null,
                origin: 'Unknown',
                destination: 'Unknown',
              });
            }
          } catch (odError) {
            console.warn(`Failed to fetch details for ${aircraft.flight}`);
            results.push({
              searchPosition: { lat, lon },
              callsign: aircraft.flight || 'N/A',
              aircraftLat: aircraft.lat,
              aircraftLon: aircraft.lon,
              altitude: aircraft.alt_baro || null,
              heading: aircraft.nav_heading || null,
              speed: aircraft.gs || null,
              origin: 'Unknown',
              destination: 'Unknown',
            });
          }
        }
      } catch (err) {
        console.error(`Error searching position:`, err);
      }
    }

    setTrackingResults(results);
    console.log('Tracking results:', results);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', gap: '10px', padding: '10px 0' }}>
      {/* Left 1/3 - TrackingPos */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <TrackingPosi 
          mapLat={mapLat} 
          mapLon={mapLon} 
          setMapLat={setMapLat} 
          setMapLon={setMapLon} 
          trackingPositions={trackingPositions}
          setTrackingPositions={setTrackingPositions}
          trackingResults={trackingResults}
          onSearch={searchTrackingPositions}
        />
      </div>

      {/* Right 2/3 - Matrix and Map stacked vertically */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* FlightMatrix on top */}
        <div style={{ flex: 0 }}>
          <FlightMatrix
            callsign={callsign}
            origin={origin}
            destination={destination}
            altitude={altitude}
            heading={heading}
            speed={speed}
            airline={airline}
            loading={loading}
          />
        </div>

        {/* Map below, takes remaining space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapClickHandler
              onMapClick={(lat, lon) => {
                setMapLat(lat.toFixed(6));
                setMapLon(lon.toFixed(6));
              }}
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
      </div>
    </div>
  );
}

export default App
