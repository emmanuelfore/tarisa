import { useState, useMemo } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, TextInput, Dimensions } from "react-native-web";
import { Search, Filter, Navigation, X, ChevronRight, Droplets, Lightbulb, Truck, AlertTriangle } from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { theme } from "@/theme";

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
  Roads: AlertTriangle,
  Water: Droplets,
  Lights: Lightbulb,
  Waste: Truck,
  Sewer: AlertTriangle,
};

const CATEGORY_COLORS: Record<string, string> = {
  Roads: theme.colors.warning,
  Water: "#3B82F6", // Blue
  Lights: "#EAB308", // Yellow
  Waste: "#A16207", // Brownish
  Sewer: "#9333EA", // Purple
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
      <View style={styles.container}>
        {/* Map Background */}
        <ImageBackground 
          source={{ uri: mapBg }} 
          style={styles.mapBackground}
          resizeMode="cover"
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setSelectedIssue(null)} 
            activeOpacity={1} 
          />
        
          {/* Top Controls Overlay */}
          <View style={styles.topControls}>
            <View style={styles.searchBar}>
              <Search size={20} color={theme.colors.gray400} />
              <TextInput 
                placeholder="Search location..." 
                style={styles.searchInput}
                placeholderTextColor={theme.colors.gray400}
              />
              <TouchableOpacity>
                <Filter size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map(filter => (
                <TouchableOpacity 
                  key={filter}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && styles.activeFilterChip
                  ]}
                  onPress={() => {
                    setActiveFilter(filter);
                    setSelectedIssue(null);
                  }}
                >
                  <Text style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Dynamic Map Markers */}
          {filteredIssues.map((issue) => {
            const Icon = CATEGORY_ICONS[issue.type] || AlertTriangle;
            const isSelected = selectedIssue?.id === issue.id;
            
            return (
              <View 
                key={issue.id}
                style={[
                  styles.markerContainer,
                  { top: `${issue.lat}%`, left: `${issue.lng}%` }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.marker,
                    { backgroundColor: issue.status === 'resolved' ? theme.colors.success : 
                                      issue.status === 'critical' ? theme.colors.danger : 
                                      issue.status === 'in_progress' ? theme.colors.warning : '#3B82F6' },
                    isSelected && styles.selectedMarker
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedIssue(issue);
                  }}
                >
                  <Icon size={18} color="white" />
                </TouchableOpacity>
                
                {/* Triangle Point */}
                <View style={[
                  styles.markerTriangle,
                  { borderTopColor: issue.status === 'resolved' ? theme.colors.success : 
                                    issue.status === 'critical' ? theme.colors.danger : 
                                    issue.status === 'in_progress' ? theme.colors.warning : '#3B82F6' }
                ]} />
              </View>
            );
          })}

          {/* Selected Issue Bottom Sheet */}
          {selectedIssue && (
            <View style={styles.bottomSheet}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedIssue(null)}
              >
                <X size={16} color={theme.colors.gray400} />
              </TouchableOpacity>

              <Link href={`/citizen/issue/${selectedIssue.id}`}>
                <View style={styles.sheetContent}>
                  <View style={[
                    styles.iconBox,
                    { backgroundColor: selectedIssue.status === 'resolved' ? '#DCFCE7' : 
                                       selectedIssue.status === 'critical' ? '#FEE2E2' : '#DBEAFE' }
                  ]}>
                    {(() => {
                      const Icon = CATEGORY_ICONS[selectedIssue.type] || AlertTriangle;
                      return <Icon size={24} color={
                        selectedIssue.status === 'resolved' ? theme.colors.success : 
                        selectedIssue.status === 'critical' ? theme.colors.danger : '#2563EB'
                      } />;
                    })()}
                  </View>
                  
                  <View style={styles.issueInfo}>
                    <View style={styles.issueHeader}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selectedIssue.type}</Text>
                      </View>
                      <Text style={[styles.statusText, { color: theme.colors.gray400 }]}>
                        {selectedIssue.status}
                      </Text>
                    </View>
                    
                    <Text style={styles.issueTitle} numberOfLines={1}>
                      {selectedIssue.title}
                    </Text>
                    <Text style={styles.issueLocation} numberOfLines={1}>
                      {selectedIssue.location}
                    </Text>
                    
                    <View style={styles.viewDetailsRow}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <ChevronRight size={14} color={theme.colors.primary} />
                    </View>
                  </View>
                </View>
              </Link>
            </View>
          )}

          {/* Current Location FAB */}
          {!selectedIssue && (
            <TouchableOpacity 
              style={styles.fab}
              onPress={handleLocationClick}
            >
              <Navigation size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </ImageBackground>
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray100,
  },
  mapBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    ...theme.shadows.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: theme.colors.text,
    outlineStyle: 'none',
    borderWidth: 0,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersContent: {
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    ...theme.shadows.sm,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray800,
  },
  activeFilterText: {
    color: 'white',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -40 }],
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...theme.shadows.md,
    zIndex: 20,
  },
  selectedMarker: {
    transform: [{ scale: 1.2 }],
    zIndex: 30,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    marginTop: -2,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.lg,
    zIndex: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  sheetContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueInfo: {
    flex: 1,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: theme.colors.gray800,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  issueLocation: {
    fontSize: 14,
    color: theme.colors.gray400,
    marginBottom: 8,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    zIndex: 10,
  },
});
