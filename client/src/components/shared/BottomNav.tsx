import { Link, useLocation } from "wouter";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native-web";
import { Home, Map, PlusCircle, CreditCard, User } from "lucide-react";
import { theme } from "@/theme";

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <View style={styles.container}>
      <Link href="/citizen/home">
        <View style={styles.tabItem}>
          <Home 
            size={24} 
            color={isActive("/citizen/home") || isActive("/") ? theme.colors.primary : theme.colors.gray400} 
            strokeWidth={isActive("/citizen/home") || isActive("/") ? 2.5 : 2} 
          />
          <Text style={[styles.tabLabel, (isActive("/citizen/home") || isActive("/")) && styles.activeTabLabel]}>
            Home
          </Text>
        </View>
      </Link>
      
      <Link href="/citizen/map">
        <View style={styles.tabItem}>
          <Map 
            size={24} 
            color={isActive("/citizen/map") ? theme.colors.primary : theme.colors.gray400} 
            strokeWidth={isActive("/citizen/map") ? 2.5 : 2} 
          />
          <Text style={[styles.tabLabel, isActive("/citizen/map") && styles.activeTabLabel]}>
            Map
          </Text>
        </View>
      </Link>

      <Link href="/citizen/report">
        <View style={styles.fabContainer}>
          <View style={styles.fab}>
            <PlusCircle size={28} color="white" />
          </View>
          <Text style={styles.fabLabel}>Report</Text>
        </View>
      </Link>

      <Link href="/citizen/credits">
        <View style={styles.tabItem}>
          <CreditCard 
            size={24} 
            color={isActive("/citizen/credits") ? theme.colors.primary : theme.colors.gray400} 
            strokeWidth={isActive("/citizen/credits") ? 2.5 : 2} 
          />
          <Text style={[styles.tabLabel, isActive("/citizen/credits") && styles.activeTabLabel]}>
            Credits
          </Text>
        </View>
      </Link>

      <Link href="/citizen/profile">
        <View style={styles.tabItem}>
          <User 
            size={24} 
            color={isActive("/citizen/profile") ? theme.colors.primary : theme.colors.gray400} 
            strokeWidth={isActive("/citizen/profile") ? 2.5 : 2} 
          />
          <Text style={[styles.tabLabel, isActive("/citizen/profile") && styles.activeTabLabel]}>
            Profile
          </Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34, // Safe area
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    backdropFilter: 'blur(10px)', // Web only property
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 48,
    cursor: 'pointer', // Web only
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.gray400,
  },
  activeTabLabel: {
    color: theme.colors.primary,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    cursor: 'pointer', // Web only
  },
  fab: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 4,
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.primary,
  }
});
