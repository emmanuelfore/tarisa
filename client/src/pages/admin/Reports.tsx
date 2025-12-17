import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  AlertCircle, 
  ArrowUpRight,
  Siren,
  User,
  Loader2,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Issue, Department, Staff } from "@shared/schema";

const ESCALATION_LEVELS = [
  { id: "L1", name: "Level 1: Ward Team", color: "bg-blue-100 text-blue-700" },
  { id: "L2", name: "Level 2: District Office", color: "bg-purple-100 text-purple-700" },
  { id: "L3", name: "Level 3: Town House HQ", color: "bg-orange-100 text-orange-700" },
  { id: "L4", name: "Level 4: National Ministry", color: "bg-red-100 text-red-700" },
];

export default function AdminReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Issue | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch issues
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

  // Fetch staff
  const { data: allStaff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });

  // Filter issues based on search and status
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = searchQuery === "" || 
        issue.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [issues, searchQuery, statusFilter]);

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ issueId, departmentId, staffId, escalationLevel }: { 
      issueId: number; 
      departmentId: number | null; 
      staffId: number | null;
      escalationLevel: string 
    }) => {
      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ departmentId, staffId, escalationLevel }),
      });
      if (!res.ok) throw new Error("Failed to assign issue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Task Assigned Successfully",
        description: "The issue has been assigned.",
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

  const handleAssignClick = (report: Issue) => {
    setSelectedReport(report);
    setSelectedDept(report.assignedDepartmentId?.toString() || "");
    setSelectedStaff(report.assignedStaffId?.toString() || "");
    setSelectedLevel(report.escalationLevel);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedReport) return;
    assignMutation.mutate({
      issueId: selectedReport.id,
      departmentId: selectedDept ? parseInt(selectedDept) : null,
      staffId: selectedStaff ? parseInt(selectedStaff) : null,
      escalationLevel: selectedLevel || selectedReport.escalationLevel,
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

  const availableStaff = useMemo(() => {
    if (!selectedDept) return [];
    return allStaff.filter(staff => staff.departmentId === parseInt(selectedDept));
  }, [selectedDept, allStaff]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Tracking ID", "Title", "Category", "Location", "Status", "Priority", "Escalation", "Created"];
    const rows = filteredIssues.map(issue => [
      issue.trackingId,
      issue.title,
      issue.category,
      issue.location,
      issue.status,
      issue.priority,
      issue.escalationLevel,
      issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "",
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarisa-reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredIssues.length} reports to CSV.`,
    });
  };

  if (issuesLoading) {
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900">Issue Management</h2>
            <p className="text-gray-500">Track, assign, and escalate citizen reports.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportCSV} data-testid="button-export">
              <Download size={16} />
              Export CSV
            </Button>
            <Button className="gap-2" data-testid="button-assign-teams">
              <UserPlus size={16} />
              Assign Teams
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search ID, location, or category..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Showing {filteredIssues.length} of {issues.length} issues
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[120px]">Tracking ID</TableHead>
                <TableHead>Issue Details</TableHead>
                <TableHead>Status & Priority</TableHead>
                <TableHead>Assigned Authority</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    No issues found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((report) => {
                  const dept = departments.find(d => d.id === report.assignedDepartmentId);
                  const staff = allStaff.find(s => s.id === report.assignedStaffId);
                  
                  return (
                    <TableRow key={report.id} className="hover:bg-gray-50/50" data-testid={`row-report-${report.id}`}>
                      <TableCell className="font-mono text-xs font-medium text-gray-500">
                        {report.trackingId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{report.title}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">{report.category}</Badge>
                            • {report.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={report.status as any} />
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded w-fit ${
                            report.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            report.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {dept.name.substring(0,2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                            </div>
                            {staff && (
                              <div className="flex items-center gap-1.5 ml-8">
                                 <User size={12} className="text-gray-400" />
                                 <span className="text-xs text-gray-500">{staff.name}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1.5 ${
                           ESCALATION_LEVELS.find(l => l.id === report.escalationLevel)?.color || "bg-gray-100 text-gray-600"
                        }`}>
                           {report.escalationLevel === 'L4' && <Siren size={12} />}
                           {ESCALATION_LEVELS.find(l => l.id === report.escalationLevel)?.name || "Level 1"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-menu-${report.id}`}>
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
                            <Link href={`/admin/issue/${report.id}`}>
                              <DropdownMenuItem>
                                View Full Details
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

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
                <Select value={selectedDept} onValueChange={(val) => {
                  setSelectedDept(val);
                  setSelectedStaff("");
                }}>
                  <SelectTrigger data-testid="dialog-select-department">
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
                <label className="text-sm font-medium flex items-center justify-between">
                   <span>Assign Staff Member</span>
                   <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                </label>
                <Select 
                  value={selectedStaff} 
                  onValueChange={setSelectedStaff}
                  disabled={!selectedDept || availableStaff.length === 0}
                >
                  <SelectTrigger data-testid="dialog-select-staff">
                    <SelectValue placeholder={
                      !selectedDept ? "Select a department first" :
                      availableStaff.length === 0 ? "No staff found for this department" :
                      "Select Staff Member"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                     {availableStaff.map(staff => (
                       <SelectItem key={staff.id} value={staff.id.toString()}>
                         <div className="flex items-center gap-2">
                           <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                           </Avatar>
                           <span>{staff.name}</span>
                           <span className="text-xs text-gray-400">({staff.role})</span>
                         </div>
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Escalation Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger data-testid="dialog-select-escalation">
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
            <Button onClick={handleConfirmAssign} disabled={assignMutation.isPending} data-testid="button-dialog-confirm">
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
