import { ReactNode } from "react";
import { View, StyleSheet, Platform, ViewStyle } from "react-native-web";
import { BottomNav } from "../shared/BottomNav";
import { theme } from "@/theme";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Phone Frame for Desktop */}
      <View style={styles.phoneFrame}>
        
        {/* Notch (Visual only - Web only) */}
        <View style={styles.notch} />

        {/* Status Bar Area */}
        <View style={styles.statusBar} />

        <View style={[styles.content, showNav && { paddingBottom: 80 }]}>
          {children}
        </View>
        
        {showNav && (
          <View style={styles.bottomNavContainer}>
            <BottomNav />
          </View>
        )}
        
        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray900,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 32 : 0,
    height: '100vh', // Ensure full height on web
  },
  phoneFrame: {
    width: '100%',
    height: '100%',
    maxWidth: 375,
    maxHeight: 812,
    backgroundColor: theme.colors.background,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: theme.colors.gray900,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    width: 160,
    height: 24,
    backgroundColor: theme.colors.gray900,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 50,
  },
  statusBar: {
    height: 44, // Standard iOS status bar height
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 40,
    position: 'absolute',
    top: 0,
  },
  content: {
    flex: 1,
    paddingTop: 44, // Push content below status bar
    overflowY: 'auto', // Web scrolling
    overflowX: 'hidden',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    width: 120,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    zIndex: 50,
  },
});
