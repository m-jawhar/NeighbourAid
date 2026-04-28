import { useMemo } from 'react';
import { MOCK_VOLUNTEERS } from '../../config/mockData';

function projectPoint(lat, lng) {
  const baseLat = 10.0559;
  const baseLng = 76.6497;
  return {
    x: 260 + (lng - baseLng) * 9000,
    y: 220 - (lat - baseLat) * 9000,
  };
}

function GoogleMapsUnavailableMap({ crises, volunteers, selectedCrisis }) {
  const visibleVolunteers = volunteers.length > 0 ? volunteers : MOCK_VOLUNTEERS;

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-navy/10 bg-gradient-to-br from-navy via-slate to-primary-900 shadow-card">
      <div className="map-grid absolute inset-0 opacity-25" />
      <svg viewBox="0 0 800 520" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="sea" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#0f2744" />
            <stop offset="100%" stopColor="#0d7a6b" />
          </linearGradient>
          <linearGradient id="land" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#d9f3ee" />
            <stop offset="100%" stopColor="#a8dbd1" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="800" height="520" fill="url(#sea)" />
        <path
          d="M241 34C278 46 300 76 309 107C319 141 336 159 345 193C353 224 355 268 371 301C387 333 418 358 419 393C420 426 393 450 351 472C327 485 302 490 286 476C268 458 251 435 232 424C212 412 179 414 162 398C143 381 142 347 148 319C154 290 165 266 173 235C180 208 183 180 193 152C204 118 217 79 241 34Z"
          fill="url(#land)"
          opacity="0.98"
        />
        <path
          d="M361 87C391 126 398 164 397 198C396 229 405 265 425 290C445 316 483 336 487 370"
          fill="none"
          stroke="#66b8aa"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M240 140C278 154 302 170 329 203C351 231 360 260 366 302"
          fill="none"
          stroke="#77d1c1"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.45"
        />

        <text x="555" y="70" fill="white" fontSize="16" fontWeight="700">
          Kerala Response Grid
        </text>
        <text x="555" y="95" fill="rgba(255,255,255,0.75)" fontSize="12">
          Demo fallback map
        </text>

        <circle cx="312" cy="220" r="7" fill="#0f2744" />
        <circle cx="312" cy="220" r="15" fill="none" stroke="#0d7a6b" strokeWidth="2" opacity="0.45" />
        <text x="330" y="224" fill="#ffffff" fontSize="13" fontWeight="600">
          Kothamangalam
        </text>

        {selectedCrisis && (() => {
          const point = projectPoint(selectedCrisis.lat, selectedCrisis.lng);
          return (
            <circle
              cx={point.x}
              cy={point.y}
              r="82"
              fill="rgba(13, 122, 107, 0.08)"
              stroke="rgba(255,255,255,0.32)"
              strokeDasharray="8 10"
            />
          );
        })()}

        {visibleVolunteers.map((volunteer) => {
          const point = projectPoint(volunteer.lat, volunteer.lng);
          return <circle key={volunteer.id} cx={point.x} cy={point.y} r="4" fill="#22c55e" opacity="0.7" />;
        })}

        {crises.map((crisis) => {
          const point = projectPoint(crisis.lat, crisis.lng);
          return (
            <g key={crisis.id}>
              <circle cx={point.x} cy={point.y} r="10" fill="#dc2626" />
              <circle cx={point.x} cy={point.y} r="22" fill="none" stroke="#fca5a5" strokeWidth="3" opacity="0.6">
                <animate attributeName="r" values="18;34;18" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>

      <div className="absolute left-6 top-6 rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur">
        <p className="font-heading text-sm font-semibold">Fallback Command Map</p>
        <p className="text-xs text-white/75">Google Maps API not configured. Crisis and responder density remain fully demoable.</p>
      </div>
    </div>
  );
}

export default function CrisisMap({ crises = [], volunteers = [], selectedCrisis = null }) {
  const mapsConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key',
  );

  const mapSummary = useMemo(() => {
    const activeCrisisCount = crises.filter((crisis) => crisis.status === 'active').length;
    return `${activeCrisisCount} active alerts · ${volunteers.length || MOCK_VOLUNTEERS.length} nearby responders`;
  }, [crises, volunteers]);

  if (!mapsConfigured) {
    return <GoogleMapsUnavailableMap crises={crises} volunteers={volunteers} selectedCrisis={selectedCrisis} />;
  }

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card">
      <iframe
        title="Crisis map"
        className="h-full min-h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=10.0559,76.6497&zoom=13&maptype=roadmap`}
      />
      <div className="absolute left-6 top-6 rounded-2xl bg-white/95 px-4 py-3 shadow-card">
        <p className="font-heading text-sm font-semibold text-navy">Live Ops Map</p>
        <p className="text-xs text-slate-500">{mapSummary}</p>
      </div>
    </div>
  );
}
