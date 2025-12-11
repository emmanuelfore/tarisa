import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native-web";
import { Settings, LogOut, ChevronRight, MapPin, Phone, Mail, ShieldCheck, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { theme } from "@/theme";

export default function CitizenProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    toast({
      title: "Logging out...",
      description: "You have been successfully logged out.",
    });
    setTimeout(() => setLocation('/'), 1000);
  };

  return (
    <MobileLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>My Profile</Text>

        {/* Digital ID Card */}
        <View style={styles.idCardContainer}>
          <View style={styles.idCard}>
            <View style={styles.topBar} />
            
            <View style={styles.cardContent}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: "https://github.com/shadcn.png" }} style={styles.avatar} />
                  <View style={styles.avatarFallback}>
                     <Text style={styles.avatarFallbackText}>TP</Text>
                  </View>
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.lastName}>PHIRI</Text>
                  <Text style={styles.firstName}>Tatenda James</Text>
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color={theme.colors.success} />
                    <Text style={styles.verifiedText}>Verified Resident</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>NATIONAL ID</Text>
                  <Text style={styles.detailValueMono}>63-2394102 F 42</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>COUNCIL</Text>
                  <Text style={styles.detailValue}>City of Harare</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>WARD</Text>
                  <Text style={styles.detailValue}>Ward 7 (Avondale)</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ROLE</Text>
                  <Text style={styles.detailValue}>Ratepayer</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bottomBar} />
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.iconCircle}>
                <Phone size={20} color={theme.colors.gray500} />
              </View>
              <View>
                <Text style={styles.contactValue}>+263 77 123 4567</Text>
                <Text style={styles.contactLabel}>Primary Mobile</Text>
              </View>
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.contactRow}>
              <View style={styles.iconCircle}>
                <Mail size={20} color={theme.colors.gray500} />
              </View>
              <View>
                <Text style={styles.contactValue}>tatenda.phiri@gmail.com</Text>
                <Text style={styles.contactLabel}>Email Address</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.contactRow}>
              <View style={styles.iconCircle}>
                <MapPin size={20} color={theme.colors.gray500} />
              </View>
              <View>
                <Text style={styles.contactValue}>123 Samora Machel Avenue</Text>
                <Text style={styles.contactLabel}>Residential Address</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsList}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <FileText size={20} color={theme.colors.gray500} />
              <Text style={styles.actionText}>My Reports History</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionLeft}>
              <Settings size={20} color={theme.colors.gray500} />
              <Text style={styles.actionText}>Settings</Text>
            </View>
            <ChevronRight size={16} color={theme.colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <View style={styles.actionLeft}>
              <LogOut size={20} color={theme.colors.danger} />
              <Text style={[styles.actionText, { color: theme.colors.danger }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Verified by Ministry of Local Govt</Text>
          <Text style={styles.footerText}>TARISA ID: 8829-1102</Text>
        </View>
      </ScrollView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 24,
  },
  idCardContainer: {
    marginBottom: 32,
    transform: [{ rotate: '1deg' }],
  },
  idCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  topBar: {
    height: 12,
    backgroundColor: theme.colors.primary,
  },
  cardContent: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: theme.colors.gray100,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  avatarFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontWeight: '600',
    color: theme.colors.gray500,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  lastName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.gray900,
    letterSpacing: 0.5,
  },
  firstName: {
    fontSize: 18,
    color: theme.colors.gray800,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedText: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.gray400,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
  },
  detailValueMono: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
    fontFamily: 'monospace',
  },
  bottomBar: {
    height: 4,
    backgroundColor: theme.colors.warning,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
  },
  contactLabel: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray100,
  },
  actionsList: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    height: 56,
  },
  logoutButton: {
    borderColor: theme.colors.danger + '40', // transparent red
    backgroundColor: '#FEF2F2',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
});
