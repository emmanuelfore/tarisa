import { Link, useLocation } from "wouter";
import { Home, Map, PlusCircle, CreditCard, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="bg-white border-t border-gray-100 pb-safe px-6 h-20 flex justify-between items-start shadow-[0_-4px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg bg-white/95">
      <Link href="/citizen/home" className={`flex flex-col items-center justify-center pt-3 gap-1 w-12 ${isActive("/citizen/home") || isActive("/") ? "text-primary" : "text-gray-400"}`}>
        <Home size={24} strokeWidth={isActive("/citizen/home") || isActive("/") ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      <Link href="/citizen/map" className={`flex flex-col items-center justify-center pt-3 gap-1 w-12 ${isActive("/citizen/map") ? "text-primary" : "text-gray-400"}`}>
        <Map size={24} strokeWidth={isActive("/citizen/map") ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Map</span>
      </Link>

      <Link href="/citizen/report" className="flex flex-col items-center justify-center -mt-5">
        <div className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-transform active:scale-95">
          <PlusCircle size={28} />
        </div>
        <span className="text-[10px] font-medium text-primary mt-1">Report</span>
      </Link>

      <Link href="/citizen/credits" className={`flex flex-col items-center justify-center pt-3 gap-1 w-12 ${isActive("/citizen/credits") ? "text-primary" : "text-gray-400"}`}>
        <CreditCard size={24} strokeWidth={isActive("/citizen/credits") ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Credits</span>
      </Link>

      <Link href="/citizen/profile" className={`flex flex-col items-center justify-center pt-3 gap-1 w-12 ${isActive("/citizen/profile") ? "text-primary" : "text-gray-400"}`}>
        <User size={24} strokeWidth={isActive("/citizen/profile") ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </div>
  );
}
