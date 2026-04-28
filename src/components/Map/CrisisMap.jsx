import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_VOLUNTEERS } from '../../config/mockData';

export default function CrisisMap({ crises = [], volunteers = [], selectedCrisis = null }) {
  const visibleVolunteers = volunteers.length > 0 ? volunteers : MOCK_VOLUNTEERS;
  const activeCrisisCount = crises.filter((crisis) => crisis.status === 'active').length;

  const mapSummary = useMemo(() => {
    return `${activeCrisisCount} active alerts · ${visibleVolunteers.length} nearby responders`;
  }, [activeCrisisCount, visibleVolunteers.length]);

  // Center on Kothamangalam
  const defaultCenter = [10.0559, 76.6497];

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%', minHeight: '420px', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw 2km response radius around selected crisis */}
        {selectedCrisis && (
          <Circle
            center={[selectedCrisis.lat, selectedCrisis.lng]}
            radius={2000}
            pathOptions={{ color: '#0d7a6b', fillColor: '#0d7a6b', fillOpacity: 0.1, weight: 2, dashArray: '8, 10' }}
          />
        )}

        {/* Draw Volunteers */}
        {visibleVolunteers.map((volunteer) => (
          <CircleMarker
            key={volunteer.id}
            center={[volunteer.lat, volunteer.lng]}
            radius={6}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#22c55e', fillOpacity: 0.9 }}
          >
            <Popup>
              <strong>{volunteer.name}</strong><br />
              Skills: {volunteer.skills.join(', ')}<br />
              Assets: {volunteer.assets.join(', ')}
            </Popup>
          </CircleMarker>
        ))}

        {/* Draw Crises */}
        {crises.map((crisis) => {
          const isCritical = crisis.severity === 'critical';
          const isHigh = crisis.severity === 'high';
          const color = isCritical ? '#dc2626' : isHigh ? '#d97706' : '#ca8a04';
          const isSelected = selectedCrisis?.id === crisis.id;

          return (
            <CircleMarker
              key={crisis.id}
              center={[crisis.lat, crisis.lng]}
              radius={isSelected ? 14 : 10}
              pathOptions={{ 
                color: isSelected ? '#ffffff' : color, 
                weight: isSelected ? 3 : 2, 
                fillColor: color, 
                fillOpacity: 0.9 
              }}
            >
              <Popup>
                <strong>{crisis.type}</strong><br />
                {crisis.location}<br />
                Severity: {crisis.severity.toUpperCase()}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute left-6 top-6 rounded-2xl bg-white/95 px-4 py-3 shadow-card z-[1000]">
        <p className="font-heading text-sm font-semibold text-navy">Live Ops Map</p>
        <p className="text-xs text-slate-500">{mapSummary}</p>
      </div>
    </div>
  );
}
