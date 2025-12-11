import { MobileLayout } from "@/components/layout/MobileLayout";
import { IssueCard } from "@/components/shared/IssueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function CitizenHome() {
  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-primary pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-heading font-bold text-white">Tatenda</h1>
            </div>
            <Link href="/citizen/profile">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-white/30 transition-colors">
                T
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Link href="/citizen/report">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1">12</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Reports</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/citizen/credits">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1">450</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Credits</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/citizen/map">
              <Card className="bg-white/10 border-white/20 backdrop-blur-md shadow-none cursor-pointer hover:bg-white/20 transition-colors active:scale-95">
                <CardContent className="p-3 flex flex-col items-center justify-center text-white text-center">
                  <span className="text-2xl font-bold mb-1">5</span>
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
            <h2 className="text-lg font-heading font-semibold text-gray-800">Nearby Issues</h2>
            <Link href="/citizen/map">
              <Button variant="link" className="text-primary h-auto p-0 text-xs">View All</Button>
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide snap-x">
            <div className="w-[280px] shrink-0 snap-center">
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
            </div>
            <div className="w-[280px] shrink-0 snap-center">
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
            </div>
          </div>
        </section>

        {/* My Recent Reports */}
        <section>
          <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4 px-1">My Recent Reports</h2>
          <div className="space-y-4">
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
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
