import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { MapPin, ThumbsUp } from "lucide-react";
import { Link } from "wouter";

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

export function IssueCard({ id, category, location, status, imageUrl, upvotes, date, distance }: IssueCardProps) {
  return (
    <Link href={`/citizen/issue/${id}`}>
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
        <CardContent className="p-0">
          <div className="flex">
            {imageUrl && (
              <div className="w-24 h-24 sm:w-32 sm:h-auto bg-gray-100 shrink-0">
                <img src={imageUrl} alt={category} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`flex-1 p-3 flex flex-col justify-between ${!imageUrl ? 'p-4' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</span>
                <StatusBadge status={status} className="scale-75 origin-right" />
              </div>
              
              <h3 className="font-heading font-medium text-sm line-clamp-2 text-foreground mb-1">
                {location}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {distance || '1.2km'}
                  </span>
                  <span>{date}</span>
                </div>
                
                <div className="flex items-center gap-1 text-primary font-medium">
                  <ThumbsUp size={12} />
                  {upvotes}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
