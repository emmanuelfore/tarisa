import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Filter, X, ChevronRight, MapPin, Layers, Calendar, Thermometer, Car, Siren, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import type { Issue } from "@shared/schema";

// Fix for default leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const ICONS = {
  critical: createCustomIcon("#ef4444"), // red-500
  resolved: createCustomIcon("#22c55e"), // green-500
  in_progress: createCustomIcon("#f97316"), // orange-500
  submitted: createCustomIcon("#3b82f6"), // blue-500
};

// Harare Coordinates
const HARARE_CENTER = [-17.8216, 31.0492] as [number, number];

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function AdminMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HARARE_CENTER);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [timeRange, setTimeRange] = useState("7days");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: issues = [], isLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  const getCoordinates = (coordString: string | null): [number, number] | null => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  const filters = ['All', 'Roads', 'Water', 'Sewer', 'Lights', 'Waste'];

  const filteredIssues = useMemo(() => {
    if (!issues) return [];

    let result = issues;

    // Filter by Category
    if (activeFilter !== 'All') {
      result = result.filter(issue => issue.category === activeFilter);
    }

    // Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.trackingId.toLowerCase().includes(query)
      );
    }

    // Filter by Time Range (Simplified for now)
    // In a real app, check createdAt against Date.now()

    return result;
  }, [issues, activeFilter, timeRange, searchQuery]);

  const handleIssueClick = (issue: Issue) => {
    const coords = getCoordinates(issue.coordinates);
    if (coords) {
      setSelectedIssue(issue);
      setMapCenter(coords);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
        {/* Map Controls Bar */}
        <Card className="flex-none">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search & Basic Filter */}
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search location, title or ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Time Range Selector */}
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[160px]">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {/* Heatmap Toggle */}
                <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                  <Switch
                    id="heatmap-mode"
                    checked={showHeatmap}
                    onCheckedChange={setShowHeatmap}
                  />
                  <Label htmlFor="heatmap-mode" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <Thermometer size={16} className={showHeatmap ? "text-orange-500" : "text-gray-400"} />
                    Heatmap
                  </Label>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-0 pt-2 border-t border-gray-100">
              {filters.map(filter => (
                <Badge
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  className={`px-4 py-1.5 cursor-pointer transition-all ${activeFilter === filter
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-gray-100 text-gray-600 border-gray-300'
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
          </CardContent>
        </Card>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center bg-gray-50">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="ml-2 text-gray-500">Loading map data...</p>
            </div>
          ) : (
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

              {/* Render Heatmap Circles or Standard Markers */}
              {showHeatmap ? (
                filteredIssues.map((issue) => {
                  const coords = getCoordinates(issue.coordinates);
                  if (!coords) return null;
                  return (
                    <CircleMarker
                      key={`heat-${issue.id}`}
                      center={coords}
                      radius={25}
                      pathOptions={{
                        fillColor: (issue.severity || 0) > 80 ? 'red' : (issue.severity || 0) > 50 ? 'orange' : 'yellow',
                        fillOpacity: 0.5,
                        stroke: false
                      }}
                    />
                  );
                })
              ) : (
                filteredIssues.map((issue) => {
                  const coords = getCoordinates(issue.coordinates);
                  if (!coords) return null;
                  return (
                    <Marker
                      key={issue.id}
                      position={coords}
                      icon={ICONS[issue.status as keyof typeof ICONS] || ICONS.submitted}
                      eventHandlers={{
                        click: () => handleIssueClick(issue),
                      }}
                    />
                  );
                })
              )}
            </MapContainer>
          )}

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-[400] bg-white rounded-lg shadow-md border border-gray-200 p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMapCenter(HARARE_CENTER)}>
              <MapPin size={18} className="text-gray-600" />
            </Button>
            <div className="h-px bg-gray-200 my-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Layers size={18} className="text-gray-600" />
            </Button>
          </div>

          {/* Issue Detail Card (Floating Panel) */}
          {selectedIssue && (
            <div className="absolute top-4 right-4 w-80 z-[400] animate-in slide-in-from-right-10 fade-in duration-300">
              <Card className="shadow-2xl border-none">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-lg font-heading">{selectedIssue.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-2 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIssue(null);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedIssue.category}</Badge>
                      <StatusBadge status={selectedIssue.status as any} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 gap-2">
                        <MapPin size={14} />
                        {selectedIssue.location}
                      </div>
                      <div className="flex items-center text-gray-600 gap-2">
                        <div className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
                        Reported by Customer #{selectedIssue.citizenId}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(selectedIssue.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Link href={`/admin/reports/${selectedIssue.id}`} className="flex-1">
                        <Button className="w-full">
                          View Full Details
                          <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                      <Link href={`/admin/reports/${selectedIssue.id}?action=assign`}>
                        <Button variant="outline" size="icon" title="Quick Assign">
                          <UserPlus size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
