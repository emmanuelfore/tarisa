import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { IssueCard } from "@/components/shared/IssueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import type { Issue } from "@shared/schema";

export default function CitizenHome() {
  // For now, we'll show all issues since citizen auth isn't fully implemented
  // In a full implementation, this would fetch issues for the logged-in citizen
  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
    queryFn: async () => {
      const res = await fetch("/api/issues", { credentials: "include" });
      if (!res.ok) {
        // If not authenticated, return empty array (citizen view)
        return [];
      }
      return res.json();
    },
  });

  // Get analytics for stats
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Filter issues for display
  const recentIssues = issues.slice(0, 4);
  const nearbyIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').slice(0, 3);
  const resolvedCount = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const totalCredits = 0; // Would come from citizen credits endpoint when auth is implemented

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hrs ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (issuesLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Welcome to</p>
              <h1 className="text-2xl font-heading font-bold text-white" data-testid="text-app-title">TARISA</h1>
            </div>
            <Link href="/citizen/profile">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-white/30 transition-colors" data-testid="button-profile">
                C
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Link href="/citizen/report">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95" data-testid="card-reports-stat">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1" data-testid="text-total-reports">{analytics?.totalIssues || issues.length}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Reports</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/citizen/credits">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95" data-testid="card-credits-stat">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1" data-testid="text-credits">{totalCredits}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Credits</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/citizen/map">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95" data-testid="card-resolved-stat">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1" data-testid="text-resolved">{analytics?.resolvedIssues || resolvedCount}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Resolved</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-20 space-y-8 pb-8">
        {/* Nearby Issues Carousel */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-heading font-semibold text-gray-800">Active Issues</h2>
            <Link href="/citizen/map">
              <Button variant="link" className="text-primary h-auto p-0 text-xs" data-testid="button-view-all">View All</Button>
            </Link>
          </div>
          
          {nearbyIssues.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 text-sm">No active issues in your area</p>
                <Link href="/citizen/report">
                  <Button className="mt-4" size="sm" data-testid="button-report-issue">Report an Issue</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide snap-x">
              {nearbyIssues.map((issue) => (
                <div key={issue.id} className="w-[280px] shrink-0 snap-center">
                  <IssueCard 
                    id={issue.id.toString()}
                    category={issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                    location={issue.location}
                    status={issue.status as any}
                    imageUrl={issue.photos && Array.isArray(issue.photos) && issue.photos.length > 0 ? issue.photos[0] : undefined}
                    upvotes={0}
                    date={formatDate(issue.createdAt)}
                    distance={undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Reports */}
        <section>
          <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4 px-1">Recent Reports</h2>
          {recentIssues.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 text-sm">No reports yet</p>
                <p className="text-gray-400 text-xs mt-1">Be the first to report an issue in your community</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <IssueCard 
                  key={issue.id}
                  id={issue.id.toString()}
                  category={issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
                  location={issue.location}
                  status={issue.status as any}
                  upvotes={0}
                  date={formatDate(issue.createdAt)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/citizen/report">
              <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-95" data-testid="card-new-report">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="font-medium text-sm text-gray-800">New Report</p>
                  <p className="text-xs text-gray-500">Submit an issue</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/citizen/track">
              <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-95" data-testid="card-track-report">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="font-medium text-sm text-gray-800">Track Report</p>
                  <p className="text-xs text-gray-500">Check status</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
