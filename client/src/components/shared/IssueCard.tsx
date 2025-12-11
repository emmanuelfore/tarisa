import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native-web";
import { Link } from "wouter";
import { MapPin, ThumbsUp } from "lucide-react";
import { theme } from "@/theme";

interface IssueCardProps {
  id: string;
  category: string;
  location: string;
  status: 'submitted' | 'verified' | 'in_progress' | 'resolved' | 'critical';
  imageUrl?: string;
  upvotes: number;
  date: string;
  distance?: string;
}

const statusColors = {
  submitted: theme.colors.gray400,
  verified: theme.colors.secondary, // Simplified map
  in_progress: theme.colors.warning,
  resolved: theme.colors.success,
  critical: theme.colors.danger,
};

const statusLabels = {
  submitted: 'Submitted',
  verified: 'Verified',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  critical: 'Critical',
};

export function IssueCard({ id, category, location, status, imageUrl, upvotes, date, distance }: IssueCardProps) {
  return (
    <Link href={`/citizen/issue/${id}`}>
      <View style={styles.card}>
        <View style={styles.row}>
          {imageUrl && (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
          )}
          
          <View style={[styles.content, !imageUrl && { paddingLeft: 16 }]}>
            <View style={styles.header}>
              <Text style={styles.category}>{category}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[status] + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColors[status] }]}>
                  {statusLabels[status]}
                </Text>
              </View>
            </View>
            
            <Text style={styles.title} numberOfLines={2}>{location}</Text>
            
            <View style={styles.footer}>
              <View style={styles.metaRow}>
                <View style={styles.iconText}>
                  <MapPin size={12} color={theme.colors.gray400} />
                  <Text style={styles.metaText}>{distance || '1.2km'}</Text>
                </View>
                <Text style={styles.metaText}>• {date}</Text>
              </View>
              
              <View style={styles.iconText}>
                <ThumbsUp size={12} color={theme.colors.primary} />
                <Text style={styles.upvoteText}>{upvotes}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    width: '100%', // Ensure width
  },
  row: {
    flexDirection: 'row',
    height: 100,
  },
  image: {
    width: 100,
    height: '100%',
    backgroundColor: theme.colors.gray100,
  },
  content: {
    flex: 1,
    padding: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
