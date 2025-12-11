import { ReactNode } from "react";
import { BottomNav } from "../shared/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-24' : ''}`}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
