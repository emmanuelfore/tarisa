import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: Array<[number, number, number]>; // [lat, lng, intensity]
    options?: {
        radius?: number;
        blur?: number;
        maxZoom?: number;
        max?: number;
        gradient?: Record<number, string>;
    };
}

/**
 * React component for Leaflet.heat integration
 */
export function HeatmapLayer({ points, options = {} }: HeatmapLayerProps) {
    const map = useMap();

    useEffect(() => {
        if (!map || points.length === 0) return;

        // Default options
        const heatOptions = {
            radius: options.radius || 25,
            blur: options.blur || 15,
            maxZoom: options.maxZoom || 17,
            max: options.max || 1.0,
            gradient: options.gradient || {
                0.0: 'blue',
                0.3: 'cyan',
                0.5: 'lime',
                0.7: 'yellow',
                1.0: 'red',
            },
        };

        // Create heat layer
        const heatLayer = (L as any).heatLayer(points, heatOptions);
        heatLayer.addTo(map);

        // Cleanup on unmount
        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, options]);

    return null;
}
