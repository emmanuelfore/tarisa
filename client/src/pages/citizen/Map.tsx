import { useState, useMemo, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Navigation, X, ChevronRight, Droplets, Lightbulb, Truck, Cone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons for mobile
const createCustomIcon = (color: string, iconType: any) => {
  return L.divIcon({
    className: "custom-mobile-icon",
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const ICONS = {
  critical: createCustomIcon("#ef4444", AlertTriangle),
  resolved: createCustomIcon("#22c55e", Droplets),
  in_progress: createCustomIcon("#f97316", Cone),
  submitted: createCustomIcon("#3b82f6", Lightbulb),
};

const HARARE_CENTER = [-17.8216, 31.0492] as [number, number];

interface MapIssue {
  id: number;
  title: string;
  status: string;
  category: string;
  coordinates: string; // "-17.8292,31.0522"
  jurisdictionName?: string;
  wardNumber?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  code: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Water Supply": Droplets,
  "Roads & Stormwater": Cone,
  "Public Lighting": Lightbulb,
  "Refuse Collection": Truck,
  "Sewage & Sanitation": AlertTriangle,
  "Traffic Signals": AlertTriangle,
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function CitizenMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HARARE_CENTER);
  const { toast } = useToast();

  const { data: issues = [] } = useQuery<MapIssue[]>({
    queryKey: ['/api/issues/map'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/issue-categories'],
  });

  const filters = useMemo(() => ['All', ...categories.map(c => c.name)], [categories]);

  const filteredIssues = useMemo(() => {
    let result = issues;
    if (activeFilter !== 'All') {
      result = issues.filter(issue => issue.category === activeFilter);
    }
    return result.map(issue => {
      const [lat, lng] = issue.coordinates.split(',').map(Number);
      return { ...issue, lat, lng };
    });
  }, [issues, activeFilter]);

  const handleLocationClick = () => {
    setMapCenter(HARARE_CENTER);
    toast({
      title: "Location Updated",
      description: "Map centered on your current location: Avondale, Harare",
    });
  };

  return (
    <MobileLayout>
      <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100">

        <MapContainer
          center={HARARE_CENTER}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={mapCenter} />

          {filteredIssues.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.lat, issue.lng]}
              icon={ICONS[issue.status as keyof typeof ICONS] || ICONS.submitted}
              eventHandlers={{
                click: () => {
                  setSelectedIssue(issue);
                  setMapCenter([issue.lat, issue.lng]);
                }
              }}
            />
          ))}
        </MapContainer>

        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
          <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 pointer-events-auto">
            <Search className="text-gray-400 ml-2" size={20} />
            <Input
              placeholder="Search location..."
              className="border-none shadow-none focus-visible:ring-0 bg-transparent h-9"
            />
            <Button size="icon" variant="ghost" className="text-primary">
              <Filter size={20} />
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
            {filters.map(filter => (
              <Badge
                key={filter}
                variant={activeFilter === filter ? "default" : "secondary"}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all shadow-sm ${activeFilter === filter
                  ? 'shadow-md scale-105 ring-2 ring-offset-1 ring-primary/20 bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => {
                  setActiveFilter(filter);
                  setSelectedIssue(null);
                }}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        {/* Selected Issue Bottom Sheet */}
        {selectedIssue && (
          <div className="absolute bottom-6 left-4 right-4 z-[400] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <Card className="shadow-2xl border-none">
              <CardContent className="p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIssue(null);
                  }}
                >
                  <X size={16} />
                </Button>

                <Link href={`/citizen/issue/${selectedIssue.id}`}>
                  <div className="flex items-start gap-4 cursor-pointer">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                      ${selectedIssue.status === 'resolved' ? 'bg-green-100 text-green-600' :
                        selectedIssue.status === 'critical' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'}
                    `}>
                      {(() => {
                        const Icon = CATEGORY_ICONS[selectedIssue.category] || AlertTriangle;
                        return <Icon size={24} />;
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-gray-200">
                          {selectedIssue.category}
                        </Badge>
                        <StatusBadge status={selectedIssue.status as any} className="scale-75 origin-left" />
                      </div>

                      <h3 className="font-heading font-semibold text-gray-900 truncate">
                        {selectedIssue.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {selectedIssue.wardNumber ? `${selectedIssue.wardNumber}, ` : ''}
                        {selectedIssue.jurisdictionName || 'Unknown Location'}
                      </p>

                      <div className="flex items-center text-primary text-xs font-medium mt-2">
                        View Details <ChevronRight size={14} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Location FAB (Hidden when sheet is open to avoid clutter) */}
        {!selectedIssue && (
          <div className="absolute bottom-6 right-6 z-[400]">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-xl bg-white text-primary hover:bg-gray-50 active:scale-95 transition-transform"
              onClick={handleLocationClick}
            >
              <Navigation size={24} className="fill-current" />
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
