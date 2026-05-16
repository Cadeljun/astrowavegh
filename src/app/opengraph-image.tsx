import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AstroWave — Vibes Beyond the Horizon';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

/**
 * Root dynamic Open Graph image generator for the AstroWave homepage.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Glow */}
        <div
          style={{
            position: 'absolute',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(255, 209, 102, 0.15), transparent)',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Location Badge */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 209, 102, 0.1)',
            border: '1px solid rgba(255, 209, 102, 0.3)',
            borderRadius: '100px',
            padding: '8px 24px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              color: '#FFD166',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Accra, Ghana
          </span>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: '120px',
            fontWeight: 900,
            color: '#FFD166',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1,
            marginBottom: '24px',
          }}
        >
          ASTROWAVE
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#7B7B9A',
            fontStyle: 'italic',
            marginBottom: '48px',
          }}
        >
          Vibes Beyond the Horizon.
        </div>

        {/* Ecosystem List */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            color: '#7B7B9A',
            fontSize: '16px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <span>Events</span>
          <span>•</span>
          <span>Nightlife</span>
          <span>•</span>
          <span>Talent</span>
          <span>•</span>
          <span>Culture</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
