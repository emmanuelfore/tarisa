import { ReactNode } from "react";
import { BottomNav } from "../shared/BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-0 md:p-8">
      {/* Phone Frame for Desktop */}
      <div className="w-full h-full md:w-[375px] md:h-[812px] bg-white md:rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden border-[8px] border-gray-900">
        
        {/* Notch (Visual only) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-2xl z-50 hidden md:block" />

        {/* Status Bar Area */}
        <div className="h-12 w-full bg-white/90 backdrop-blur-sm fixed top-0 left-0 z-40 md:absolute shrink-0" />

        <main className={`flex-1 overflow-y-auto scrollbar-hide pt-8 ${showNav ? 'pb-20' : ''}`}>
          {children}
        </main>
        
        {showNav && (
          <div className="absolute bottom-0 left-0 right-0 z-50">
            <BottomNav />
          </div>
        )}
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-900/20 rounded-full z-50 hidden md:block pointer-events-none" />
      </div>
    </div>
  );
}
