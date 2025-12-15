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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  Send,
  Camera,
  History,
  CheckCircle2,
  AlertCircle,
  Siren,
  MoreVertical,
  Phone,
  Printer,
  UserPlus,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

// --- Mock Data & Constants (Shared with Reports) ---
const DEPARTMENTS = [
  { id: "coh_water", name: "CoH - Water & Sanitation", type: "Municipal" },
  { id: "coh_roads", name: "CoH - Roads & Works", type: "Municipal" },
  { id: "coh_waste", name: "CoH - Waste Management", type: "Municipal" },
  { id: "zesa", name: "ZESA - Faults", type: "Parastatal" },
  { id: "zrp", name: "ZRP - Traffic", type: "Police" },
  { id: "mot", name: "Min. of Transport", type: "Government" },
];

const ESCALATION_LEVELS = [
  { id: "L1", name: "Level 1: Ward Team", color: "bg-blue-100 text-blue-700" },
  { id: "L2", name: "Level 2: District Office", color: "bg-purple-100 text-purple-700" },
  { id: "L3", name: "Level 3: Town House HQ", color: "bg-orange-100 text-orange-700" },
  { id: "L4", name: "Level 4: National Ministry", color: "bg-red-100 text-red-700" },
];

const MOCK_STAFF = [
  { id: "S1", name: "Eng. T. Moyo", role: "Department Head", departmentId: "coh_water" },
  { id: "S2", name: "Sgt. P. Banda", role: "Officer", departmentId: "zrp" },
  { id: "S3", name: "Mrs. C. Gumbo", role: "Dispatcher", departmentId: "zesa" },
  { id: "S4", name: "Mr. K. Ndlovu", role: "Admin", departmentId: "coh_roads" },
  { id: "S5", name: "Mr. T. Chiwenga", role: "Inspector", departmentId: "coh_waste" },
  { id: "S6", name: "Ms. R. Mutasa", role: "Official", departmentId: "mot" },
];

// Mock Data for a Single Issue
const MOCK_ISSUE = {
  id: "TAR-2025-0042",
  title: "Deep Pothole on Samora Machel",
  description: "Large pothole causing traffic backup. Dangerous for small cars. Located near the intersection with 4th Street, right lane heading east.",
  category: "Roads",
  location: "Samora Machel Ave, near 4th St",
  coordinates: "-17.8250, 31.0500",
  status: "in_progress",
  priority: "High",
  date: "2025-12-11 08:30 AM",
  reporter: {
    name: "Tatenda P.",
    phone: "+263 772 123 456",
    avatar: "TP"
  },
  assignedTo: {
    department: "CoH - Roads & Works",
    staff: "Eng. Chideme",
    avatar: "EC"
  },
  escalation: "L1",
  timeline: [
    { id: 1, type: "created", title: "Report Submitted", user: "Tatenda P.", time: "11 Dec, 08:30 AM", description: "Issue reported via mobile app" },
    { id: 2, type: "status", title: "Status Update: Verified", user: "System", time: "11 Dec, 08:35 AM", description: "AI verification confirmed road damage" },
    { id: 3, type: "assigned", title: "Assigned to Roads Dept", user: "Admin User", time: "11 Dec, 09:15 AM", description: "Ticket assigned to CoH - Roads & Works" },
    { id: 4, type: "comment", title: "Staff Comment", user: "Eng. Chideme", time: "11 Dec, 10:00 AM", description: "Team dispatched for assessment. Will require asphalt patch." },
    { id: 5, type: "status", title: "Status Update: In Progress", user: "Eng. Chideme", time: "11 Dec, 10:15 AM", description: "Work has begun on site." },
  ],
  comments: [
    { id: 1, user: "Eng. Chideme", role: "Staff", avatar: "EC", time: "10:00 AM", text: "Team dispatched for assessment. Will require asphalt patch." },
    { id: 2, user: "Admin User", role: "Admin", avatar: "AD", time: "10:05 AM", text: "Please prioritize this as it's a main arterial road." },
  ],
  photos: [
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400&h=300",
    "https://images.unsplash.com/photo-1584463673573-1767e5057129?auto=format&fit=crop&q=80&w=400&h=300"
  ]
};

export default function AdminIssueDetail() {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Assignment Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  
  const handleSendComment = () => {
    if (!comment) return;
    
    toast({
      title: "Comment Added",
      description: "Your comment has been posted to the ticket.",
    });
    setComment("");
  };

  const handleStatusChange = (newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Ticket status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleEscalate = () => {
    toast({
      title: "Escalation Triggered",
      description: `Ticket #${MOCK_ISSUE.id} has been flagged for immediate executive review.`,
      variant: "destructive",
    });
  };

  const handleConfirmAssign = () => {
    const deptName = DEPARTMENTS.find(d => d.id === selectedDept)?.name || selectedDept;
    const staffName = MOCK_STAFF.find(s => s.id === selectedStaff)?.name || "Unassigned";

    toast({
      title: "Task Reassigned",
      description: `Ticket reassigned to ${deptName} (${staffName}).`,
    });
    setAssignDialogOpen(false);
  };

  const availableStaff = useMemo(() => {
    return MOCK_STAFF.filter(staff => staff.departmentId === selectedDept);
  }, [selectedDept]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => window.history.back()}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-heading font-bold text-gray-900">{MOCK_ISSUE.id}</h2>
                <Badge variant="outline">{MOCK_ISSUE.category}</Badge>
              </div>
              <p className="text-sm text-gray-500">Last updated: {MOCK_ISSUE.timeline[MOCK_ISSUE.timeline.length-1].time}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
             <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleEscalate}>
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
                    <CardTitle className="text-xl">{MOCK_ISSUE.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin size={14} /> {MOCK_ISSUE.location}
                    </CardDescription>
                  </div>
                  <StatusBadge status={MOCK_ISSUE.status as any} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {MOCK_ISSUE.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Attached Evidence</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {MOCK_ISSUE.photos.map((photo, i) => (
                      <div key={i} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-all">
                        <img src={photo} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
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
                  {MOCK_ISSUE.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className={`absolute -left-[31px] w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                        ${event.type === 'created' ? 'bg-blue-500' :
                          event.type === 'status' ? 'bg-green-500' :
                          event.type === 'assigned' ? 'bg-purple-500' : 'bg-gray-400'}
                      `}></div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{event.title}</span>
                          <span className="text-xs text-gray-400">{event.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-gray-100">{event.user.substring(0,2)}</AvatarFallback>
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
                  {MOCK_ISSUE.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar>
                        <AvatarFallback className={comment.role === 'Admin' ? 'bg-primary text-white' : 'bg-gray-200'}>
                          {comment.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{comment.role}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">{comment.time}</span>
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
                      <Button size="sm" onClick={handleSendComment} className="gap-2">
                        <Send size={14} /> Post Comment
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
                      variant={MOCK_ISSUE.status === 'submitted' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleStatusChange('submitted')}
                      className={MOCK_ISSUE.status === 'submitted' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >Submitted</Button>
                    <Button 
                      variant={MOCK_ISSUE.status === 'in_progress' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleStatusChange('in_progress')}
                      className={MOCK_ISSUE.status === 'in_progress' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >In Progress</Button>
                    <Button 
                      variant={MOCK_ISSUE.status === 'resolved' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleStatusChange('resolved')}
                      className={MOCK_ISSUE.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >Resolved</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      MOCK_ISSUE.priority === 'Critical' ? 'bg-red-500' :
                      MOCK_ISSUE.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium">{MOCK_ISSUE.priority}</span>
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
                    <p className="text-sm font-medium text-gray-900">{MOCK_ISSUE.assignedTo.department}</p>
                    <p className="text-xs text-gray-500">Department</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {MOCK_ISSUE.assignedTo.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{MOCK_ISSUE.assignedTo.staff}</p>
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
                    <AvatarFallback>{MOCK_ISSUE.reporter.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{MOCK_ISSUE.reporter.name}</p>
                    <p className="text-xs text-gray-500">Resident</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} /> {MOCK_ISSUE.reporter.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} /> Joined Nov 2024
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
              <p className="font-medium text-sm text-gray-900">{MOCK_ISSUE.title}</p>
              <p className="text-xs text-gray-500 mt-1">Current: {MOCK_ISSUE.assignedTo.department}</p>
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
                   {DEPARTMENTS.map(dept => (
                     <SelectItem key={dept.id} value={dept.id}>
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
                     <SelectItem key={staff.id} value={staff.id}>
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
            <Button onClick={handleConfirmAssign}>Confirm Reassignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
