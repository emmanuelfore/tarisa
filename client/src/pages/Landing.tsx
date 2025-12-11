import { Link } from "wouter";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native-web";
import { ArrowRight, Smartphone, LayoutDashboard, ShieldCheck } from "lucide-react";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";
import { theme } from "@/theme";

export default function Landing() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgGradient} />
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Image source={{ uri: appIcon }} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <Text style={styles.title}>TARISA</Text>
        
        <Text style={styles.subtitle}>
          "See It. Snap It. Solve It."
        </Text>
        <Text style={styles.description}>
          The next-generation civic reporting platform for Zimbabwe.
        </Text>

        <View style={styles.cardContainer}>
          {/* Citizen App Option */}
          <Link href="/citizen/home">
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIconBox}>
                <Smartphone size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Citizen App</Text>
              <Text style={styles.cardDescription}>Report issues, track progress, and earn CivicCredits.</Text>
              <View style={styles.cardLink}>
                <Text style={styles.cardLinkText}>Launch App</Text>
                <ArrowRight size={16} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </Link>

          {/* Signup Link */}
          <Link href="/signup">
            <TouchableOpacity style={styles.signupLink}>
              <Text style={styles.signupText}>New user? Create an account</Text>
            </TouchableOpacity>
          </Link>

          {/* Admin Dashboard Option */}
          <Link href="/admin/dashboard">
            <TouchableOpacity style={[styles.card, styles.adminCard]}>
              <View style={styles.cardIconBoxAdmin}>
                <LayoutDashboard size={24} color={theme.colors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Admin Dashboard</Text>
              <Text style={styles.cardDescription}>Manage reports, assign teams, and analyze city data.</Text>
              <View style={styles.cardLink}>
                <Text style={styles.cardLinkTextAdmin}>Access Portal</Text>
                <ArrowRight size={16} color={theme.colors.secondary} />
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.footer}>
          <ShieldCheck size={16} color={theme.colors.gray400} />
          <Text style={styles.footerText}>Secure • Verified • Official Partner of City of Harare</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 24,
    minHeight: '100vh',
    justifyContent: 'center',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(46, 125, 50, 0.05)', // primary/5
  },
  bgCircleTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(245, 124, 0, 0.05)', // secondary/5
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBox: {
    width: 96,
    height: 96,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
    padding: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.gray900,
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
  description: {
    fontSize: 16,
    color: theme.colors.gray400,
    marginBottom: 48,
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    gap: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    ...theme.shadows.sm,
  },
  adminCard: {
    borderColor: theme.colors.gray200,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardIconBoxAdmin: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(245, 124, 0, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cardLinkTextAdmin: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  signupLink: {
    alignItems: 'center',
    padding: 16,
  },
  signupText: {
    fontSize: 14,
    color: theme.colors.gray500,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 64,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.gray400,
  },
});
