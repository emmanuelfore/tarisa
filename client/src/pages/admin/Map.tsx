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
import {
  Search, Filter, X, ChevronRight, MapPin, Layers, Calendar, Thermometer,
  Car, Siren, UserPlus, Loader2, ZoomIn, ZoomOut, Maximize2, Navigation,
  Copy, ExternalLink, TrendingUp, PieChart, BarChart3, MessageSquare, ThumbsUp,
  Clock, AlertCircle, TrendingDown, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import type { Issue, IssueCategory } from "@shared/schema";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  calculateAverageResolutionTime,
  getResolutionRate,
  getMonthlyComparison,
  getTopCategories,
  findSimilarNearbyIssues,
  getIssueTimeline,
} from '@/lib/analytics';
import { getSLAStatus, getSuggestedDepartment } from '@/lib/assignment-rules';
import { HeatmapLayer } from '@/components/map/HeatmapLayer';

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
const createCustomIcon = (color: string, size: 'small' | 'normal' = 'normal') => {
  const iconSize = size === 'small' ? 16 : 24;
  const borderWidth = size === 'small' ? 2 : 3;
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="
      background-color: ${color};
      width: ${iconSize}px;
      height: ${iconSize}px;
      border-radius: 50%;
      border: ${borderWidth}px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};

const STATUS_COLORS = {
  critical: "#ef4444",
  resolved: "#22c55e",
  in_progress: "#f97316",
  submitted: "#3b82f6",
};

const ICONS = {
  critical: createCustomIcon(STATUS_COLORS.critical),
  resolved: createCustomIcon(STATUS_COLORS.resolved),
  in_progress: createCustomIcon(STATUS_COLORS.in_progress),
  submitted: createCustomIcon(STATUS_COLORS.submitted),
};

// Harare Coordinates
const HARARE_CENTER = [-17.8216, 31.0492] as [number, number];

// Component to handle map center and zoom updates
function MapController({ center, zoom, shouldFit, bounds }: {
  center?: [number, number];
  zoom?: number;
  shouldFit?: boolean;
  bounds?: L.LatLngBounds;
}) {
  const map = useMap();

  useEffect(() => {
    if (shouldFit && bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, shouldFit, bounds, map]);

  return null;
}

export default function AdminMap() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(HARARE_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [shouldFitAll, setShouldFitAll] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showDensityHeat, setShowDensityHeat] = useState(false);
  const [timeRange, setTimeRange] = useState("7days");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const { toast } = useToast();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: issues = [], isLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  const { data: categoryData = [] } = useQuery<IssueCategory[]>({
    queryKey: ["/api/categories"],
  });

  const getCoordinates = (coordString: string | null): [number, number] | null => {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  const filters = useMemo(() => {
    return ['All', ...categoryData.map(c => c.name)];
  }, [categoryData]);

  const filteredIssues = useMemo(() => {
    if (!issues) return [];

    let result = issues;

    // Filter by Category
    if (activeFilter !== 'All') {
      result = result.filter(issue => issue.category === activeFilter);
    }

    // Filter by Search Query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(issue => {
        const title = issue.title?.toLowerCase() || '';
        const location = issue.location?.toLowerCase() || '';
        const trackingId = issue.trackingId?.toLowerCase() || '';
        return title.includes(query) || location.includes(query) || trackingId.includes(query);
      });
    }

    // Filter by Time Range
    if (timeRange !== 'custom') {
      const now = new Date();
      let cutoffDate: Date;

      switch (timeRange) {
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0); // Show all
      }

      result = result.filter(issue => new Date(issue.createdAt) >= cutoffDate);
    } else if (customDateFrom || customDateTo) {
      // Custom date range filtering
      result = result.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        const fromDate = customDateFrom ? new Date(customDateFrom) : new Date(0);
        const toDate = customDateTo ? new Date(customDateTo + 'T23:59:59') : new Date();
        return issueDate >= fromDate && issueDate <= toDate;
      });
    }

    return result;
  }, [issues, activeFilter, debouncedSearch, timeRange, customDateFrom, customDateTo]);

  // Handle filtering state to show loading indicator
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [activeFilter, debouncedSearch, timeRange, customDateFrom, customDateTo]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredIssues.length;
    const categoryNames = categoryData.map(c => c.name);
    const byCategory = categoryNames.map(cat => ({
      name: cat,
      value: filteredIssues.filter(i => i.category === cat).length,
    })).filter(item => item.value > 0);

    const byStatus = [
      { name: 'Submitted', value: filteredIssues.filter(i => i.status === 'submitted').length, color: STATUS_COLORS.submitted },
      { name: 'In Progress', value: filteredIssues.filter(i => i.status === 'in_progress').length, color: STATUS_COLORS.in_progress },
      { name: 'Resolved', value: filteredIssues.filter(i => i.status === 'resolved').length, color: STATUS_COLORS.resolved },
    ].filter(item => item.value > 0);

    // Resolution metrics
    const avgResolutionTime = calculateAverageResolutionTime(filteredIssues);
    const resolutionRate = getResolutionRate(filteredIssues);
    const monthlyComparison = getMonthlyComparison(filteredIssues);
    const topCategories = getTopCategories(filteredIssues, 3);

    return {
      total,
      byCategory,
      byStatus,
      avgResolutionTime,
      resolutionRate,
      monthlyComparison,
      topCategories,
    };
  }, [filteredIssues]);

  // Get bounds for fit all markers
  const markerBounds = useMemo(() => {
    const coords = filteredIssues
      .map(issue => getCoordinates(issue.coordinates))
      .filter((coord): coord is [number, number] => coord !== null);

    if (coords.length === 0) return null;
    return L.latLngBounds(coords);
  }, [filteredIssues]);

  // Prepare heat map points
  const heatPoints = useMemo(() => {
    return filteredIssues
      .map(issue => {
        const coords = getCoordinates(issue.coordinates);
        if (!coords) return null;
        const intensity = issue.severity ? issue.severity / 10 : 0.5;
        return [coords[0], coords[1], intensity] as [number, number, number];
      })
      .filter((point): point is [number, number, number] => point !== null);
  }, [filteredIssues]);

  const handleIssueClick = (issue: Issue) => {
    const coords = getCoordinates(issue.coordinates);
    if (coords) {
      setSelectedIssue(issue);
      setMapCenter(coords);
      setMapZoom(17);
      setShouldFitAll(false);
    }
  };

  const handleFitAll = () => {
    if (markerBounds) {
      setShouldFitAll(true);
      setSelectedIssue(null);
    }
  };

  const handleResetView = () => {
    setMapCenter(HARARE_CENTER);
    setMapZoom(14);
    setShouldFitAll(false);
    setSelectedIssue(null);
  };

  const copyCoordinates = (coords: string | null) => {
    if (coords) {
      navigator.clipboard.writeText(coords);
      toast({
        title: "Copied!",
        description: "Coordinates copied to clipboard",
      });
    }
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
                    className="pl-10 pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {(searchQuery && searchQuery !== debouncedSearch) && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" size={16} />
                  )}
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

                {/* Custom Date Range Inputs */}
                {timeRange === 'custom' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      className="w-[140px]"
                      placeholder="From"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      className="w-[140px]"
                      placeholder="To"
                    />
                  </div>
                )}

                {/* Map View Toggles */}
                <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cluster-mode"
                      checked={showClusters}
                      onCheckedChange={setShowClusters}
                    />
                    <Label htmlFor="cluster-mode" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700">
                      <Layers size={16} className={showClusters ? "text-blue-500" : "text-gray-400"} />
                      Cluster
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="heatmap-mode"
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                    />
                    <Label htmlFor="heatmap-mode" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700">
                      <Thermometer size={16} className={showHeatmap ? "text-orange-500" : "text-gray-400"} />
                      Heat
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="density-heat-mode"
                      checked={showDensityHeat}
                      onCheckedChange={setShowDensityHeat}
                    />
                    <Label htmlFor="density-heat-mode" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700">
                      <Target size={16} className={showDensityHeat ? "text-red-500" : "text-gray-400"} />
                      Density
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stats-mode"
                      checked={showStats}
                      onCheckedChange={setShowStats}
                    />
                    <Label htmlFor="stats-mode" className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-700">
                      <PieChart size={16} className={showStats ? "text-purple-500" : "text-gray-400"} />
                      Stats
                    </Label>
                  </div>
                </div>
              </div>

              {/* Filtering Indicator */}
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Filtering...</span>
                </div>
              )}
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
                  <span className="ml-2 text-xs opacity-75">
                    {filter === 'All' ? filteredIssues.length : filteredIssues.filter(i => i.category === filter).length}
                  </span>
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

              <ZoomControl position="topright" />

              <MapController
                center={!shouldFitAll ? mapCenter : undefined}
                zoom={!shouldFitAll ? mapZoom : undefined}
                shouldFit={shouldFitAll}
                bounds={shouldFitAll ? markerBounds || undefined : undefined}
              />

              {showDensityHeat && <HeatmapLayer points={heatPoints} />}

              {/* Render Heatmap Circles, Clustered Markers, or Standard Markers */}
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
              ) : showClusters ? (
                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={60}
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                  zoomToBoundsOnClick={true}
                  iconCreateFunction={(cluster) => {
                    const count = cluster.getChildCount();
                    let size = 'w-10 h-10';
                    let color = 'bg-blue-600';

                    if (count > 50) {
                      size = 'w-12 h-12';
                      color = 'bg-red-600';
                    } else if (count > 10) {
                      size = 'w-11 h-11';
                      color = 'bg-orange-500';
                    }

                    return L.divIcon({
                      html: `<div class="flex items-center justify-center ${size} ${color} text-white rounded-full border-4 border-white shadow-lg font-bold text-sm">
                        <span>${count}</span>
                      </div>`,
                      className: 'custom-cluster-icon',
                      iconSize: L.point(40, 40, true),
                    });
                  }}
                >
                  {filteredIssues.map((issue) => {
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
                  })}
                </MarkerClusterGroup>
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

          {/* Advanced Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-[400] bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex flex-col gap-1 p-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleResetView}
                title="Reset to Harare Center"
              >
                <MapPin size={18} className="text-gray-600" />
              </Button>
              <div className="h-px bg-gray-200" />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleFitAll}
                title="Fit All Markers"
              >
                <Maximize2 size={18} className="text-gray-600" />
              </Button>
              <div className="h-px bg-gray-200" />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                title="Show Statistics"
                onClick={() => setShowStats(!showStats)}
              >
                <BarChart3 size={18} className={showStats ? "text-purple-500" : "text-gray-600"} />
              </Button>
            </div>
          </div>

          {/* Statistics Overlay Panel */}
          {showStats && (
            <div className="absolute top-4 left-20 w-96 z-[400] animate-in slide-in-from-left-10 fade-in duration-300">
              <Card className="shadow-2xl border-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-heading flex items-center gap-2">
                      <TrendingUp size={20} className="text-purple-500" />
                      Issue Analytics
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowStats(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Issues: {statistics.total}</h4>
                  </div>

                  {/* Resolution Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1">
                        <Clock size={12} />
                        Avg Resolution
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {statistics.avgResolutionTime !== null
                          ? `${statistics.avgResolutionTime}d`
                          : 'N/A'}
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium mb-1">
                        <Target size={12} />
                        Resolution Rate
                      </div>
                      <div className="text-lg font-bold text-green-700">
                        {statistics.resolutionRate}%
                      </div>
                    </div>
                  </div>

                  {/* Monthly Comparison */}
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Resolved This Month</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{statistics.monthlyComparison.thisMonth}</div>
                        <div className="text-xs text-gray-500">vs {statistics.monthlyComparison.lastMonth} last month</div>
                      </div>
                      {statistics.monthlyComparison.percentageChange !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${statistics.monthlyComparison.percentageChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {statistics.monthlyComparison.percentageChange > 0 ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          {Math.abs(statistics.monthlyComparison.percentageChange)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Categories */}
                  {statistics.topCategories.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Reported Categories</h4>
                      <div className="space-y-2">
                        {statistics.topCategories.map((cat, idx) => (
                          <div key={cat.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                {idx + 1}
                              </div>
                              <span className="text-sm text-gray-700">{cat.category}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{cat.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Breakdown</h4>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={statistics.byStatus}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6">
                          {statistics.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Distribution */}
                  {statistics.byCategory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Category Distribution</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <RechartsChart>
                          <Pie
                            data={statistics.byCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statistics.byCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Issue Detail Card (Floating Panel) */}
          {selectedIssue && (
            <div className="absolute top-4 right-4 w-96 z-[400] animate-in slide-in-from-right-10 fade-in duration-300 max-h-[calc(100vh-4rem)] flex flex-col">
              <Card className="shadow-2xl border-none overflow-hidden flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-lg font-heading pr-6">{selectedIssue.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIssue(null);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </CardHeader>
                <CardContent className="overflow-y-auto flex-1 custom-scrollbar pb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{selectedIssue.category}</Badge>
                      <StatusBadge status={selectedIssue.status as any} />
                      {selectedIssue.severity && (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                          Severity: {selectedIssue.severity}
                        </Badge>
                      )}
                    </div>

                    {/* SLA and Assignment Info */}
                    {(() => {
                      const dept = getSuggestedDepartment(selectedIssue.category);
                      const sla = getSLAStatus(selectedIssue.createdAt, selectedIssue.category, selectedIssue.status);
                      return (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-medium uppercase tracking-wider">Assigned Department</span>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                              {dept || 'General Services'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium uppercase tracking-wider">SLA Status</span>
                              <span className={sla.breached ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                {sla.breached ? 'OVERDUE' : `${Math.round(sla.hoursRemaining)}h remaining`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${sla.breached ? 'bg-red-500' : sla.percentageUsed > 80 ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${Math.min(100, sla.percentageUsed)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-gray-400 text-right">
                              {sla.percentageUsed}% of SLA target used
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Description */}
                    {selectedIssue.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{selectedIssue.description}</p>
                      </div>
                    )}

                    {/* Photos Section */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-100 rounded aspect-square flex flex-col items-center justify-center border border-gray-200 overflow-hidden relative group">
                        {selectedIssue.photos && (selectedIssue.photos as string[]).length > 0 ? (
                          <>
                            <img
                              src={(selectedIssue.photos as string[])[0]}
                              alt="Issue reported"
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold uppercase tracking-wider backdrop-blur-sm">
                              Before
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Before</span>
                            <Badge variant="ghost" className="text-[8px] bg-gray-200/50">No Photo</Badge>
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 relative">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">After</span>
                        <Badge variant="secondary" className="text-[10px] mt-1">Pending Resolution</Badge>
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-200/50 text-gray-500 text-[10px] py-1 text-center font-bold uppercase tracking-wider">
                          After
                        </div>
                      </div>
                    </div>

                    {/* Location & Coordinates */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start text-gray-600 gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{selectedIssue.location}</span>
                      </div>
                      {selectedIssue.coordinates && (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                            {selectedIssue.coordinates}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyCoordinates(selectedIssue.coordinates)}
                            title="Copy Coordinates"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              const coords = getCoordinates(selectedIssue.coordinates);
                              if (coords) {
                                window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank');
                              }
                            }}
                            title="Open in Google Maps"
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Engagement Stats & Follow */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1" title="Upvotes">
                          <ThumbsUp size={14} className="text-blue-500" />
                          <span className="font-medium">{(selectedIssue as any).upvotes ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Comments">
                          <MessageSquare size={14} className="text-gray-400" />
                          <span className="font-medium">{(selectedIssue as any).comments ?? 0}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                        <Loader2 size={12} />
                        Follow Issue
                      </Button>
                    </div>

                    {/* Nearby Similar Issues */}
                    {(() => {
                      const nearbyIssues = findSimilarNearbyIssues(selectedIssue, issues, 100);
                      if (nearbyIssues.length > 0) {
                        return (
                          <div className="border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle size={14} className="text-orange-500" />
                              <h4 className="text-sm font-semibold text-gray-700">Nearby Similar Issues</h4>
                              <Badge variant="secondary" className="text-xs">{nearbyIssues.length}</Badge>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Found {nearbyIssues.length} similar {nearbyIssues.length === 1 ? 'issue' : 'issues'} within 100m
                            </div>
                            <div className="space-y-1 max-h-24 overflow-y-auto">
                              {nearbyIssues.slice(0, 3).map(nearby => (
                                <div
                                  key={nearby.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 cursor-pointer transition-colors"
                                  onClick={() => handleIssueClick(nearby)}
                                >
                                  <span className="truncate flex-1">{nearby.title}</span>
                                  <StatusBadge status={nearby.status as any} />
                                </div>
                              ))}
                            </div>
                            {nearbyIssues.length > 3 && (
                              <div className="text-xs text-gray-400 mt-1">
                                +{nearbyIssues.length - 3} more
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                  </div>
                </CardContent>

                {/* Sticky Action Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/reports/${selectedIssue.id}`} className="flex-1">
                        <Button className="w-full h-10 shadow-sm">
                          View Details
                          <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </Link>
                      <Button variant="secondary" className="flex-1 h-10 gap-2 shadow-sm border border-gray-200">
                        <Siren size={16} />
                        Work Order
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full h-9 gap-2 text-xs text-gray-600 border-gray-200 bg-white">
                      <Navigation size={14} />
                      Export PDF Report
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
