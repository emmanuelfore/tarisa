import { useState, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  Send,
  Camera,
  History,
  Phone,
  Printer,
  UserPlus,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Issue, Department, Staff, Comment, Timeline } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const ESCALATION_LEVELS = [
  { id: "L1", name: "Level 1: Ward Team", color: "bg-blue-100 text-blue-700" },
  { id: "L2", name: "Level 2: District Office", color: "bg-purple-100 text-purple-700" },
  { id: "L3", name: "Level 3: Town House HQ", color: "bg-orange-100 text-orange-700" },
  { id: "L4", name: "Level 4: National Ministry", color: "bg-red-100 text-red-700" },
];

export default function AdminIssueDetail() {
  const [, params] = useRoute("/admin/reports/:id");
  const issueId = params?.id ? parseInt(params.id) : 0;

  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Assignment Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  // Queries
  const { data: issue, isLoading: isLoadingIssue } = useQuery<Issue>({
    queryKey: [`/api/issues/${issueId}`],
    enabled: !!issueId,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: staffList = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/issues/${issueId}/comments`],
    enabled: !!issueId,
  });

  const { data: timeline = [] } = useQuery<Timeline[]>({
    queryKey: [`/api/issues/${issueId}/timeline`],
    enabled: !!issueId,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PATCH", `/api/issues/${issueId}`, { status: newStatus });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/timeline`] });
      toast({ title: "Status Updated", description: "The issue status has been updated." });
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", `/api/issues/${issueId}/comments`, {
        text,
        userId: 1, // Mock admin user ID for now, should be from auth context
        userType: "admin",
        userName: "Admin"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/timeline`] });
      setComment("");
      toast({ title: "Comment Added", description: "Your comment has been posted." });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/issues/${issueId}/assign`, {
        departmentId: parseInt(selectedDept) || null,
        staffId: parseInt(selectedStaff) || null,
        escalationLevel: selectedLevel || "L1",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${issueId}/timeline`] });
      setAssignDialogOpen(false);
      toast({ title: "Issue Assigned", description: "The issue has been reassigned successfully." });
    },
  });

  const availableStaff = useMemo(() => {
    return staffList.filter(s => s.departmentId === (parseInt(selectedDept) || 0));
  }, [selectedDept, staffList]);

  if (isLoadingIssue) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!issue) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <h2 className="text-2xl font-bold text-gray-900">Issue Not Found</h2>
          <Button className="mt-4" onClick={() => setLocation("/admin/reports")}>
            Back to Reports
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const assignedDept = departments.find(d => d.id === issue.assignedDepartmentId);
  const assignedStaffMember = staffList.find(s => s.id === issue.assignedStaffId);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setLocation("/admin/reports")}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-heading font-bold text-gray-900">{issue.trackingId}</h2>
                <Badge variant="outline">{issue.category}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                Created on {format(new Date(issue.createdAt), "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => {
              // Pre-fill dialog for escalation
              setAssignDialogOpen(true);
            }}>
              <ArrowUpRight size={16} /> Escalate
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setAssignDialogOpen(true)}>
              <UserPlus size={16} /> Reassign
            </Button>
            <Button variant="outline" className="gap-2">
              <Printer size={16} /> Print
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Phone size={16} /> Call Reporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{issue.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin size={14} /> {issue.location}
                    </CardDescription>
                  </div>
                  <StatusBadge status={issue.status as any} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {issue.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Attached Evidence</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issue.photos && issue.photos.map((photo, i) => (
                      <div key={i} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-all">
                        <img src={photo} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                    <div className="flex flex-col items-center justify-center aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer transition-all">
                      <Camera size={24} className="mb-2" />
                      <span className="text-xs font-medium">Add Photo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History size={20} className="text-gray-500" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-8 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className={`absolute -left-[31px] w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                        ${event.type === 'created' ? 'bg-blue-500' :
                          event.type === 'status' ? 'bg-green-500' :
                            event.type === 'assigned' ? 'bg-purple-500' : 'bg-gray-400'}
                      `}></div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{event.title}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(event.createdAt), "dd MMM, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-gray-100">
                              {event.user.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">by {event.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-gray-500" />
                  Discussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback className={comment.userType === 'admin' ? 'bg-primary text-white' : 'bg-gray-200'}>
                          {comment.userName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{comment.userType}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), "dd MMM, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-br-xl rounded-bl-xl rounded-tr-xl">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Add an internal note or reply..."
                      className="min-h-[100px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <Paperclip size={16} className="mr-2" /> Attach File
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => postCommentMutation.mutate(comment)}
                        className="gap-2"
                        disabled={postCommentMutation.isPending || !comment.trim()}
                      >
                        {postCommentMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Status & Priority Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Status</label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={issue.status === 'submitted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatusMutation.mutate('submitted')}
                      disabled={updateStatusMutation.isPending}
                      className={issue.status === 'submitted' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >Submitted</Button>
                    <Button
                      variant={issue.status === 'in_progress' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatusMutation.mutate('in_progress')}
                      disabled={updateStatusMutation.isPending}
                      className={issue.status === 'in_progress' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >In Progress</Button>
                    <Button
                      variant={issue.status === 'resolved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatusMutation.mutate('resolved')}
                      disabled={updateStatusMutation.isPending}
                      className={issue.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >Resolved</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${issue.priority === 'Critical' ? 'bg-red-500' :
                      issue.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                    <span className="font-medium capitalize">{issue.priority}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assignedDept?.name || "Unassigned"}</p>
                    <p className="text-xs text-gray-500">Department</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {assignedStaffMember ? assignedStaffMember.name.substring(0, 2) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assignedStaffMember?.name || "Unassigned"}</p>
                    <p className="text-xs text-gray-500">Lead Staff</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs" onClick={() => setAssignDialogOpen(true)}>Reassign Ticket</Button>
              </CardContent>
            </Card>

            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reporter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Citizen ID: {issue.citizenId}</p>
                    <p className="text-xs text-gray-500">Resident</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} /> Reported: {format(new Date(issue.createdAt), "dd MMM yyyy")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reassign Ticket</DialogTitle>
            <DialogDescription>
              Transfer responsibility to another department or escalate authority level.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
              <p className="font-medium text-sm text-gray-900">{issue.title}</p>
              <p className="text-xs text-gray-500 mt-1">Current: {assignedDept?.name || "Unassigned"}</p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Department / Authority</label>
              <Select value={selectedDept} onValueChange={(val) => {
                setSelectedDept(val);
                setSelectedStaff(""); // Reset staff when dept changes
              }}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>
              {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
