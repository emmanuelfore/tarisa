import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut, ChevronRight, Award, History, ShieldCheck } from "lucide-react";

export default function CitizenProfile() {
  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>TP</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tatenda Phiri</h2>
            <p className="text-gray-500 text-sm">Ward 7, Avondale</p>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified Citizen
            </Badge>
          </div>
        </div>

        {/* CivicCredits Wallet */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl mb-8">
          <CardContent className="p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Award size={120} />
             </div>
             <p className="text-primary-foreground/80 font-medium mb-1">CivicCredits Balance</p>
             <h3 className="text-4xl font-bold font-heading mb-4">450 CC</h3>
             <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
               <span>≈ $2,250 ZWL</span>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-gray-900">Account</h3>
          
          <Button variant="outline" className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200">
            <span className="flex items-center gap-3">
              <History className="text-gray-500" />
              History & Activity
            </span>
            <ChevronRight className="text-gray-400" size={16} />
          </Button>

          <Button variant="outline" className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200">
            <span className="flex items-center gap-3">
              <Settings className="text-gray-500" />
              Settings & Preferences
            </span>
            <ChevronRight className="text-gray-400" size={16} />
          </Button>

           <Button variant="outline" className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50">
            <span className="flex items-center gap-3">
              <LogOut />
              Log Out
            </span>
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>TARISA v1.0.0 (Beta)</p>
          <p>Built for Zimbabwe 🇿🇼</p>
        </div>
      </div>
    </MobileLayout>
  );
}
