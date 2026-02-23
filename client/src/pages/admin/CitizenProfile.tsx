import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Citizen, Issue } from "@shared/schema";
import { format } from "date-fns";

export default function AdminCitizenProfile() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/citizen/:id");
  const { toast } = useToast();

  const citizenId = params?.id ? parseInt(params.id) : 0;

  const { data: citizen, isLoading: isLoadingCitizen } = useQuery<Citizen>({
    queryKey: [`/api/citizens/${citizenId}`],
    enabled: !!citizenId,
  });

  const { data: issues, isLoading: isLoadingIssues } = useQuery<Issue[]>({
    queryKey: [`/api/issues?citizenId=${citizenId}`],
    enabled: !!citizenId,
  });

  const handleResetPassword = () => {
    toast({
      title: "Password Reset Sent",
      description: `A password reset link has been sent to ${citizen?.email}.`,
    });
  };

  const handleSuspendAccount = () => {
    toast({
      title: "Account Suspended",
      description: "User access has been temporarily revoked.",
      variant: "destructive"
    });
  };

  if (isLoadingCitizen || isLoadingIssues) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!citizen) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
          <h2 className="text-xl font-bold">Citizen Not Found</h2>
          <Button onClick={() => setLocation("/admin/citizens")}>Go Back</Button>
        </div>
      </AdminLayout>
    );
  }

  // Derive simple activity log from issues and account creation
  const activities = [
    { id: 'joined', action: "Account Created", date: citizen.createdAt ? format(new Date(citizen.createdAt), "dd MMM yyyy, HH:mm") : 'N/A' },
    ...(issues || []).map(issue => ({
      id: `issue-${issue.id}`,
      action: `Reported Issue: ${issue.title}`,
      date: format(new Date(issue.createdAt), "dd MMM yyyy, HH:mm")
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

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
                    {citizen.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-900">{citizen.name || 'Unnamed Citizen'}</h3>
                <p className="text-sm text-gray-500 mb-4">Resident • {citizen.address ? 'Harare' : 'Unknown Location'}</p>

                <div className="flex items-center gap-2 mb-6">
                  <Badge variant={citizen.emailVerified ? 'default' : 'secondary'} className={citizen.emailVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {citizen.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>

                <div className="w-full space-y-4 text-left">
                  <Separator />
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{citizen.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span>{citizen.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{citizen.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="font-mono">{citizen.nid || 'No NID'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Joined {citizen.createdAt ? format(new Date(citizen.createdAt), "dd MMM yyyy") : 'Unknown'}</span>
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
                <div className={`flex items-center justify-between p-4 border rounded-lg ${citizen.emailVerified ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${citizen.emailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <Mail size={20} className={citizen.emailVerified ? "text-green-600" : "text-yellow-600"} />
                    </div>
                    <div>
                      <p className={`font-medium ${citizen.emailVerified ? 'text-green-900' : 'text-yellow-900'}`}>{citizen.emailVerified ? 'Email Verified' : 'Email Unverified'}</p>
                      <p className={`text-sm ${citizen.emailVerified ? 'text-green-700' : 'text-yellow-700'}`}>
                        {citizen.emailVerified ? `Verified via email link on ${citizen.verifiedAt ? format(new Date(citizen.verifiedAt), "dd MMM yyyy") : 'N/A'}` : 'User has not verified their email yet'}
                      </p>
                    </div>
                  </div>
                  {citizen.emailVerified && <CheckCircle2 size={24} className="text-green-600" />}
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
                  {issues && issues.length > 0 ? (
                    issues.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation(`/admin/reports/${report.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600`}>
                            <AlertTriangle size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{report.title}</p>
                            <p className="text-xs text-gray-500">#{report.id} • {format(new Date(report.createdAt), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {report.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic">No issues reported yet.</div>
                  )}
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
                  {activities.map((item) => (
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
