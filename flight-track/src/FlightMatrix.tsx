import { useEffect, useRef } from 'react';

interface FlightMatrixProps {
  callsign: string;
  origin: string;
  destination: string;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  airline?: { name: string; icao: string; iata: string };
  loading: boolean;
}

export function FlightMatrix({ callsign, origin, destination, altitude, heading, speed, airline, loading }: FlightMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (black background)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 64, 32);

    // Draw airline logo on the left if available
    if (airline && imageRef.current && imageRef.current.complete) {
      try {
        ctx.drawImage(imageRef.current, 2, 2, 16, 16);
      } catch (e) {
        // Image not loaded yet
      }
    }

    // Green text (like retro displays)
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px Tiny5';

    if (loading) {
      ctx.fillText('LOADING...', 32, 10);
      return;
    }

    if (!callsign) {
      ctx.fillText('NO AIRCRAFT', 32, 10);
      return;
    }

    // Draw flight info on the right side starting at x=32
    ctx.fillText(`${callsign}`, 20, 6);
    ctx.fillText(`${origin.slice(1,4)} -> ${destination.slice(1,4)}`, 20, 13);
    ctx.fillText(`${altitude !== null ? `${altitude} ft ${speed}` : 'Unknown'}kts`, 20, 20);
    console.log(`${altitude !== null ? `${altitude} ft ${speed}` : 'Unknown'}kts`);
  }, [callsign, origin, destination, altitude, heading, airline, loading]);

  return (
    <>
      {airline && (
        <img
          ref={imageRef}
          src={`../../public/${callsign.slice(0, 3)}.svg`}
          alt={airline.name}
          style={{ display: 'none' }}
          onLoad={() => {
            // Trigger redraw when image loads
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.dispatchEvent(new Event('imageLoaded'));
            }
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        width={64}
        height={32}
        style={{
          border: '2px solid #333',
          backgroundColor: '#000',
          imageRendering: 'auto',
          width: '640px',
          height: '320px',
        }}
      />
    </>
  );
}
