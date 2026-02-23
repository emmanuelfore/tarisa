import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, LogOut, ChevronRight, MapPin, User, FileText, Phone, Mail, ShieldCheck, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CitizenProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    toast({
      title: "Logging out...",
      description: "You have been successfully logged out.",
    });
    setTimeout(() => setLocation('/'), 1000);
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Digital ID Card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl transform rotate-1 opacity-20"></div>
          <Card className="border-none shadow-xl bg-white overflow-hidden relative">
            {/* Zim Coat of Arms Watermark Placeholder */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <Building2 size={200} />
            </div>

            <div className="bg-blue-700 h-3 w-full" /> {/* Top Blue Bar */}

            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <Avatar className="w-24 h-24 border-4 border-gray-50 shadow-sm rounded-lg">
                    <AvatarImage src="https://github.com/shadcn.png" className="object-cover rounded-lg" />
                    <AvatarFallback className="rounded-lg">TP</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Phiri</h2>
                    <p className="text-lg text-gray-700 mb-1">Tatenda James</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center w-fit gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Resident
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">National ID</p>
                  <p className="font-mono font-medium text-gray-900">63-2394102 F 42</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Council</p>
                  <p className="font-medium text-gray-900">City of Harare</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Ward</p>
                  <p className="font-medium text-gray-900">Ward 7 (Avondale)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Role</p>
                  <p className="font-medium text-gray-900">Ratepayer</p>
                </div>
              </div>
            </CardContent>
            <div className="bg-yellow-500 h-1 w-full" /> {/* Bottom Decoration */}
          </Card>
        </div>

        {/* Contact Details */}
        <div className="space-y-6 mb-8">
          <h3 className="font-heading font-semibold text-gray-900">Contact Details</h3>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">+263 77 123 4567</p>
                <p className="text-xs text-gray-400">Primary Mobile</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">tatenda.phiri@gmail.com</p>
                <p className="text-xs text-gray-400">Email Address</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">123 Samora Machel Avenue</p>
                <p className="text-xs text-gray-400">Residential Address</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <FileText className="text-gray-500" />
              My Reports History
            </span>
            <ChevronRight className="text-gray-400" size={16} />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <Settings className="text-gray-500" />
              Settings
            </span>
            <ChevronRight className="text-gray-400" size={16} />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-gray-50 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-[0.98] transition-transform"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-3">
              <LogOut />
              Log Out
            </span>
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Verified by Ministry of Local Govt</p>
          <p className="mt-1">TARISA ID: 8829-1102</p>
        </div>
      </div>
    </MobileLayout>
  );
}
