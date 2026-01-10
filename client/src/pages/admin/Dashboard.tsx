import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  MoreHorizontal,
  UserPlus,
  Loader2,
} from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Issue, Department } from "@shared/schema";

const ESCALATION_LEVELS = [
  { id: "L1", name: "Level 1: Ward Team", color: "bg-blue-100 text-blue-700" },
  { id: "L2", name: "Level 2: District Office", color: "bg-purple-100 text-purple-700" },
  { id: "L3", name: "Level 3: Town House HQ", color: "bg-orange-100 text-orange-700" },
  { id: "L4", name: "Level 4: National Ministry", color: "bg-red-100 text-red-700" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Issue | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Fetch recent issues
  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
    queryFn: async () => {
      const res = await fetch("/api/issues", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json();
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ issueId, departmentId, escalationLevel }: { issueId: number; departmentId: number; escalationLevel: string }) => {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ departmentId, escalationLevel }),
      });
      if (!res.ok) throw new Error("Failed to assign issue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Task Assigned Successfully",
        description: `Report assigned to department.`,
      });
      setAssignDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Assignment Failed",
        description: "Could not assign the issue. Please try again.",
        variant: "destructive",
      });
    },
  });

  // useLocation hook from wouter for navigation
  const [, setLocation] = useLocation();

  const handleViewReport = (id: number) => {
    setLocation(`/admin/reports/${id}`);
  };

  const handleAssignClick = (report: Issue) => {
    setSelectedReport(report);
    setSelectedDept(report.assignedDepartmentId?.toString() || "");
    setSelectedLevel(report.escalationLevel);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedReport || !selectedDept) return;
    assignMutation.mutate({
      issueId: selectedReport.id,
      departmentId: parseInt(selectedDept),
      escalationLevel: selectedLevel,
    });
  };

  const handleEscalate = async (report: Issue) => {
    try {
      const res = await fetch(`/api/issues/${report.id}/escalate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to escalate");
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Escalation Triggered",
        description: `Report #${report.trackingId} has been escalated.`,
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Escalation Failed",
        description: "Could not escalate the issue.",
        variant: "destructive",
      });
    }
  };

  // Build chart data from analytics
  const chartData = analytics?.categoryCounts
    ? Object.entries(analytics.categoryCounts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      reports: count as number,
    }))
    : [];

  const recentIssues = issues.slice(0, 5);
  const isLoading = analyticsLoading || issuesLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-total-reports" className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1" data-testid="text-total-reports">
                {analytics?.totalIssues || 0}
              </h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                Active tracking
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <AlertCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-resolved" className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1" data-testid="text-resolved-count">
                {analytics?.resolvedIssues || 0}
              </h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                Successfully closed
              </div>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <CheckCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending" className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1" data-testid="text-pending-count">
                {analytics?.pendingIssues || 0}
              </h3>
              <div className="flex items-center mt-1 text-orange-500 text-xs font-medium">
                <Clock size={14} className="mr-1" />
                Awaiting action
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-categories" className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">
                {Object.keys(analytics?.categoryCounts || {}).length}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Issue types tracked</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <MapPin size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Reports by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Heat Map Mini */}
        <Card className="overflow-hidden cursor-pointer group" onClick={() => toast({ title: "Live Map", description: "Opening fullscreen map..." })}>
          <CardHeader>
            <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">Hotspots</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative h-[300px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${mapBg})` }}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

            {/* Heat Points */}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500/30 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-orange-500/30 rounded-full blur-xl" />

            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">City of Harare</span>
                <span className="text-primary font-bold">{analytics?.totalIssues || 0} reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Tracking ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  recentIssues.map((report) => {
                    const dept = departments.find(d => d.id === report.assignedDepartmentId);
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 cursor-pointer" data-testid={`row-issue-${report.id}`}>
                        <td className="px-4 py-3 font-mono text-gray-600" onClick={() => handleViewReport(report.id)}>
                          {report.trackingId}
                        </td>
                        <td className="px-4 py-3 capitalize">{report.category}</td>
                        <td className="px-4 py-3">{report.location}</td>
                        <td className="px-4 py-3">
                          {dept ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {dept.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{dept.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={report.status as any} />
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" data-testid={`button-actions-${report.id}`}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Manage Issue</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAssignClick(report)}>
                                <UserPlus size={14} className="mr-2" /> Assign Team
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEscalate(report)}>
                                <AlertCircle size={14} className="mr-2" /> Escalate Issue
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewReport(report.id)}>View Full Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Authority</DialogTitle>
            <DialogDescription>
              Select the responsible department and escalation level for this issue.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
                <p className="font-medium text-sm text-gray-900">{selectedReport.title}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedReport.description}</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Department / Authority</label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{dept.name}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">{dept.type}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Escalation Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger data-testid="select-escalation">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESCALATION_LEVELS.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${level.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                          <span>{level.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-gray-500">
                  Level 1 is for local ward teams. Level 3+ notifies city management.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAssign} disabled={assignMutation.isPending} data-testid="button-confirm-assign">
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
