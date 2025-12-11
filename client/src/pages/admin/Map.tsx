import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X, ChevronRight, Droplets, Lightbulb, Truck, Cone, AlertTriangle, MapPin } from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "wouter";

// Mock data for map issues (Shared/Similar to citizen map for consistency)
const MOCK_MAP_ISSUES = [
  { id: "1", type: "Roads", status: "critical", lat: 33, lng: 25, title: "Deep Pothole", location: "Samora Machel Ave", reporter: "Tatenda P.", time: "2 hrs ago" },
  { id: "2", type: "Water", status: "submitted", lat: 50, lng: 60, title: "Burst Pipe", location: "Borrowdale Rd", reporter: "Sarah M.", time: "4 hrs ago" },
  { id: "3", type: "Lights", status: "resolved", lat: 65, lng: 30, title: "Broken Street Light", location: "4th Street", reporter: "John D.", time: "1 day ago" },
  { id: "4", type: "Waste", status: "verified", lat: 20, lng: 70, title: "Illegal Dumping", location: "Harare Gardens", reporter: "Grace K.", time: "3 hrs ago" },
  { id: "5", type: "Sewer", status: "in_progress", lat: 45, lng: 45, title: "Blocked Drain", location: "Jason Moyo Ave", reporter: "Mike T.", time: "5 hrs ago" },
  { id: "6", type: "Roads", status: "submitted", lat: 75, lng: 80, title: "Traffic Signal Out", location: "Second St", reporter: "Blessing C.", time: "30 mins ago" },
];

const CATEGORY_ICONS: Record<string, any> = {
  Roads: Cone,
  Water: Droplets,
  Lights: Lightbulb,
  Waste: Truck,
  Sewer: AlertTriangle,
};

export default function AdminMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<typeof MOCK_MAP_ISSUES[0] | null>(null);
  const { toast } = useToast();

  const filters = ['All', 'Roads', 'Water', 'Sewer', 'Lights', 'Waste'];

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'All') return MOCK_MAP_ISSUES;
    return MOCK_MAP_ISSUES.filter(issue => issue.type === activeFilter);
  }, [activeFilter]);

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
        <div className="flex-1 relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
           <div 
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${mapBg})` }}
            onClick={() => setSelectedIssue(null)}
          />

          {/* Map Markers */}
          {filteredIssues.map((issue) => {
            const Icon = CATEGORY_ICONS[issue.type] || AlertTriangle;
            const isSelected = selectedIssue?.id === issue.id;
            
            return (
              <div 
                key={issue.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group ${isSelected ? 'z-30 scale-125' : 'z-20 hover:scale-110'}`}
                style={{ top: `${issue.lat}%`, left: `${issue.lng}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIssue(issue);
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-40">
                    {issue.title}
                  </div>

                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                    ${issue.status === 'resolved' ? 'bg-green-500' : 
                      issue.status === 'critical' ? 'bg-red-500' : 
                      issue.status === 'in_progress' ? 'bg-orange-500' : 'bg-blue-500'}
                  `}>
                    <Icon size={18} className="text-white" />
                  </div>
                  
                  {(issue.status === 'critical' || issue.status === 'in_progress') && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 -z-10 ${
                       issue.status === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                  )}
                  
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

          {/* Issue Detail Card (Floating Panel for Desktop) */}
          {selectedIssue && (
            <div className="absolute top-4 right-4 w-80 z-40 animate-in slide-in-from-right-10 fade-in duration-300">
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
