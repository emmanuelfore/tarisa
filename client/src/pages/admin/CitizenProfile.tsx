import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone,
  ShieldCheck,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Mock Data for a Single Citizen Profile
const MOCK_PROFILE = {
  id: "C1",
  name: "Tatenda Phiri",
  nid: "63-2239121 P 42",
  email: "tatenda.phiri@example.com",
  phone: "+263 772 123 456",
  address: "12 Samora Machel Ave, Harare",
  ward: "Ward 7",
  joined: "15 Nov 2024",
  status: "Verified",
  emailVerified: true,
  verificationDate: "15 Nov 2024",
  reports: [
    { id: "TAR-2025-0042", title: "Deep Pothole on Samora Machel", date: "11 Dec 2025", status: "In Progress", type: "Roads" },
    { id: "TAR-2025-0015", title: "Uncollected Refuse", date: "28 Nov 2025", status: "Resolved", type: "Waste" },
  ],
  activity: [
    { id: 1, action: "Logged in", date: "Today, 09:30 AM" },
    { id: 2, action: "Submitted Report #TAR-2025-0042", date: "11 Dec 2025, 08:30 AM" },
    { id: 3, action: "Email Verified", date: "15 Nov 2024, 10:15 AM" },
    { id: 4, action: "Account Created", date: "15 Nov 2024, 10:00 AM" },
  ]
};

export default function AdminCitizenProfile() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleResetPassword = () => {
    toast({
      title: "Password Reset Sent",
      description: `A password reset link has been sent to ${MOCK_PROFILE.email}.`,
    });
  };

  const handleSuspendAccount = () => {
    toast({
      title: "Account Suspended",
      description: "User access has been temporarily revoked.",
      variant: "destructive"
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setLocation("/admin/citizens")}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900">Citizen Profile</h2>
            <p className="text-sm text-gray-500">Manage user details and view activity history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {MOCK_PROFILE.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-900">{MOCK_PROFILE.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Resident • {MOCK_PROFILE.ward}</p>
                
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant={MOCK_PROFILE.status === 'Verified' ? 'default' : 'secondary'} className={MOCK_PROFILE.status === 'Verified' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {MOCK_PROFILE.status}
                  </Badge>
                  {MOCK_PROFILE.emailVerified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                      Email Verified
                    </Badge>
                  )}
                </div>

                <div className="w-full space-y-4 text-left">
                  <Separator />
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{MOCK_PROFILE.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span>{MOCK_PROFILE.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{MOCK_PROFILE.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="font-mono">{MOCK_PROFILE.nid}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Joined {MOCK_PROFILE.joined}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleResetPassword}>
                  <ShieldCheck size={16} className="mr-2" /> Reset Password
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSuspendAccount}>
                  <AlertTriangle size={16} className="mr-2" /> Suspend Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
             {/* Verification Status */}
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Email Verified</p>
                      <p className="text-sm text-green-700">Verified via email link on {MOCK_PROFILE.verificationDate}</p>
                    </div>
                  </div>
                  <CheckCircle2 size={24} className="text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Reported Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  Report History
                </CardTitle>
                <CardDescription>Issues reported by this citizen.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_PROFILE.reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center
                          ${report.type === 'Roads' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
                        `}>
                          <AlertTriangle size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{report.title}</p>
                          <p className="text-xs text-gray-500">{report.id} • {report.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        report.status === 'Resolved' ? 'text-green-600 bg-green-50 border-green-200' : 'text-orange-600 bg-orange-50 border-orange-200'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History size={20} className="text-gray-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="relative pl-6 space-y-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {MOCK_PROFILE.activity.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
