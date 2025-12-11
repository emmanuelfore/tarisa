import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, ChevronRight, MapPin, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Mock data with real coordinates
const MOCK_MAP_ISSUES = [
  { id: "1", type: "Roads", status: "critical", lat: -17.8250, lng: 31.0500, title: "Deep Pothole", location: "Samora Machel Ave", reporter: "Tatenda P.", time: "2 hrs ago" },
  { id: "2", type: "Water", status: "submitted", lat: -17.8200, lng: 31.0450, title: "Burst Pipe", location: "Borrowdale Rd", reporter: "Sarah M.", time: "4 hrs ago" },
  { id: "3", type: "Lights", status: "resolved", lat: -17.8150, lng: 31.0550, title: "Broken Street Light", location: "4th Street", reporter: "John D.", time: "1 day ago" },
  { id: "4", type: "Waste", status: "verified", lat: -17.8300, lng: 31.0400, title: "Illegal Dumping", location: "Harare Gardens", reporter: "Grace K.", time: "3 hrs ago" },
  { id: "5", type: "Sewer", status: "in_progress", lat: -17.8280, lng: 31.0600, title: "Blocked Drain", location: "Jason Moyo Ave", reporter: "Mike T.", time: "5 hrs ago" },
  { id: "6", type: "Roads", status: "submitted", lat: -17.8180, lng: 31.0480, title: "Traffic Signal Out", location: "Second St", reporter: "Blessing C.", time: "30 mins ago" },
];

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
  const [selectedIssue, setSelectedIssue] = useState<typeof MOCK_MAP_ISSUES[0] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HARARE_CENTER);
  const { toast } = useToast();

  const filters = ['All', 'Roads', 'Water', 'Sewer', 'Lights', 'Waste'];

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'All') return MOCK_MAP_ISSUES;
    return MOCK_MAP_ISSUES.filter(issue => issue.type === activeFilter);
  }, [activeFilter]);

  const handleIssueClick = (issue: typeof MOCK_MAP_ISSUES[0]) => {
    setSelectedIssue(issue);
    setMapCenter([issue.lat, issue.lng]);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
        {/* Map Controls Bar */}
        <Card className="flex-none">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search location or ID..." 
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Filters
              </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-0">
              {filters.map(filter => (
                <Badge 
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  className={`px-4 py-1.5 cursor-pointer transition-all ${
                    activeFilter === filter 
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
                  click: () => handleIssueClick(issue),
                }}
              />
            ))}
          </MapContainer>

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
                      <Badge variant="outline">{selectedIssue.type}</Badge>
                      <StatusBadge status={selectedIssue.status as any} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 gap-2">
                        <MapPin size={14} />
                        {selectedIssue.location}
                      </div>
                      <div className="flex items-center text-gray-600 gap-2">
                        <div className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
                        Reported by {selectedIssue.reporter}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {selectedIssue.time}
                      </div>
                    </div>

                    <div className="pt-2">
                       <Button className="w-full" onClick={() => toast({ title: "Opening Report", description: `Report #${selectedIssue.id}` })}>
                         View Full Details
                         <ChevronRight size={16} className="ml-2" />
                       </Button>
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
