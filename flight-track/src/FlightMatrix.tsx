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

    // Disable image smoothing for sharp rendering
    ctx.imageSmoothingEnabled = false;

    // Clear canvas (black background)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 320, 180);

    // Draw airline logo on the left if available
    if (airline && imageRef.current && imageRef.current.complete) {
      try {
        ctx.drawImage(imageRef.current, 10, 10, 80, 80);
      } catch (e) {
        // Image not loaded yet
      }
    }

    // Green text (like retro displays)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px monospace';

    if (loading) {
      ctx.fillText('LOADING...', 120, 60);
      return;
    }

    if (!callsign) {
      ctx.fillText('NO AIRCRAFT', 120, 60);
      return;
    }

    // Draw flight info on the right side starting at x=100
    ctx.fillText(`${callsign}`, 100, 30);
    ctx.fillText(`${origin.slice(1, 4)} -> ${destination.slice(1, 4)}`, 100, 65);
    ctx.fillText(`${altitude !== null ? `${altitude} ft ${speed}` : 'Unknown'}kts`, 100, 100);
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
        width={320}
        height={180}
        style={{
          border: '2px solid #333',
          backgroundColor: '#000',
          imageRendering: 'pixelated',
          width: '320px',
          height: '180px',
        }}
      />
    </>
  );
}
