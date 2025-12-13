import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Trash2, 
  Plus, 
  Edit2, 
  ShieldAlert, 
  Save,
  Siren,
  Users,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
type AuthorityType = "Municipal" | "Parastatal" | "Police" | "Government";

type Department = {
  id: string;
  name: string;
  type: AuthorityType;
  contact: string;
  head: string;
};

type EscalationLevel = {
  id: string;
  name: string;
  description: string;
  sla: string; // Service Level Agreement time
  color: string;
  authorityType: AuthorityType; // Linked to Authority Type
};

type IssueType = {
  id: string;
  name: string;
  category: string;
  defaultPriority: "Low" | "Medium" | "High" | "Critical";
  sla: string;
};

// Mock Data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: "1", name: "CoH - Water & Sanitation", type: "Municipal", contact: "+263 772 111 222", head: "Eng. Moyo" },
  { id: "2", name: "CoH - Roads & Works", type: "Municipal", contact: "+263 772 333 444", head: "Eng. Chideme" },
  { id: "3", name: "ZESA - Faults", type: "Parastatal", contact: "+263 712 555 666", head: "Mr. Gwasira" },
  { id: "4", name: "ZRP - Traffic", type: "Police", contact: "+263 773 888 999", head: "Insp. Banda" },
];

const INITIAL_LEVELS: EscalationLevel[] = [
  // Municipal Levels
  { id: "M1", name: "Level 1: Ward Team", description: "Initial response team at ward level", sla: "24 Hours", color: "blue", authorityType: "Municipal" },
  { id: "M2", name: "Level 2: District Office", description: "District management intervention", sla: "48 Hours", color: "purple", authorityType: "Municipal" },
  { id: "M3", name: "Level 3: Town House HQ", description: "Central city directorate attention", sla: "72 Hours", color: "orange", authorityType: "Municipal" },
  { id: "M4", name: "Level 4: National Ministry", description: "Ministerial/Government oversight", sla: "1 Week", color: "red", authorityType: "Municipal" },

  // Parastatal Levels (ZESA)
  { id: "P1", name: "Level 1: Local Depot", description: "Faults team at local depot", sla: "6 Hours", color: "blue", authorityType: "Parastatal" },
  { id: "P2", name: "Level 2: Area Manager", description: "Area manager escalation", sla: "24 Hours", color: "purple", authorityType: "Parastatal" },
  { id: "P3", name: "Level 3: Regional Manager", description: "Regional infrastructure issue", sla: "48 Hours", color: "orange", authorityType: "Parastatal" },
  { id: "P4", name: "Level 4: National Control", description: "National grid control center", sla: "Immediate", color: "red", authorityType: "Parastatal" },

  // Police Levels (ZRP)
  { id: "Z1", name: "Level 1: Charge Office", description: "Report received at station", sla: "Immediate", color: "blue", authorityType: "Police" },
  { id: "Z2", name: "Level 2: Officer in Charge", description: "Station Commander review", sla: "12 Hours", color: "purple", authorityType: "Police" },
  { id: "Z3", name: "Level 3: District Command", description: "District HQ escalation", sla: "24 Hours", color: "orange", authorityType: "Police" },
  { id: "Z4", name: "Level 4: PGHQ", description: "Police General Headquarters", sla: "48 Hours", color: "red", authorityType: "Police" },
];

const INITIAL_ISSUE_TYPES: IssueType[] = [
  { id: "IT1", name: "Pothole Repair", category: "Roads", defaultPriority: "High", sla: "48 Hours" },
  { id: "IT2", name: "Burst Water Pipe", category: "Water", defaultPriority: "Critical", sla: "4 Hours" },
  { id: "IT3", name: "Illegal Dumping", category: "Waste", defaultPriority: "Medium", sla: "72 Hours" },
  { id: "IT4", name: "Traffic Light Fault", category: "Roads", defaultPriority: "High", sla: "24 Hours" },
  { id: "IT5", name: "Noise Complaint", category: "Police", defaultPriority: "Low", sla: "6 Hours" },
];

export default function AdminSettings() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>(INITIAL_LEVELS);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>(INITIAL_ISSUE_TYPES);
  const [selectedAuthorityType, setSelectedAuthorityType] = useState<AuthorityType>("Municipal");
  const { toast } = useToast();

  const [newDeptOpen, setNewDeptOpen] = useState(false);
  const [deptForm, setDeptForm] = useState<Partial<Department>>({});

  const [newLevelOpen, setNewLevelOpen] = useState(false);
  const [levelForm, setLevelForm] = useState<Partial<EscalationLevel>>({});

  const [newIssueTypeOpen, setNewIssueTypeOpen] = useState(false);
  const [issueTypeForm, setIssueTypeForm] = useState<Partial<IssueType>>({});

  const filteredLevels = useMemo(() => {
    return escalationLevels.filter(level => level.authorityType === selectedAuthorityType);
  }, [escalationLevels, selectedAuthorityType]);

  const handleAddEscalationLevel = () => {
    if (!levelForm.name || !levelForm.description || !levelForm.sla) return;

    const newLevel: EscalationLevel = {
      id: Math.random().toString(36).substr(2, 9),
      name: levelForm.name,
      description: levelForm.description,
      sla: levelForm.sla,
      color: levelForm.color || "blue",
      authorityType: selectedAuthorityType,
    };

    setEscalationLevels([...escalationLevels, newLevel]);
    setNewLevelOpen(false);
    setLevelForm({});
    
    toast({
      title: "Escalation Level Added",
      description: `${newLevel.name} has been added to ${selectedAuthorityType} levels.`,
    });
  };

  const handleAddIssueType = () => {
    if (!issueTypeForm.name || !issueTypeForm.category) return;

    const newType: IssueType = {
      id: Math.random().toString(36).substr(2, 9),
      name: issueTypeForm.name,
      category: issueTypeForm.category,
      defaultPriority: issueTypeForm.defaultPriority || "Medium",
      sla: issueTypeForm.sla || "48 Hours",
    };

    setIssueTypes([...issueTypes, newType]);
    setNewIssueTypeOpen(false);
    setIssueTypeForm({});

    toast({
      title: "Issue Type Added",
      description: `${newType.name} has been added to the system.`,
    });
  };

  const handleDeleteIssueType = (id: string) => {
    setIssueTypes(issueTypes.filter(t => t.id !== id));
    toast({
      title: "Issue Type Removed",
      description: "The issue type has been removed.",
      variant: "destructive",
    });
  };

  const handleAddDepartment = () => {
    if (!deptForm.name || !deptForm.type) return;

    const newDept: Department = {
      id: Math.random().toString(36).substr(2, 9),
      name: deptForm.name,
      type: deptForm.type as any,
      contact: deptForm.contact || "N/A",
      head: deptForm.head || "Vacant",
    };

    setDepartments([...departments, newDept]);
    setNewDeptOpen(false);
    setDeptForm({});
    
    toast({
      title: "Department Added",
      description: `${newDept.name} has been added to the system.`,
    });
  };

  const handleDeleteDept = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast({
      title: "Department Removed",
      description: "The department has been removed.",
      variant: "destructive",
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-500">Manage authorities, departments, and escalation matrices.</p>
        </div>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="departments">Authorities</TabsTrigger>
            <TabsTrigger value="issuetypes">Issue Types</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
          </TabsList>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Departments & Authorities</CardTitle>
                  <CardDescription>Manage the entities responsible for resolving issues.</CardDescription>
                </div>
                <Dialog open={newDeptOpen} onOpenChange={setNewDeptOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={16} /> Add Authority
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Authority</DialogTitle>
                      <DialogDescription>Add a new department or organization to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Authority Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. Min. of Transport" 
                          value={deptForm.name || ""} 
                          onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={deptForm.type || ""}
                          onValueChange={(val) => setDeptForm({...deptForm, type: val as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Municipal">Municipal</SelectItem>
                            <SelectItem value="Government">Government</SelectItem>
                            <SelectItem value="Parastatal">Parastatal</SelectItem>
                            <SelectItem value="Police">Police</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="head">Head of Department</Label>
                        <Input 
                          id="head" 
                          placeholder="e.g. Mr. S. Moyo"
                          value={deptForm.head || ""}
                          onChange={e => setDeptForm({...deptForm, head: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input 
                          id="contact" 
                          placeholder="+263..."
                          value={deptForm.contact || ""}
                          onChange={e => setDeptForm({...deptForm, contact: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewDeptOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddDepartment}>Save Authority</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Authority Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Head of Dept</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Building2 size={16} className="text-gray-500" />
                          </div>
                          {dept.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{dept.type}</Badge>
                        </TableCell>
                        <TableCell>{dept.head}</TableCell>
                        <TableCell className="font-mono text-xs">{dept.contact}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDept(dept.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issue Types Tab */}
          <TabsContent value="issuetypes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Issue Types Configuration</CardTitle>
                  <CardDescription>Define categories of issues citizens can report and their default parameters.</CardDescription>
                </div>
                <Dialog open={newIssueTypeOpen} onOpenChange={setNewIssueTypeOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus size={16} /> Add Issue Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Issue Type</DialogTitle>
                      <DialogDescription>Create a new category for citizen reports.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="issueName">Issue Name</Label>
                        <Input 
                          id="issueName" 
                          placeholder="e.g. Broken Traffic Light" 
                          value={issueTypeForm.name || ""} 
                          onChange={e => setIssueTypeForm({...issueTypeForm, name: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="issueCategory">Category</Label>
                        <Select 
                          value={issueTypeForm.category || ""}
                          onValueChange={(val) => setIssueTypeForm({...issueTypeForm, category: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Roads">Roads & Infrastructure</SelectItem>
                            <SelectItem value="Water">Water & Sanitation</SelectItem>
                            <SelectItem value="Waste">Waste Management</SelectItem>
                            <SelectItem value="Power">Power (ZESA)</SelectItem>
                            <SelectItem value="Police">Police / Safety</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="defaultPriority">Default Priority</Label>
                        <Select 
                          value={issueTypeForm.defaultPriority || ""}
                          onValueChange={(val) => setIssueTypeForm({...issueTypeForm, defaultPriority: val as any})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="issueSLA">Default SLA</Label>
                        <Input 
                          id="issueSLA" 
                          placeholder="e.g. 48 Hours" 
                          value={issueTypeForm.sla || ""} 
                          onChange={e => setIssueTypeForm({...issueTypeForm, sla: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewIssueTypeOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddIssueType}>Save Issue Type</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Default Priority</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issueTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{type.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded w-fit ${
                            type.defaultPriority === 'Critical' ? 'bg-red-100 text-red-700' :
                            type.defaultPriority === 'High' ? 'bg-orange-100 text-orange-700' :
                            type.defaultPriority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {type.defaultPriority}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{type.sla}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteIssueType(type.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escalation Tab */}
          <TabsContent value="escalation" className="mt-6">
             <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Escalation Levels</CardTitle>
                  <CardDescription>Define the hierarchy for issue escalation and SLAs based on authority type.</CardDescription>
                </div>
                <div className="w-[200px]">
                  <Select value={selectedAuthorityType} onValueChange={(val) => setSelectedAuthorityType(val as AuthorityType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Authority Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipal">Municipal</SelectItem>
                      <SelectItem value="Parastatal">Parastatal</SelectItem>
                      <SelectItem value="Police">Police</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredLevels.length > 0 ? (
                    filteredLevels.map((level, index) => (
                      <div key={level.id} className="relative pl-8 pb-6 last:pb-0 border-l-2 border-dashed border-gray-200">
                        <div className={`absolute -left-[11px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                          ${level.color === 'red' ? 'bg-red-500' : 
                            level.color === 'orange' ? 'bg-orange-500' : 
                            level.color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'}
                        `}>
                          <span className="text-[10px] font-bold text-white">{index + 1}</span>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-heading font-semibold text-gray-900 flex items-center gap-2">
                                {level.name}
                                {level.color === 'red' && <Siren size={14} className="text-red-500 animate-pulse" />}
                              </h4>
                              <p className="text-sm text-gray-500">{level.description}</p>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
                              <Clock size={12} />
                              SLA: {level.sla}
                            </Badge>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="sm" className="h-8 text-xs">Edit Rules</Button>
                             <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600">Disable</Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                      <p>No escalation levels configured for {selectedAuthorityType}.</p>
                      <Button variant="link" className="mt-2 text-primary">Configure Default Levels</Button>
                    </div>
                  )}
                  
                  <div className="pl-8 pt-2">
                    <Dialog open={newLevelOpen} onOpenChange={setNewLevelOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary">
                          <Plus size={16} className="mr-2" /> Add Level for {selectedAuthorityType}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Escalation Level</DialogTitle>
                          <DialogDescription>
                            Create a new escalation step for {selectedAuthorityType} authorities.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="levelName">Level Name</Label>
                            <Input 
                              id="levelName" 
                              placeholder="e.g. Level 5: Presidential Office" 
                              value={levelForm.name || ""} 
                              onChange={e => setLevelForm({...levelForm, name: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelDesc">Description</Label>
                            <Input 
                              id="levelDesc" 
                              placeholder="e.g. Highest level intervention" 
                              value={levelForm.description || ""} 
                              onChange={e => setLevelForm({...levelForm, description: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelSLA">SLA (Response Time)</Label>
                            <Input 
                              id="levelSLA" 
                              placeholder="e.g. 1 Week" 
                              value={levelForm.sla || ""} 
                              onChange={e => setLevelForm({...levelForm, sla: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelColor">Color Indicator</Label>
                            <Select 
                              value={levelForm.color || ""}
                              onValueChange={(val) => setLevelForm({...levelForm, color: val})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Color" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blue">Blue (Low)</SelectItem>
                                <SelectItem value="purple">Purple (Medium)</SelectItem>
                                <SelectItem value="orange">Orange (High)</SelectItem>
                                <SelectItem value="red">Red (Critical)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewLevelOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddEscalationLevel}>Add Level</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
