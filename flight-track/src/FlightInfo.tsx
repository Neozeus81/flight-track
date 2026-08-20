interface FlightInfoProps {
  callsign: string;
  origin: string;
  destination: string;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  airline?: { name: string; icao: string; iata: string };
  loading: boolean;
}

export function FlightInfo({ callsign, origin, destination, altitude, heading, speed ,airline, loading }: FlightInfoProps) {
  if (loading) {
    return <div style={styles.container}>Loading flight data...</div>;
  }

  if (!callsign) {
    return <div style={styles.container}>No aircraft found</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Closest Flight</h2>
      <div style={styles.callsignRowContainer}>
        {airline && (
          <img
            src={`../../public/${callsign.slice(0, 3)}.svg`}
            style={styles.logo}
          />
        )}
        <div>
          <span style={styles.label}>Callsign:</span>
          <span style={styles.value}> {callsign}</span>
        </div>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.label}>Origin:</span>
        <span style={styles.value}>{origin || 'Unknown'}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.label}>Destination:</span>
        <span style={styles.value}>{destination || 'Unknown'}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.label}>Alt:</span>
        <span style={styles.value}>{altitude !== null ? `${altitude} ft` : 'Unknown'}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.label}>Heading:</span>
        <span style={styles.value}>{heading !== null ? `${heading}°` : 'Unknown'}</span>
      </div>
      <div style={styles.infoRow}>
        <span style={styles.label}>Speed:</span>
        <span style={styles.value}>{speed !== null ? `${speed} kts` : 'Unknown'}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#003478',
    padding: '20px',
    borderRadius: '8px',
    margin: '10px',
    fontFamily: 'Arial, sans-serif',
  } as React.CSSProperties,
  title: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #070707',
  } as React.CSSProperties,
  label: {
    fontWeight: 'bold',
    color: '#fcf6f6',
  } as React.CSSProperties,
  value: {
    color: '#0ebce8',
  } as React.CSSProperties,
  callsignRowContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #020000',
  } as React.CSSProperties,
  callsignRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  } as React.CSSProperties,
  logo: {
    width: '50px',
    height: '50px',
    objectFit: 'contain',
    borderRadius: '4px',
    flexShrink: 0,
  } as React.CSSProperties,
};
