import { useState, useEffect } from 'react';

interface TrackingTableProps {
  mapLat?: string;
  mapLon?: string;
  setMapLat?: (lat: string) => void;
  setMapLon?: (lon: string) => void;
  trackingPositions?: any[];
  setTrackingPositions?: (positions: any[]) => void;
  trackingResults?: any[];
  onSearch?: () => void;
}

interface TrackingPosition {
  id: number;
  lat: number;
  lon: number;
}

export function TrackingPosi({
  mapLat = '',
  mapLon = '',
  setMapLat,
  setMapLon,
  trackingPositions = [],
  setTrackingPositions,
  trackingResults = [],
  onSearch,
}: TrackingTableProps) {
  const [pairs, setPairs] = useState<TrackingPosition[]>(trackingPositions);
  const [lat, setLat] = useState(mapLat);
  const [lon, setLon] = useState(mapLon);

  // Sync pairs with trackingPositions from parent
  useEffect(() => {
    setPairs(trackingPositions);
  }, [trackingPositions]);

  // Update local state when map coordinates change
  useEffect(() => {
    if (mapLat) setLat(mapLat);
    if (mapLon) setLon(mapLon);
  }, [mapLat, mapLon]);

  const handleLatChange = (value: string) => {
    setLat(value);
    setMapLat?.(value);
  };

  const handleLonChange = (value: string) => {
    setLon(value);
    setMapLon?.(value);
  };

  const addPair = () => {
    if (lat && lon) {
      const newPair: TrackingPosition = {
        id: Date.now(),
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
      const updatedPairs = [...pairs, newPair];
      setPairs(updatedPairs);
      setTrackingPositions?.(updatedPairs);
      setLat('');
      setLon('');
    }
  };

  const deletePair = (id: number) => {
    const updatedPairs = pairs.filter((p) => p.id !== id);
    setPairs(updatedPairs);
    setTrackingPositions?.(updatedPairs);
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <h2>Tracking Positions</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => handleLatChange(e.target.value)}
          step="0.0001"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => handleLonChange(e.target.value)}
          step="0.0001"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={addPair} style={{ padding: '5px 15px' }}>
          Add Location
        </button>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: '#f0f0f0',
              }}
            >
              Latitude
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: '#f0f0f0',
              }}
            >
              Longitude
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: '#f0f0f0',
              }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {pair.lat.toFixed(4)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {pair.lon.toFixed(4)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button
                  onClick={() => deletePair(pair.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pairs.length === 0 && <p style={{ color: '#999' }}>No locations added yet</p>}

      {pairs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onSearch}
            style={{
              padding: '8px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
            }}
          >
            Search All Locations
          </button>
        </div>
      )}

      {trackingResults && trackingResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Search Results</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#e0e0e0', textAlign: 'left' }}>Callsign</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#e0e0e0', textAlign: 'left' }}>Origin</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#e0e0e0', textAlign: 'left' }}>Dest</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', backgroundColor: '#e0e0e0', textAlign: 'left' }}>Alt</th>
              </tr>
            </thead>
            <tbody>
              {trackingResults.map((result, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{result.callsign}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{result.origin}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{result.destination}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{result.altitude ? `${result.altitude}ft` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
