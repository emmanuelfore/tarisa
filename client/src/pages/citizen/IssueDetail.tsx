import { useRoute } from "wouter";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Share2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "wouter";

// Mock data store - in a real app this would come from an API
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
    comments: 3,
    reporter: "Tatenda P.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    updates: [
      { status: "in_progress", date: "1 hour ago", note: "City of Harare Roads Dept acknowledged receipt. Team dispatched." },
      { status: "verified", date: "1.5 hours ago", note: "Verified by 5 nearby citizens." },
      { status: "submitted", date: "2 hours ago", note: "Report submitted." }
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
    comments: 1,
    reporter: "Sarah M.",
    imageUrl: "https://images.unsplash.com/photo-1583329065977-834f828751e0?auto=format&fit=crop&q=80&w=800",
    updates: [
      { status: "submitted", date: "5 hours ago", note: "Report submitted." }
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
    comments: 12,
    reporter: "James K.",
    imageUrl: null, // No image example
    updates: [
      { status: "resolved", date: "Yesterday", note: "Bulbs replaced and circuit fixed." },
      { status: "in_progress", date: "2 days ago", note: "Maintenance team scheduled." },
      { status: "submitted", date: "3 days ago", note: "Report submitted." }
    ]
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
    comments: 0,
    reporter: "Anonymous",
    imageUrl: null,
    updates: [
      { status: "verified", date: "5 days ago", note: "Verified by community leader." },
      { status: "submitted", date: "1 week ago", note: "Report submitted." }
    ]
  }
};

export default function IssueDetail() {
  const [match, params] = useRoute("/citizen/issue/:id");
  const { toast } = useToast();
  
  if (!match || !params?.id) return null;
  
  const issue = MOCK_ISSUES[params.id];

  if (!issue) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-500 mb-6">The report you are looking for might have been deleted or moved.</p>
          <Link href="/citizen/home">
            <Button>Go Home</Button>
          </Link>
        </div>
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

  return (
    <MobileLayout showNav={false}>
      {/* Header with Image */}
      <div className="relative h-64 bg-gray-900">
        {issue.imageUrl ? (
          <img 
            src={issue.imageUrl} 
            alt={issue.title} 
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <MapPin className="text-white/20 h-20 w-20" />
          </div>
        )}
        
        {/* Navigation Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <Link href="/citizen/home">
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white shadow-lg">
              <ChevronLeft size={24} />
            </Button>
          </Link>
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white shadow-lg" onClick={handleShare}>
            <Share2 size={20} />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary hover:bg-primary border-none text-white">{issue.category}</Badge>
            <StatusBadge status={issue.status} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-transparent" />
          </div>
          <h1 className="text-2xl font-heading font-bold leading-tight">{issue.title}</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{issue.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{issue.trackingId}</span>
          </div>
        </div>

        {/* Location Card */}
        <Card className="bg-gray-50 border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <MapPin className="text-primary shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-gray-900 text-sm">{issue.location}</p>
              <p className="text-xs text-gray-500 mt-1">Ward 7, Avondale West</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <div>
          <h3 className="font-heading font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            {issue.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="flex-1 h-12 gap-2 text-base" onClick={handleUpvote}>
            <ThumbsUp size={18} />
            Upvote ({issue.upvotes})
          </Button>
          <Button variant="outline" className="flex-1 h-12 gap-2 text-base">
            <MessageSquare size={18} />
            Comment ({issue.comments})
          </Button>
        </div>

        <Separator />

        {/* Timeline Updates */}
        <div>
          <h3 className="font-heading font-semibold text-gray-900 mb-4">Status Updates</h3>
          <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
            {issue.updates.map((update: any, index: number) => (
              <div key={index} className="relative">
                <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${index === 0 ? 'text-primary' : 'text-gray-600'}`}>
                      {update.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">• {update.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{update.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reporter Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${issue.reporter}`} />
            <AvatarFallback>{issue.reporter[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Reported by {issue.reporter}</p>
            <p className="text-xs text-gray-500">Verified Citizen</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
