import { useState } from "react";
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
  Siren,
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
    location: "Samora Machel Ave",
    status: "submitted",
    priority: "High",
    date: "Today, 10:30 AM",
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
    date: "Yesterday",
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
    date: "Dec 09",
    reporter: "John D.",
    assignedTo: "ZESA - Faults",
    escalation: "L1",
    description: "Entire street is dark. Security risk."
  },
];

const chartData = [
  { name: 'Mon', reports: 12 },
  { name: 'Tue', reports: 19 },
  { name: 'Wed', reports: 15 },
  { name: 'Thu', reports: 22 },
  { name: 'Fri', reports: 28 },
  { name: 'Sat', reports: 10 },
  { name: 'Sun', reports: 8 },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<typeof INITIAL_REPORTS[0] | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const handleViewReport = (id: string) => {
    toast({
      title: "Opening Report",
      description: `Loading details for report #${id}...`,
    });
  };

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast({ title: "Total Reports", description: "Showing all 1,248 reports." })}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">1,248</h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +12% this week
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <AlertCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast({ title: "Resolved Issues", description: "Showing 854 resolved issues." })}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">854</h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +5% vs last month
              </div>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <CheckCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast({ title: "Analytics", description: "Viewing response time analytics." })}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">4.2 Days</h3>
              <div className="flex items-center mt-1 text-red-500 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +0.5 days slower
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast({ title: "Map View", description: "Focusing on Ward 7." })}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Zones</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">Ward 7</h3>
              <p className="text-xs text-gray-400 mt-1">Highest activity</p>
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
            <CardTitle className="text-lg font-heading">Report Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
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
                <span className="font-medium">Avondale West</span>
                <span className="text-red-600 font-bold">Critical</span>
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
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-gray-600" onClick={() => handleViewReport(report.id)}>
                      {report.id}
                    </td>
                    <td className="px-4 py-3">{report.category}</td>
                    <td className="px-4 py-3">{report.location}</td>
                    <td className="px-4 py-3">
                       {report.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {report.assignedTo.substring(0,2).toUpperCase()}
                              </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{report.assignedTo}</span>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary">
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
                ))}
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
