import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Issue } from '@/hooks/useIssues';

interface IssueMapProps {
  issues: Issue[];
  language: 'en' | 'hi';
  onIssueClick?: (issue: Issue) => void;
}

const statusColors = {
  submitted: '#3b82f6', // blue
  acknowledged: '#eab308', // yellow
  in_progress: '#f97316', // orange
  resolved: '#22c55e', // green
};

const categoryLabels = {
  waste: { en: 'Waste', hi: 'कचरा' },
  roads: { en: 'Roads', hi: 'सड़कें' },
  streetlights: { en: 'Streetlights', hi: 'स्ट्रीटलाइट्स' },
  water: { en: 'Water', hi: 'पानी' },
  other: { en: 'Other', hi: 'अन्य' },
};

const statusLabels = {
  submitted: { en: 'Submitted', hi: 'सबमिट किया गया' },
  acknowledged: { en: 'Acknowledged', hi: 'स्वीकार किया गया' },
  in_progress: { en: 'In Progress', hi: 'प्रगति में' },
  resolved: { en: 'Resolved', hi: 'हल किया गया' },
};

export function IssueMap({ issues, language, onIssueClick }: IssueMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    
    if (!token) {
      setMapError('Mapbox token not configured');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      // Default center (India - can be adjusted based on your city)
      const defaultCenter: [number, number] = [77.2090, 28.6139]; // Delhi
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCenter,
        zoom: 11,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl());

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  // Update markers when issues change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter issues with valid coordinates
    const issuesWithLocation = issues.filter(
      issue => issue.latitude && issue.longitude
    );

    // Add new markers
    issuesWithLocation.forEach(issue => {
      if (!issue.latitude || !issue.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'issue-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${statusColors[issue.status]};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 4px; color: #1a1a1a;">${issue.title}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${issue.description || ''}</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: ${statusColors[issue.status]}20;
              color: ${statusColors[issue.status]};
              font-weight: 500;
            ">
              ${statusLabels[issue.status][language]}
            </span>
            <span style="
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 12px;
              background-color: #e5e7eb;
              color: #374151;
            ">
              ${categoryLabels[issue.category][language]}
            </span>
          </div>
          <p style="font-size: 11px; color: #888; margin-top: 8px;">
            ${new Date(issue.created_at).toLocaleDateString()}
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([issue.longitude, issue.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onIssueClick?.(issue);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (issuesWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      issuesWithLocation.forEach(issue => {
        if (issue.latitude && issue.longitude) {
          bounds.extend([issue.longitude, issue.latitude]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    }
  }, [issues, language, onIssueClick]);

  if (mapError) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">{mapError}</p>
          <p className="text-sm text-muted-foreground">
            {language === 'hi' 
              ? 'कृपया Mapbox टोकन कॉन्फ़िगर करें' 
              : 'Please configure Mapbox token'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium mb-2">
          {language === 'hi' ? 'स्थिति' : 'Status'}
        </p>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">
                {statusLabels[status as keyof typeof statusLabels][language]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Issue count */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">
          {issues.filter(i => i.latitude && i.longitude).length} {language === 'hi' ? 'समस्याएं' : 'issues'}
        </p>
      </div>
    </div>
  );
}
