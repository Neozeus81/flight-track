import { useState, useEffect } from 'react';

interface TrackingTableProps {
  mapLat?: string;
  mapLon?: string;
  setMapLat?: (lat: string) => void;
  setMapLon?: (lon: string) => void;
  trackingPositions?: any[];
  setTrackingPositions?: (positions: any[]) => void;
  trackingResults?: any[];
}

interface TrackingPosition {
  id: number;
  lat: number;
  lon: number;
  isMainLocation?: boolean;
}

export function TrackingPosi({
  mapLat = '',
  mapLon = '',
  setMapLat,
  setMapLon,
  trackingPositions = [],
  setTrackingPositions,
  trackingResults = [],
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
          onKeyDown={(e) => e.key === 'Enter' && addPair()}
          step="0.0001"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => handleLonChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPair()}
          step="0.0001"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={addPair} style={{ padding: '5px 15px' }}>
          Add Location
        </button>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Latitude
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Longitude
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Closest Flight
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Origin
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Dest
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f0f0f0' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => {
            // Match result to its originating position so it stays tied together
            const result = trackingResults.find((r) => r.positionId === pair.id);
            return (
              <tr key={pair.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {pair.lat.toFixed(4)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {pair.lon.toFixed(4)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {result ? result.callsign : '—'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {result ? result.origin : '—'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {result ? result.destination : '—'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {!pair.isMainLocation && (
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
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pairs.length === 0 && <p style={{ color: '#999' }}>No locations added yet</p>}
    </div>
  );
}
