import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Navigation } from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";
import { useToast } from "@/hooks/use-toast";

export default function CitizenMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { toast } = useToast();

  const filters = ['All', 'Roads', 'Water', 'Sewer', 'Lights', 'Waste'];

  const handleLocationClick = () => {
    toast({
      title: "Location Updated",
      description: "Map centered on your current location: Avondale, Harare",
    });
  };

  const handleMarkerClick = (type: string) => {
    toast({
      title: "Issue Details",
      description: `Viewing ${type} issue. Tap to see full report.`,
    });
  };

  return (
    <MobileLayout>
      <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100">
        {/* Map Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${mapBg})` }}
        />
        
        {/* Search Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
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
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map(filter => (
              <Badge 
                key={filter}
                variant={activeFilter === filter ? "default" : "secondary"}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                  activeFilter === filter ? 'shadow-md scale-105' : 'bg-white shadow-sm hover:bg-gray-50'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        {/* Map Markers (Mocked) */}
        {/* Marker 1 - Resolved */}
        <div 
          className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          onClick={() => handleMarkerClick("Resolved")}
        >
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-success rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow text-[10px] font-bold whitespace-nowrap z-20">
            Resolved Issue
          </div>
        </div>

        {/* Marker 2 - Critical */}
        <div 
          className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          onClick={() => handleMarkerClick("Critical")}
        >
          <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-destructive rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
          </div>
        </div>

        {/* Marker 3 - In Progress */}
        <div 
          className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          onClick={() => handleMarkerClick("In Progress")}
        >
          <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-4 h-4 bg-warning rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
          </div>
        </div>

        {/* Current Location FAB */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-xl bg-white text-primary hover:bg-gray-50 active:scale-95 transition-transform"
            onClick={handleLocationClick}
          >
            <Navigation size={24} className="fill-current" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
