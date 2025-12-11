import { MobileLayout } from "@/components/layout/MobileLayout";
import { IssueCard } from "@/components/shared/IssueCard";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native-web";
import { Link } from "wouter";
import { theme } from "@/theme";

export default function CitizenHome() {
  return (
    <MobileLayout>
      {/* Header */}
      <View style={styles.header}>
        {/* Decorative Circles */}
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>Tatenda</Text>
            </View>
            <Link href="/citizen/profile">
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>T</Text>
              </View>
            </Link>
          </View>

          <View style={styles.statsRow}>
            <Link href="/citizen/report">
              <View style={styles.statCard}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
            </Link>
            <Link href="/citizen/credits">
              <View style={styles.statCard}>
                <Text style={styles.statValue}>450</Text>
                <Text style={styles.statLabel}>Credits</Text>
              </View>
            </Link>
            <Link href="/citizen/map">
              <View style={styles.statCard}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </Link>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Nearby Issues Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Issues</Text>
            <Link href="/citizen/map">
              <Text style={styles.linkText}>View All</Text>
            </Link>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel} contentContainerStyle={styles.carouselContent}>
            <View style={styles.carouselItem}>
              <IssueCard 
                id="1"
                category="Roads"
                location="Pothole on Samora Machel Ave"
                status="in_progress"
                imageUrl="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"
                upvotes={24}
                date="2 hrs ago"
                distance="0.3km"
              />
            </View>
            <View style={styles.carouselItem}>
              <IssueCard 
                id="2"
                category="Water"
                location="Burst Pipe in Avondale"
                status="submitted"
                imageUrl="https://images.unsplash.com/photo-1583329065977-834f828751e0?auto=format&fit=crop&q=80&w=400"
                upvotes={8}
                date="5 hrs ago"
                distance="0.8km"
              />
            </View>
          </ScrollView>
        </View>

        {/* My Recent Reports */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>My Recent Reports</Text>
          <View style={styles.list}>
             <IssueCard 
                id="3"
                category="Street Lights"
                location="Dark corner at 4th Street"
                status="resolved"
                upvotes={45}
                date="2 days ago"
              />
              <IssueCard 
                id="4"
                category="Waste"
                location="Illegal dumping site"
                status="verified"
                upvotes={12}
                date="1 week ago"
              />
          </View>
        </View>
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 48,
    paddingBottom: 96,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'sans-serif', // Fallback
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  mainContent: {
    marginTop: -48,
    paddingHorizontal: 24,
    zIndex: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray800,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  carousel: {
    marginHorizontal: -24,
  },
  carouselContent: {
    paddingHorizontal: 24,
    paddingBottom: 4,
    gap: 16,
  },
  carouselItem: {
    width: 280,
  },
  list: {
    gap: 16,
  }
});
