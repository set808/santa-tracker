import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSantaStore } from '../../store/santaStore';
import LoadingSpinner from '../UI/LoadingSpinner';

// Fix for default marker icon issue in Leaflet with Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function SantaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const trailPositions = useRef<L.LatLngTuple[]>([]);
  const MAX_TRAIL_POINTS = 50;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { sleighMetrics, deliveryRoute } = useSantaStore();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    try {
      // Initialize map centered on North Pole
      const map = L.map(mapRef.current, {
        center: [90, 0],
        zoom: 3,
        zoomControl: true,
        attributionControl: true,
      });

      // Add CartoDB Dark Matter tile layer (dark Christmas theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      leafletMapRef.current = map;
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading map:', err);
      setError('Failed to load map. Please check your internet connection.');
      setIsLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Santa's position
  useEffect(() => {
    if (!leafletMapRef.current || !sleighMetrics) return;

    const position: L.LatLngTuple = [
      sleighMetrics.position.lat,
      sleighMetrics.position.lng,
    ];

    // Create or update marker
    if (!markerRef.current) {
      // Create custom sleigh icon
      const sleighIcon = L.divIcon({
        html: '<div style="font-size: 32px; text-align: center; line-height: 1;">🛷</div>',
        className: 'santa-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      markerRef.current = L.marker(position, { icon: sleighIcon }).addTo(leafletMapRef.current);

      // Create popup with Santa's info
      const popupContent = `
        <div style="color: #0A1E1F; font-family: sans-serif; padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #C41E3A; font-size: 16px; font-weight: bold;">
            🎅 Santa's Sleigh
          </h3>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Speed:</strong> Mach ${sleighMetrics.speed.toFixed(2)}
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Altitude:</strong> ${(sleighMetrics?.altitude ?? 0).toLocaleString()} ft
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Next Stop:</strong> ${sleighMetrics.nextStop}
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Fuel:</strong> ${sleighMetrics.magicFuelLevel?.toFixed(1) ?? '0.0'}%
          </p>
        </div>
      `;

      markerRef.current.bindPopup(popupContent);
    } else {
      // Update existing marker position
      markerRef.current.setLatLng(position);

      // Update popup content
      const popupContent = `
        <div style="color: #0A1E1F; font-family: sans-serif; padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #C41E3A; font-size: 16px; font-weight: bold;">
            🎅 Santa's Sleigh
          </h3>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Speed:</strong> Mach ${sleighMetrics.speed.toFixed(2)}
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Altitude:</strong> ${(sleighMetrics?.altitude ?? 0).toLocaleString()} ft
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Next Stop:</strong> ${sleighMetrics.nextStop}
          </p>
          <p style="margin: 4px 0; font-size: 13px;">
            <strong>Fuel:</strong> ${sleighMetrics.magicFuelLevel?.toFixed(1) ?? '0.0'}%
          </p>
        </div>
      `;

      markerRef.current.setPopupContent(popupContent);
    }

    // Smoothly pan to new position
    leafletMapRef.current.panTo(position, { animate: true, duration: 1.0 });
  }, [sleighMetrics]);

  // Update flight trail
  useEffect(() => {
    if (!leafletMapRef.current || !sleighMetrics) return;

    const position: L.LatLngTuple = [
      sleighMetrics.position.lat,
      sleighMetrics.position.lng,
    ];

    // Add new position to trail
    trailPositions.current.push(position);

    // Keep only last MAX_TRAIL_POINTS
    if (trailPositions.current.length > MAX_TRAIL_POINTS) {
      trailPositions.current.shift();
    }

    // Create or update trail
    if (!trailRef.current && trailPositions.current.length > 1) {
      trailRef.current = L.polyline(trailPositions.current, {
        color: '#1CE783', // New Relic green
        weight: 3,
        opacity: 0.6,
        smoothFactor: 2,
        className: 'santa-trail'
      }).addTo(leafletMapRef.current);
    } else if (trailRef.current) {
      trailRef.current.setLatLngs(trailPositions.current);
    }
  }, [sleighMetrics]);

  // Draw route polyline
  useEffect(() => {
    if (!leafletMapRef.current || !deliveryRoute.length) return;

    const path: L.LatLngTuple[] = deliveryRoute
      .filter((stop) => stop.delivered)
      .map((stop) => [stop.location.lat, stop.location.lng]);

    if (path.length === 0) return;

    if (!polylineRef.current) {
      // Create new polyline
      polylineRef.current = L.polyline(path, {
        color: '#FFD700',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(leafletMapRef.current);
    } else {
      // Update existing polyline
      polylineRef.current.setLatLngs(path);
    }
  }, [deliveryRoute]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-christmas-darkGreen to-newrelic-dark">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4">Loading Santa's Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-christmas-darkGreen to-newrelic-dark">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold mb-2">Map Unavailable</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="text-sm text-gray-400 bg-white/5 rounded p-3">
            <p className="font-semibold mb-2">Troubleshooting tips:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Check internet connection</li>
              <li>• Verify CartoDB tiles are accessible</li>
              <li>• Open browser console for details</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <style>{`
        .leaflet-pane {
          z-index: 400;
        }
        .leaflet-tile-pane {
          z-index: 200;
        }
        .leaflet-overlay-pane {
          z-index: 400;
        }
        .leaflet-shadow-pane {
          z-index: 500;
        }
        .leaflet-marker-pane {
          z-index: 600;
        }
        .leaflet-tooltip-pane {
          z-index: 650;
        }
        .leaflet-popup-pane {
          z-index: 700;
        }

        .santa-trail {
          filter: drop-shadow(0 0 8px #1CE783) drop-shadow(0 0 4px #00AC69);
          animation: trail-glow 2s ease-in-out infinite;
        }

        @keyframes trail-glow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
        }

        .santa-marker {
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
          animation: sleigh-pulse 1.5s ease-in-out infinite;
        }

        @keyframes sleigh-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl" />

      {/* Legend */}
      {sleighMetrics && (
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-md border border-christmas-gold rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 text-sm text-white mb-2">
            <span className="text-xl">🛷</span>
            <span className="font-semibold">Santa's Current Position</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-newrelic-green shadow-lg shadow-newrelic-green/50"></div>
              <span>Flight Trail</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-christmas-gold"></div>
              <span>Completed Route</span>
            </div>
            <div>
              <span className="text-newrelic-green">●</span> Next: {sleighMetrics.nextStop}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
