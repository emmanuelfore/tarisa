import { Link, useLocation } from "wouter";
import { Home, Map, PlusCircle, CreditCard, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 h-20 flex justify-between items-start z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <Link href="/citizen/home">
        <a className={`flex flex-col items-center gap-1 ${isActive("/citizen/home") ? "text-primary" : "text-gray-400"}`}>
          <Home size={24} strokeWidth={isActive("/citizen/home") ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </a>
      </Link>
      
      <Link href="/citizen/map">
        <a className={`flex flex-col items-center gap-1 ${isActive("/citizen/map") ? "text-primary" : "text-gray-400"}`}>
          <Map size={24} strokeWidth={isActive("/citizen/map") ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Map</span>
        </a>
      </Link>

      <Link href="/citizen/report">
        <a className="flex flex-col items-center gap-1 -mt-6">
          <div className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors hover:scale-105 active:scale-95">
            <PlusCircle size={32} />
          </div>
          <span className="text-[10px] font-medium text-primary">Report</span>
        </a>
      </Link>

      <Link href="/citizen/credits">
        <a className={`flex flex-col items-center gap-1 ${isActive("/citizen/credits") ? "text-primary" : "text-gray-400"}`}>
          <CreditCard size={24} strokeWidth={isActive("/citizen/credits") ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Credits</span>
        </a>
      </Link>

      <Link href="/citizen/profile">
        <a className={`flex flex-col items-center gap-1 ${isActive("/citizen/profile") ? "text-primary" : "text-gray-400"}`}>
          <User size={24} strokeWidth={isActive("/citizen/profile") ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Profile</span>
        </a>
      </Link>
    </div>
  );
}
