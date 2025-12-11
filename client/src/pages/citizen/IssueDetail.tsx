import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Dimensions } from "react-native-web";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  AlertTriangle,
  Send,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { theme } from "@/theme";

// Mock data store
const MOCK_ISSUES: Record<string, any> = {
  "1": {
    id: "1",
    trackingId: "TAR-2025-0042",
    category: "Roads",
    title: "Deep Pothole Causing Traffic",
    description: "Large pothole in the middle lane of Samora Machel Avenue. It's causing cars to swerve into oncoming traffic. Very dangerous during rush hour.",
    location: "123 Samora Machel Ave, Harare",
    status: "in_progress",
    date: "2 hours ago",
    upvotes: 24,
    reporter: "Tatenda P.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    updates: [
      { status: "in_progress", date: "1 hour ago", note: "City of Harare Roads Dept acknowledged receipt. Team dispatched." },
      { status: "verified", date: "1.5 hours ago", note: "Verified by 5 nearby citizens." },
      { status: "submitted", date: "2 hours ago", note: "Report submitted." }
    ],
    comments: [
      { id: 1, user: "John D.", text: "I hit this yesterday! Needs fixing ASAP.", time: "1 hr ago" },
      { id: 2, user: "Mary K.", text: "Traffic is backed up all the way to 4th street because of this.", time: "30 mins ago" }
    ]
  },
  "2": {
    id: "2",
    trackingId: "TAR-2025-0041",
    category: "Water",
    title: "Burst Pipe Flooding Street",
    description: "Clean water wasting away from a burst pipe near the intersection. It's been flowing for 5 hours now.",
    location: "45 Borrowdale Rd, Avondale",
    status: "submitted",
    date: "5 hours ago",
    upvotes: 8,
    reporter: "Sarah M.",
    imageUrl: "https://images.unsplash.com/photo-1583329065977-834f828751e0?auto=format&fit=crop&q=80&w=800",
    updates: [
      { status: "submitted", date: "5 hours ago", note: "Report submitted." }
    ],
    comments: [
      { id: 1, user: "Peter Z.", text: "This happens every month in this area.", time: "2 hrs ago" }
    ]
  },
  "3": {
    id: "3",
    trackingId: "TAR-2025-0038",
    category: "Street Lights",
    title: "Dark Corner at 4th Street",
    description: "Street lights have been out for a week. Very unsafe for pedestrians at night.",
    location: "Corner 4th & Jason Moyo",
    status: "resolved",
    date: "2 days ago",
    upvotes: 45,
    reporter: "James K.",
    imageUrl: null,
    updates: [
      { status: "resolved", date: "Yesterday", note: "Bulbs replaced and circuit fixed." },
      { status: "in_progress", date: "2 days ago", note: "Maintenance team scheduled." },
      { status: "submitted", date: "3 days ago", note: "Report submitted." }
    ],
    comments: []
  },
  "4": {
    id: "4",
    trackingId: "TAR-2025-0035",
    category: "Waste",
    title: "Illegal Dumping Site",
    description: "Pile of garbage growing next to the park. Smell is terrible.",
    location: "Harare Gardens, South Gate",
    status: "verified",
    date: "1 week ago",
    upvotes: 12,
    reporter: "Anonymous",
    imageUrl: null,
    updates: [
      { status: "verified", date: "5 days ago", note: "Verified by community leader." },
      { status: "submitted", date: "1 week ago", note: "Report submitted." }
    ],
    comments: []
  }
};

export default function IssueDetail({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  
  if (!params?.id) return null;
  
  const issue = MOCK_ISSUES[params.id];
  // Local state for comments to simulate real-time updates
  const [comments, setComments] = useState(issue?.comments || []);

  if (!issue) {
    return (
      <MobileLayout>
        <View style={styles.notFoundContainer}>
          <AlertTriangle size={64} color={theme.colors.gray300} />
          <Text style={styles.notFoundTitle}>Issue Not Found</Text>
          <Text style={styles.notFoundText}>The report you are looking for might have been deleted or moved.</Text>
          <Link href="/citizen/home">
            <TouchableOpacity style={styles.homeButton}>
              <Text style={styles.homeButtonText}>Go Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MobileLayout>
    );
  }

  const handleUpvote = () => {
    toast({
      title: "Upvoted!",
      description: "You've supported this report. +1 CivicCredit earned.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Shared",
      description: "Link copied to clipboard.",
    });
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: "Tatenda P.", // Current user
      text: newComment,
      time: "Just now"
    };

    setComments([comment, ...comments]);
    setNewComment("");
    
    toast({
      title: "Comment Posted",
      description: "Your comment has been added to the discussion.",
    });
  };

  return (
    <MobileLayout showNav={false}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Image */}
        <View style={styles.imageHeader}>
          {issue.imageUrl ? (
            <Image 
              source={{ uri: issue.imageUrl }} 
              style={styles.headerImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerPlaceholder}>
              <MapPin size={80} color="rgba(255,255,255,0.2)" />
            </View>
          )}
          
          {/* Navigation Header Overlay */}
          <View style={styles.overlayHeader}>
            <Link href="/citizen/home">
              <TouchableOpacity style={styles.iconButton}>
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Share2 size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageOverlayContent}>
            <View style={styles.badgesRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{issue.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.statusBadgeText}>{issue.status}</Text>
              </View>
            </View>
            <Text style={styles.title}>{issue.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.gray500} />
              <Text style={styles.metaText}>{issue.date}</Text>
            </View>
            <View style={styles.trackingIdBadge}>
              <Text style={styles.trackingIdText}>{issue.trackingId}</Text>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.locationCard}>
            <MapPin size={20} color={theme.colors.primary} style={{ marginTop: 2 }} />
            <View>
              <Text style={styles.locationMain}>{issue.location}</Text>
              <Text style={styles.locationSub}>Ward 7, Avondale West</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {issue.description}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleUpvote}>
              <ThumbsUp size={18} color="white" />
              <Text style={styles.actionButtonPrimaryText}>Upvote ({issue.upvotes})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonOutline}>
              <MessageSquare size={18} color={theme.colors.gray800} />
              <Text style={styles.actionButtonOutlineText}>Comment ({comments.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          {/* Timeline Updates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Updates</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              {issue.updates.map((update: any, index: number) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    { backgroundColor: index === 0 ? theme.colors.primary : theme.colors.gray300 }
                  ]} />
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={[
                        styles.timelineStatus,
                        { color: index === 0 ? theme.colors.primary : theme.colors.gray500 }
                      ]}>
                        {update.status.replace('_', ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.timelineDate}>• {update.date}</Text>
                    </View>
                    <Text style={styles.timelineNote}>{update.note}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discussion</Text>
            
            {/* Comment List */}
            <View style={styles.commentsList}>
              {comments.map((comment: any) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.avatar}>
                     <Text style={styles.avatarText}>{comment.user[0]}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              ))}
              {comments.length === 0 && (
                <Text style={styles.emptyComments}>No comments yet. Be the first to discuss.</Text>
              )}
            </View>

            {/* Add Comment Input */}
            <View style={styles.commentInputContainer}>
              <TextInput 
                placeholder="Add a comment..." 
                style={styles.commentInput}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholderTextColor={theme.colors.gray400}
                // onKeyDown not supported in RNW standard props easily without handling, relying on button
              />
              <TouchableOpacity 
                style={[styles.sendButton, !newComment.trim() && styles.disabledSendButton]} 
                onPress={handlePostComment} 
                disabled={!newComment.trim()}
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    height: 400,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 16,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  homeButton: {
    backgroundColor: theme.colors.gray900,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  imageHeader: {
    height: 256,
    backgroundColor: theme.colors.gray900,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  imageOverlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backdropFilter: 'blur(4px)',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    lineHeight: 28,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: theme.colors.gray500,
    fontSize: 14,
  },
  trackingIdBadge: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trackingIdText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: theme.colors.gray800,
  },
  locationCard: {
    backgroundColor: theme.colors.gray100,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  locationSub: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.gray800,
    lineHeight: 22,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButtonPrimary: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.gray900,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonPrimaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonOutline: {
    flex: 1,
    height: 48,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: theme.colors.gray800,
    fontWeight: '600',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray200,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 16,
    gap: 32,
  },
  timelineLine: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.gray100,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -21,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
    ...theme.shadows.sm,
  },
  timelineContent: {
    gap: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  timelineNote: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  commentsList: {
    gap: 16,
    marginBottom: 24,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  commentContent: {
    flex: 1,
    backgroundColor: theme.colors.gray100,
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 0,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray900,
  },
  commentTime: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.gray800,
  },
  emptyComments: {
    textAlign: 'center',
    color: theme.colors.gray400,
    fontSize: 14,
    paddingVertical: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    outlineStyle: 'none',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSendButton: {
    backgroundColor: theme.colors.gray300,
  },
});
