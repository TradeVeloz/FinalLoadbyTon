import React, { useMemo } from 'react';
import { Box, Satellite } from 'lucide-react';

interface LatLng {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  currentLocation?: LatLng;
  points: LatLng[];
  containerNumber?: string;
}

const WIDTH = 800;
const HEIGHT = 360;
const PADDING = 46;

interface Projected {
  x: number;
  y: number;
}

interface Geometry {
  routePoints: Projected[];
  origin: Projected;
  destination: Projected;
  truck: Projected;
}

const projectAll = (points: LatLng[], currentLocation?: LatLng): Geometry | null => {
  const all: LatLng[] = [...points];
  if (currentLocation) all.push(currentLocation);
  if (all.length === 0) return null;

  let minLat = Math.min(...all.map((p) => p.lat));
  let maxLat = Math.max(...all.map((p) => p.lat));
  let minLng = Math.min(...all.map((p) => p.lng));
  let maxLng = Math.max(...all.map((p) => p.lng));

  if (maxLat - minLat < 0.0001) {
    minLat -= 0.0005;
    maxLat += 0.0005;
  }
  if (maxLng - minLng < 0.0001) {
    minLng -= 0.0005;
    maxLng += 0.0005;
  }

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  const project = (p: LatLng): Projected => ({
    x: PADDING + ((p.lng - minLng) / lngSpan) * (WIDTH - PADDING * 2),
    y: HEIGHT - PADDING - ((p.lat - minLat) / latSpan) * (HEIGHT - PADDING * 2),
  });

  const routePoints = points.map(project);
  const origin = points.length > 0 ? project(points[0]) : currentLocation ? project(currentLocation) : routePoints[0];
  const destination =
    points.length > 0 ? project(points[points.length - 1]) : currentLocation ? project(currentLocation) : origin;
  const truck = currentLocation ? project(currentLocation) : destination;

  return { routePoints, origin, destination, truck };
};

const GRID_LINES = (() => {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const spacing = 60;
  for (let x = spacing; x < WIDTH; x += spacing) {
    lines.push({ x1: x, y1: 0, x2: x, y2: HEIGHT });
  }
  for (let y = spacing; y < HEIGHT; y += spacing) {
    lines.push({ x1: 0, y1: y, x2: WIDTH, y2: y });
  }
  return lines;
})();

export const TrackingMap: React.FC<TrackingMapProps> = ({ currentLocation, points, containerNumber }) => {
  const geometry = useMemo(() => projectAll(points, currentLocation), [points, currentLocation]);

  if (!geometry) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-navy-900 py-16">
        <Satellite className="h-8 w-8 animate-pulse text-brand-orange" />
        <p className="text-sm font-semibold text-gray-300">Awaiting live position</p>
        <p className="text-xs text-gray-500">GPS feed will appear here once the driver is en route.</p>
      </div>
    );
  }

  const routePolyline = geometry.routePoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative overflow-hidden rounded-xl bg-navy-900 shadow-premium">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full">
        <defs>
          <filter id="truck-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#E8742B" floodOpacity="0.9" />
          </filter>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="#0A1E2B" />

        {GRID_LINES.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#153B54"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        ))}

        {routePolyline && (
          <>
            <polyline
              points={routePolyline}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={8}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeOpacity={0.25}
            />
            <polyline
              points={routePolyline}
              fill="none"
              stroke="#E8742B"
              strokeWidth={3.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        <g>
          <circle cx={geometry.origin.x} cy={geometry.origin.y} r={6} fill="#1A7A6A" stroke="#E2F4F1" strokeWidth={2} />
          <text
            x={geometry.origin.x}
            y={geometry.origin.y + 22}
            textAnchor="middle"
            fill="#2DD4BF"
            fontSize={11}
            fontWeight={600}
          >
            Jebel Ali
          </text>
        </g>

        <g>
          <circle cx={geometry.destination.x} cy={geometry.destination.y} r={6} fill="#E4EFF7" stroke="#153B54" strokeWidth={2} />
          <text
            x={geometry.destination.x}
            y={geometry.destination.y + 22}
            textAnchor="middle"
            fill="#9FB6C7"
            fontSize={11}
            fontWeight={600}
          >
            Destination
          </text>
        </g>

        <g>
          <circle
            cx={geometry.truck.x}
            cy={geometry.truck.y}
            r={14}
            fill="none"
            stroke="#E8742B"
            strokeWidth={2}
            strokeOpacity={0.4}
          />
          <circle
            cx={geometry.truck.x}
            cy={geometry.truck.y}
            r={8}
            fill="#E8742B"
            stroke="#071621"
            strokeWidth={2}
            filter="url(#truck-glow)"
          />
          <path
            d={`M ${geometry.truck.x} ${geometry.truck.y - 3} L ${geometry.truck.x - 3} ${geometry.truck.y + 2.5} L ${geometry.truck.x + 3} ${geometry.truck.y + 2.5} Z`}
            fill="#FFFFFF"
          />
        </g>
      </svg>

      {containerNumber && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-navy-700 bg-navy-800/90 px-2.5 py-1.5 font-mono text-xs text-emerald-300">
          <Box className="h-3 w-3 text-brand-orange" />
          {containerNumber}
        </div>
      )}
    </div>
  );
};
