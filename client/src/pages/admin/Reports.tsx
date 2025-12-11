import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Building2,
  Phone,
  Siren
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock Data - Zimbabwean Context
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

const INITIAL_REPORTS = [
  {
    id: "TAR-2025-0042",
    title: "Deep Pothole on Samora Machel",
    category: "Roads",
    location: "Samora Machel Ave, near 4th St",
    status: "submitted",
    priority: "High",
    date: "2025-12-11",
    reporter: "Tatenda P.",
    assignedTo: null,
    escalation: "L1",
    description: "Large pothole causing traffic backup. Dangerous for small cars."
  },
  {
    id: "TAR-2025-0041",
    title: "Burst Pipe - Water Loss",
    category: "Water",
    location: "45 Borrowdale Rd",
    status: "in_progress",
    priority: "Critical",
    date: "2025-12-10",
    reporter: "Sarah M.",
    assignedTo: "CoH - Water & Sanitation",
    escalation: "L2",
    description: "Main water line burst. Water flowing into the street for 4 hours."
  },
  {
    id: "TAR-2025-0038",
    title: "Street Lights Out",
    category: "Lights",
    location: "Westgate Area",
    status: "resolved",
    priority: "Medium",
    date: "2025-12-09",
    reporter: "John D.",
    assignedTo: "ZESA - Faults",
    escalation: "L1",
    description: "Entire street is dark. Security risk."
  },
  {
    id: "TAR-2025-0035",
    title: "Uncollected Refuse",
    category: "Waste",
    location: "Mbare Musika",
    status: "verified",
    priority: "High",
    date: "2025-12-09",
    reporter: "Grace K.",
    assignedTo: null,
    escalation: "L1",
    description: "Garbage has not been collected for 2 weeks. Health hazard."
  },
  {
    id: "TAR-2025-0032",
    title: "Traffic Light Malfunction",
    category: "Roads",
    location: "Julius Nyerere / Jason Moyo",
    status: "submitted",
    priority: "Critical",
    date: "2025-12-08",
    reporter: "Blessing T.",
    assignedTo: null,
    escalation: "L1",
    description: "Traffic lights stuck on red for all directions."
  },
];

export default function AdminReports() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<typeof INITIAL_REPORTS[0] | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const { toast } = useToast();

  const handleAssignClick = (report: typeof INITIAL_REPORTS[0]) => {
    setSelectedReport(report);
    setSelectedDept(report.assignedTo || "");
    setSelectedLevel(report.escalation);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!selectedReport) return;

    const deptName = DEPARTMENTS.find(d => d.id === selectedDept)?.name || selectedDept;

    setReports(reports.map(r => 
      r.id === selectedReport.id 
        ? { ...r, assignedTo: deptName, escalation: selectedLevel, status: 'in_progress' } 
        : r
    ));

    toast({
      title: "Task Assigned Successfully",
      description: `Report #${selectedReport.id} assigned to ${deptName} at ${ESCALATION_LEVELS.find(l => l.id === selectedLevel)?.name}.`,
    });
    setAssignDialogOpen(false);
  };

  const handleEscalate = (report: typeof INITIAL_REPORTS[0]) => {
     toast({
      title: "Escalation Triggered",
      description: `Report #${report.id} has been flagged for Director attention.`,
      variant: "destructive",
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900">Issue Management</h2>
            <p className="text-gray-500">Track, assign, and escalate citizen reports.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <ArrowUpRight size={16} />
              Export Sheet
            </Button>
            <Button className="gap-2">
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
                <Input placeholder="Search ID, location, or category..." className="pl-10" />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Filter Status
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Showing 5 of 1,248 active issues</span>
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
              {reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs font-medium text-gray-500">
                    {report.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{report.title}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{report.category}</Badge>
                        • {report.location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <StatusBadge status={report.status as any} />
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded w-fit ${
                        report.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        report.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {report.priority} Priority
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                             {report.assignedTo.substring(0,2).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700">{report.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`text-xs font-medium px-2 py-1 rounded inline-flex items-center gap-1.5 ${
                       ESCALATION_LEVELS.find(l => l.id === report.escalation)?.color || "bg-gray-100 text-gray-600"
                    }`}>
                       {report.escalation === 'L4' && <Siren size={12} />}
                       {ESCALATION_LEVELS.find(l => l.id === report.escalation)?.name || "Level 1"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        <DropdownMenuItem>View Full Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
                <Select value={selectedDept} onValueChange={setSelectedDept}>
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
                <p className="text-[10px] text-gray-500">
                  Level 1 is for local ward teams. Level 3+ notifies city management.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAssign}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
