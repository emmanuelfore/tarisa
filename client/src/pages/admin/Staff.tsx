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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  Building2,
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

export default function AdminStaff() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
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

  const handleStatusChange = (id: string, newStatus: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast({
      title: "Status Updated",
      description: `User status changed to ${newStatus}.`,
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500">Manage department officials and system administrators.</p>
        </div>

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
                            <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(user.id, 'Suspended')}>
                              Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600" onClick={() => handleStatusChange(user.id, 'Active')}>
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
      </div>
    </AdminLayout>
  );
}
