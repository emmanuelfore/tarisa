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

export default function AdminSettings() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>(INITIAL_LEVELS);
  const [selectedAuthorityType, setSelectedAuthorityType] = useState<AuthorityType>("Municipal");
  const { toast } = useToast();

  const [newDeptOpen, setNewDeptOpen] = useState(false);
  const [deptForm, setDeptForm] = useState<Partial<Department>>({});

  const filteredLevels = useMemo(() => {
    return escalationLevels.filter(level => level.authorityType === selectedAuthorityType);
  }, [escalationLevels, selectedAuthorityType]);

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
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="departments">Authorities</TabsTrigger>
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
                    <Button variant="outline" className="w-full border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary">
                      <Plus size={16} className="mr-2" /> Add Level for {selectedAuthorityType}
                    </Button>
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
