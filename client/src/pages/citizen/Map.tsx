import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Navigation, X, ChevronRight, Droplets, Lightbulb, Truck, Cone, AlertTriangle } from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "wouter";

// Mock data for map issues
const MOCK_MAP_ISSUES = [
  { id: "1", type: "Roads", status: "critical", lat: 33, lng: 25, title: "Deep Pothole", location: "Samora Machel Ave" },
  { id: "2", type: "Water", status: "submitted", lat: 50, lng: 60, title: "Burst Pipe", location: "Borrowdale Rd" },
  { id: "3", type: "Lights", status: "resolved", lat: 65, lng: 30, title: "Broken Street Light", location: "4th Street" },
  { id: "4", type: "Waste", status: "verified", lat: 20, lng: 70, title: "Illegal Dumping", location: "Harare Gardens" },
  { id: "5", type: "Sewer", status: "in_progress", lat: 45, lng: 45, title: "Blocked Drain", location: "Jason Moyo Ave" },
  { id: "6", type: "Roads", status: "submitted", lat: 75, lng: 80, title: "Traffic Signal Out", location: "Second St" },
];

const CATEGORY_ICONS: Record<string, any> = {
  Roads: Cone,
  Water: Droplets,
  Lights: Lightbulb,
  Waste: Truck,
  Sewer: AlertTriangle, // Using generic alert for sewer
};

const CATEGORY_COLORS: Record<string, string> = {
  Roads: "bg-orange-500",
  Water: "bg-blue-500",
  Lights: "bg-yellow-500",
  Waste: "bg-brown-500", // Tailwind doesn't have brown by default, will fallback or use custom
  Sewer: "bg-purple-500",
};

export default function CitizenMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<typeof MOCK_MAP_ISSUES[0] | null>(null);
  const { toast } = useToast();

  const filters = ['All', 'Roads', 'Water', 'Sewer', 'Lights', 'Waste'];

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'All') return MOCK_MAP_ISSUES;
    return MOCK_MAP_ISSUES.filter(issue => issue.type === activeFilter);
  }, [activeFilter]);

  const handleLocationClick = () => {
    toast({
      title: "Location Updated",
      description: "Map centered on your current location: Avondale, Harare",
    });
  };

  return (
    <MobileLayout>
      <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100">
        {/* Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${mapBg})` }}
          onClick={() => setSelectedIssue(null)}
        />
        
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
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
                className={`px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all shadow-sm ${
                  activeFilter === filter 
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

        {/* Dynamic Map Markers */}
        {filteredIssues.map((issue) => {
          const Icon = CATEGORY_ICONS[issue.type] || AlertTriangle;
          const isSelected = selectedIssue?.id === issue.id;
          
          return (
            <div 
              key={issue.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'}`}
              style={{ top: `${issue.lat}%`, left: `${issue.lng}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIssue(issue);
              }}
            >
              <div className={`relative flex flex-col items-center`}>
                {/* Marker Pin */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                  ${issue.status === 'resolved' ? 'bg-green-500' : 
                    issue.status === 'critical' ? 'bg-red-500' : 
                    issue.status === 'in_progress' ? 'bg-orange-500' : 'bg-blue-500'}
                `}>
                  <Icon size={18} className="text-white" />
                </div>
                
                {/* Pulse Effect for Critical/Active Issues */}
                {(issue.status === 'critical' || issue.status === 'in_progress') && (
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-75 -z-10 ${
                     issue.status === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                )}
                
                {/* Triangle Point */}
                <div className={`
                  w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-1
                  ${issue.status === 'resolved' ? 'border-t-green-500' : 
                    issue.status === 'critical' ? 'border-t-red-500' : 
                    issue.status === 'in_progress' ? 'border-t-orange-500' : 'border-t-blue-500'}
                `} />
              </div>
            </div>
          );
        })}

        {/* Selected Issue Bottom Sheet */}
        {selectedIssue && (
          <div className="absolute bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
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
                        const Icon = CATEGORY_ICONS[selectedIssue.type] || AlertTriangle;
                        return <Icon size={24} />;
                      })()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-gray-200">
                          {selectedIssue.type}
                        </Badge>
                        <StatusBadge status={selectedIssue.status as any} className="scale-75 origin-left" />
                      </div>
                      
                      <h3 className="font-heading font-semibold text-gray-900 truncate">
                        {selectedIssue.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{selectedIssue.location}</p>
                      
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
          <div className="absolute bottom-6 right-6 z-10">
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
