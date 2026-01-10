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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Staff, Citizen, Department, User } from "@shared/schema";
import { PERMISSIONS } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newStaffOpen, setNewStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({});
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [userForm, setUserForm] = useState<any>({});

  // Fetch Staff
  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  // Fetch Citizens
  const { data: citizens = [], isLoading: citizensLoading } = useQuery<Citizen[]>({
    queryKey: ["/api/citizens"],
  });

  // Fetch Departments for dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: async (newStaff: Partial<Staff>) => {
      const res = await apiRequest("POST", "/api/staff", newStaff);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setNewStaffOpen(false);
      setStaffForm({});
      toast({
        title: "Staff Member Added",
        description: "New staff member has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create staff member.",
        variant: "destructive",
      });
    },
  });

  // Update Staff Status Mutation
  const updateStaffStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/staff/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Status Updated",
        description: "Staff status has been updated.",
      });
    },
  });

  // Fetch System Users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async (newUser: any) => {
      const res = await apiRequest("POST", "/api/users", newUser);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setNewUserOpen(false);
      setUserForm({});
      toast({
        title: "User Created",
        description: "New system user has been successfully created.",
      });
    },
    onError: (err: any) => {
      // Extract error message from response if possible
      const msg = err.message || "Failed to create user.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  });

  // Update User Status
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Status Updated", description: "User status updated successfully." });
    }
  });

  const handleAddUser = () => {
    if (!userForm.username || !userForm.password || !userForm.role || !userForm.name) return;
    createUserMutation.mutate(userForm);
  };

  // Existing Mutations...
  // Update Citizen Status Mutation
  const updateCitizenStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/citizens/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      toast({
        title: "Status Updated",
        description: "Citizen status has been updated.",
      });
    },
  });

  const handleAddStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.role) return;
    createStaffMutation.mutate(staffForm);
  };

  const handleStatusChange = (id: number, type: 'staff' | 'citizen', newStatus: string) => {
    if (type === 'staff') {
      updateStaffStatusMutation.mutate({ id, status: newStatus });
    } else {
      updateCitizenStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const isLoading = staffLoading || citizensLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Manage staff access and view citizen registry.</p>
        </div>

        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="users">System Users</TabsTrigger>
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
                          onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@harare.city"
                          value={staffForm.email || ""}
                          onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={staffForm.role || ""}
                          onValueChange={(val) => setStaffForm({ ...staffForm, role: val })}
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
                          value={staffForm.departmentId?.toString() || ""}
                          onValueChange={(val) => setStaffForm({ ...staffForm, departmentId: parseInt(val) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewStaffOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddStaff} disabled={createStaffMutation.isPending}>
                        {createStaffMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Account
                      </Button>
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
                    {staff.map((user) => {
                      const dept = departments.find(d => d.id === user.departmentId);
                      return (
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
                              {dept?.name || "Unassigned"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>Manage application access and login credentials.</CardDescription>
                </div>
                <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus size={16} /> Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New System User</DialogTitle>
                      <DialogDescription>Add a new user who can log in to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="u-name">Full Name</Label>
                        <Input
                          id="u-name"
                          placeholder="John Doe"
                          value={userForm.name || ""}
                          onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="u-username">Username</Label>
                        <Input
                          id="u-username"
                          placeholder="jdoe"
                          value={userForm.username || ""}
                          onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="u-password">Password</Label>
                        <Input
                          id="u-password"
                          type="password"
                          placeholder="••••••••"
                          value={userForm.password || ""}
                          onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="u-role">Role</Label>
                        <Select
                          value={userForm.role || ""}
                          onValueChange={(val) => setUserForm({ ...userForm, role: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="officer">Officer</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="u-dept">Department (Optional)</Label>
                        <Select
                          value={userForm.departmentId?.toString() || "0"}
                          onValueChange={(val) => setUserForm({ ...userForm, departmentId: val === "0" ? null : parseInt(val) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="permissions">
                          <AccordionTrigger>Custom Permissions (Advanced)</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {Object.values(PERMISSIONS).map((perm) => (
                                <div key={perm} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`perm-${perm}`}
                                    checked={(userForm.permissions || []).includes(perm)}
                                    onCheckedChange={(checked) => {
                                      const current = userForm.permissions || [];
                                      const updated = checked
                                        ? [...current, perm]
                                        : current.filter((p: string) => p !== perm);
                                      setUserForm({ ...userForm, permissions: updated });
                                    }}
                                  />
                                  <Label htmlFor={`perm-${perm}`} className="text-sm font-normal text-gray-600 cursor-pointer">
                                    {perm.replace(/_/g, ' ')}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewUserOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddUser} disabled={createUserMutation.isPending}>
                        {createUserMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Search users..." className="pl-9" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const dept = departments.find(d => d.id === user.departmentId);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-xs text-gray-500">@{user.username}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{user.role.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{dept?.name || "-"}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user.active ? 'Active' : 'Disabled'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.active ? (
                                  <DropdownMenuItem className="text-red-600" onClick={() => updateUserStatusMutation.mutate({ id: user.id, active: false })}>
                                    Disable Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="text-green-600" onClick={() => updateUserStatusMutation.mutate({ id: user.id, active: true })}>
                                    Enable Account
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                        <TableCell className="font-mono text-xs">{citizen.nid || 'N/A'}</TableCell>
                        <TableCell>{citizen.ward}</TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(citizen.createdAt).toLocaleDateString()}</TableCell>
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
