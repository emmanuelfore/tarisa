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

import { useQuery } from "@tanstack/react-query";

// Mock Data for Escalation Levels (Mental Model)
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
  // Real Data for Counts
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments']
  });

  const { data: issueTypes = [] } = useQuery<any[]>({
    queryKey: ['/api/categories']
  });

  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>(INITIAL_LEVELS);
  const [selectedAuthorityType, setSelectedAuthorityType] = useState<AuthorityType>("Municipal");
  const { toast } = useToast();

  const [newLevelOpen, setNewLevelOpen] = useState(false);
  const [levelForm, setLevelForm] = useState<Partial<EscalationLevel>>({});

  const filteredLevels = useMemo(() => {
    return escalationLevels.filter(level => level.authorityType === selectedAuthorityType);
  }, [escalationLevels, selectedAuthorityType]);

  const handleAddEscalationLevel = () => {
    if (!levelForm.name || !levelForm.description || !levelForm.sla) return;

    const newLevel: EscalationLevel = {
      id: Math.random().toString(36).substr(2, 9),
      name: levelForm.name!,
      description: levelForm.description!,
      sla: levelForm.sla!,
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-500">Manage authorities, departments, and escalation matrices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/departments'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authorities & Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">Manage municipal and partner entities</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/categories'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issue Categories</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issueTypes.length}</div>
              <p className="text-xs text-muted-foreground">Configure report types and SLAs</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="escalation" className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:w-[400px]">
            <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
          </TabsList>

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
                              onChange={e => setLevelForm({ ...levelForm, name: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelDesc">Description</Label>
                            <Input
                              id="levelDesc"
                              placeholder="e.g. Highest level intervention"
                              value={levelForm.description || ""}
                              onChange={e => setLevelForm({ ...levelForm, description: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelSLA">SLA (Response Time)</Label>
                            <Input
                              id="levelSLA"
                              placeholder="e.g. 1 Week"
                              value={levelForm.sla || ""}
                              onChange={e => setLevelForm({ ...levelForm, sla: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="levelColor">Color Indicator</Label>
                            <Select
                              value={levelForm.color || ""}
                              onValueChange={(val) => setLevelForm({ ...levelForm, color: val })}
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
