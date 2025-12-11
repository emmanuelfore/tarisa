import { View, Text, StyleSheet } from "react-native-web";
import { theme } from "@/theme";

type Status = 'submitted' | 'verified' | 'in_progress' | 'resolved' | 'critical';

interface StatusBadgeProps {
  status: Status;
  style?: any;
}

const statusConfig: Record<Status, { label: string; bg: string; color: string }> = {
  submitted: { label: 'Submitted', bg: theme.colors.gray100, color: theme.colors.gray800 },
  verified: { label: 'Verified', bg: '#DBEAFE', color: '#1E40AF' }, // Blue
  in_progress: { label: 'In Progress', bg: '#FEF3C7', color: '#92400E' }, // Amber
  resolved: { label: 'Resolved', bg: '#DCFCE7', color: '#166534' }, // Green
  critical: { label: 'Critical', bg: '#FEE2E2', color: '#991B1B' }, // Red
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.submitted;
  
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
