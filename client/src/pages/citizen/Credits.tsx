import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native-web";
import { Award, ArrowUpRight, ArrowDownLeft, Gift, History } from "lucide-react";
import { theme } from "@/theme";

export default function CitizenCredits() {
  return (
    <MobileLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>CivicCredits Wallet</Text>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.cardBackgroundIcon}>
            <Award size={140} color="rgba(255,255,255,0.1)" />
          </View>
          
          <View style={styles.cardContent}>
             <Text style={styles.balanceLabel}>Available Balance</Text>
             <View style={styles.balanceRow}>
               <Text style={styles.balanceAmount}>450</Text>
               <Text style={styles.balanceUnit}>CC</Text>
             </View>
             
             <View style={styles.equivalentBadge}>
               <Text style={styles.equivalentLabel}>Equivalent Value</Text>
               <Text style={styles.equivalentAmount}>≈ $2,250 ZWL</Text>
             </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Gift size={24} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>Redeem</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <History size={24} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          <View style={styles.transactionsList}>
            {/* Transaction 1 */}
            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <ArrowDownLeft size={20} color={theme.colors.success} />
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Report Verified</Text>
                  <Text style={styles.transactionSubtitle}>Pothole on Samora Machel</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: theme.colors.success }]}>+15 CC</Text>
            </View>
            
            <View style={styles.separator} />

            {/* Transaction 2 */}
            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <ArrowDownLeft size={20} color={theme.colors.success} />
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Report Upvoted</Text>
                  <Text style={styles.transactionSubtitle}>Street Light Issue</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: theme.colors.success }]}>+1 CC</Text>
            </View>

            <View style={styles.separator} />

             {/* Transaction 3 */}
            <View style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFEDD5' }]}>
                  <ArrowUpRight size={20} color={theme.colors.secondary} />
                </View>
                <View>
                  <Text style={styles.transactionTitle}>Airtime Redemption</Text>
                  <Text style={styles.transactionSubtitle}>Econet $1 USD Bundle</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: theme.colors.gray900 }]}>-100 CC</Text>
            </View>
          </View>
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
  balanceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    ...theme.shadows.lg,
    position: 'relative',
    height: 200,
  },
  cardBackgroundIcon: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  cardContent: {
    padding: 32,
    zIndex: 10,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  balanceUnit: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  equivalentBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backdropFilter: 'blur(8px)',
  },
  equivalentLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  equivalentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    ...theme.shadows.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.gray800,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray900,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: theme.colors.gray500,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray100,
  },
});
