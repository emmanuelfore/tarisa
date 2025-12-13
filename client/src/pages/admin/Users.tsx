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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Building2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const INITIAL_STAFF = [
  { id: "S1", name: "Eng. T. Moyo", email: "tmoyo@harare.city", role: "Department Head", department: "CoH - Water", status: "Active" },
  { id: "S2", name: "Sgt. P. Banda", email: "pbanda@zrp.gov.zw", role: "Officer", department: "ZRP - Traffic", status: "Active" },
  { id: "S3", name: "Mrs. C. Gumbo", email: "cgumbo@zesa.co.zw", role: "Dispatcher", department: "ZESA - Faults", status: "On Leave" },
  { id: "S4", name: "Mr. K. Ndlovu", email: "kndlovu@harare.city", role: "Admin", department: "CoH - Roads", status: "Active" },
];

const INITIAL_CITIZENS = [
  { id: "C1", name: "Tatenda Phiri", nid: "63-2239121 P 42", ward: "Ward 7", phone: "+263 772 123 456", joined: "2024-11-15", status: "Verified" },
  { id: "C2", name: "Sarah Mutasa", nid: "08-1123445 F 23", ward: "Ward 12", phone: "+263 773 987 654", joined: "2024-12-01", status: "Verified" },
  { id: "C3", name: "John Doe", nid: "45-9988776 Q 12", ward: "Ward 3", phone: "+263 712 555 555", joined: "2024-12-10", status: "Pending" },
  { id: "C4", name: "Grace Kals", nid: "22-3344556 R 66", ward: "Ward 1", phone: "+263 774 111 222", joined: "2024-10-20", status: "Suspended" },
];

export default function AdminUsers() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS);
  const { toast } = useToast();

  const [newStaffOpen, setNewStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<any>({});

  const handleAddStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.role) return;

    const newMember = {
      id: `S${staff.length + 1}`,
      name: staffForm.name,
      email: staffForm.email,
      role: staffForm.role,
      department: staffForm.department || "Unassigned",
      status: "Active"
    };

    setStaff([...staff, newMember]);
    setNewStaffOpen(false);
    setStaffForm({});

    toast({
      title: "Staff Member Added",
      description: `${newMember.name} has been added to the system.`,
    });
  };

  const handleStatusChange = (id: string, type: 'staff' | 'citizen', newStatus: string) => {
    if (type === 'staff') {
      setStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } else {
      setCitizens(citizens.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
    toast({
      title: "Status Updated",
      description: `User status changed to ${newStatus}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Manage staff access and view citizen registry.</p>
        </div>

        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
            <TabsTrigger value="citizens">Citizens Registry</TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Department Staff</CardTitle>
                  <CardDescription>System administrators and department officials.</CardDescription>
                </div>
                <Dialog open={newStaffOpen} onOpenChange={setNewStaffOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus size={16} /> Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>Create a new account for an official.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. John Smith" 
                          value={staffForm.name || ""} 
                          onChange={e => setStaffForm({...staffForm, name: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="john@harare.city" 
                          value={staffForm.email || ""} 
                          onChange={e => setStaffForm({...staffForm, email: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={staffForm.role || ""}
                          onValueChange={(val) => setStaffForm({...staffForm, role: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Department Head">Department Head</SelectItem>
                            <SelectItem value="Officer">Officer</SelectItem>
                            <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                            <SelectItem value="Admin">System Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dept">Department</Label>
                        <Select 
                          value={staffForm.department || ""}
                          onValueChange={(val) => setStaffForm({...staffForm, department: val})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CoH - Water">CoH - Water</SelectItem>
                            <SelectItem value="CoH - Roads">CoH - Roads</SelectItem>
                            <SelectItem value="ZESA - Faults">ZESA - Faults</SelectItem>
                            <SelectItem value="ZRP - Traffic">ZRP - Traffic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewStaffOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddStaff}>Create Account</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Search staff..." className="pl-9" />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex w-fit items-center gap-1">
                            <Shield size={10} />
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 size={14} />
                            {user.department}
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                             user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                           }`}>
                             {user.status}
                           </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'Active' ? (
                                <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(user.id, 'staff', 'Suspended')}>
                                  Suspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600" onClick={() => handleStatusChange(user.id, 'staff', 'Active')}>
                                  Activate Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Citizens Tab */}
          <TabsContent value="citizens" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Registry</CardTitle>
                <CardDescription>Verified citizens registered on the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Search by Name or National ID..." className="pl-9" />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Citizen</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {citizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {citizen.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{citizen.name}</span>
                            <span className="text-xs text-gray-500">{citizen.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{citizen.nid}</TableCell>
                        <TableCell>{citizen.ward}</TableCell>
                        <TableCell className="text-sm text-gray-500">{citizen.joined}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {citizen.status === 'Verified' ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : citizen.status === 'Suspended' ? (
                              <XCircle size={14} className="text-red-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-orange-400" />
                            )}
                            <span className="text-sm">{citizen.status}</span>
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
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Verification History</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {citizen.status !== 'Suspended' ? (
                                <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(citizen.id, 'citizen', 'Suspended')}>
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600" onClick={() => handleStatusChange(citizen.id, 'citizen', 'Verified')}>
                                  Unsuspend User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
