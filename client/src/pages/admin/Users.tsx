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
import type { Citizen, Department, User, Role } from "@shared/schema";
import { PERMISSIONS, PERMISSION_INFO, PERMISSION_CATEGORIES } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Fetch Roles

  const [newUserOpen, setNewUserOpen] = useState(false);
  const [userForm, setUserForm] = useState<any>({});

  // Fetch Roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  // Create Role Mutation
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<Partial<Role>>({ permissions: [] });

  const createRoleMutation = useMutation({
    mutationFn: async (newRole: Partial<Role>) => {
      const res = await apiRequest("POST", "/api/roles", newRole);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setNewRoleOpen(false);
      setRoleForm({ permissions: [] });
      toast({ title: "Role Created", description: "New role created successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create role.", variant: "destructive" });
    }
  });

  const handleCreateRole = () => {
    if (!roleForm.name || !roleForm.slug) return;
    createRoleMutation.mutate(roleForm);
  };

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Partial<Role> }) => {
      const res = await apiRequest("PATCH", `/api/roles/${slug}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setEditRoleOpen(false);
      setSelectedRole(null);
      setRoleForm({ permissions: [] });
      toast({
        title: "Role Updated",
        description: "Role permissions have been successfully updated.",
      });
    },
  });

  const handleUpdateRole = () => {
    if (!selectedRole || !roleForm.permissions) return;
    updateRoleMutation.mutate({
      slug: selectedRole.slug,
      data: { permissions: roleForm.permissions, description: roleForm.description }
    });
  };

  // Delete Role Mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/roles/${id}`);
      if (res.status === 204) return;
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setDeleteRoleDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role Deleted",
        description: "Custom role has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete role.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    deleteRoleMutation.mutate(selectedRole.id);
  };

  // Fetch Departments for dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
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



  const isLoading = rolesLoading;

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
          <p className="text-gray-500">Manage staff access and system users.</p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users">Team Directory</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>




          {/* Roles Tab */}
          < TabsContent value="roles" className="mt-6" >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Role Definitions</CardTitle>
                  <CardDescription>Manage dynamic roles and permissions.</CardDescription>
                </div>
                <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Shield size={16} /> Create Role</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Custom Role</DialogTitle>
                      <DialogDescription>Define a new role and its permissions.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Role Name</Label>
                        <Input
                          placeholder="e.g. Senior Inspector"
                          value={roleForm.name || ""}
                          onChange={e => {
                            const name = e.target.value;
                            const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                            setRoleForm({ ...roleForm, name, slug });
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Slug (System ID)</Label>
                        <Input
                          value={roleForm.slug || ""}
                          onChange={e => setRoleForm({ ...roleForm, slug: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="What is this role for?"
                          value={roleForm.description || ""}
                          onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                        />
                      </div>

                      <div className="border rounded-md p-4">
                        <Label className="mb-2 block">Permissions</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.values(PERMISSIONS).map((perm) => (
                            <div key={perm} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-perm-${perm}`}
                                checked={(roleForm.permissions as string[] || []).includes(perm)}
                                onCheckedChange={(checked) => {
                                  const current = roleForm.permissions as string[] || [];
                                  const updated = checked
                                    ? [...current, perm]
                                    : current.filter(p => p !== perm);
                                  setRoleForm({ ...roleForm, permissions: updated });
                                }}
                              />
                              <Label htmlFor={`role-perm-${perm}`} className="cursor-pointer font-normal text-sm">
                                {perm.replace(/_/g, ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateRole}>Save Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit Role Dialog */}
                <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedRole?.isSystem ? 'View Role Permissions' : 'Edit Role Permissions'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedRole?.isSystem
                          ? 'System roles cannot be modified. View permissions only.'
                          : 'Modify permissions for this custom role.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Role Name</Label>
                        <Input
                          value={selectedRole?.name || ""}
                          disabled
                        />
                      </div>
                      {!selectedRole?.isSystem && (
                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="What is this role for?"
                            value={roleForm.description || ""}
                            onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="border rounded-md p-4">
                        <Label className="mb-2 block">Permissions</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.values(PERMISSIONS).map((perm) => (
                            <div key={perm} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-perm-${perm}`}
                                checked={(roleForm.permissions as string[] || []).includes(perm)}
                                disabled={selectedRole?.isSystem}
                                onCheckedChange={(checked) => {
                                  if (selectedRole?.isSystem) return;
                                  const current = roleForm.permissions as string[] || [];
                                  const updated = checked
                                    ? [...current, perm]
                                    : current.filter(p => p !== perm);
                                  setRoleForm({ ...roleForm, permissions: updated });
                                }}
                              />
                              <Label
                                htmlFor={`edit-perm-${perm}`}
                                className={`cursor-pointer font-normal text-sm ${selectedRole?.isSystem ? 'text-gray-500' : ''}`}
                              >
                                {PERMISSION_INFO[perm as keyof typeof PERMISSION_INFO]?.name || perm.replace(/_/g, ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {!selectedRole?.isSystem && (
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditRoleOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateRole}>Update Role</Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Delete Role Confirmation Dialog */}
                <Dialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Custom Role</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the role "{selectedRole?.name}"?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteRoleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteRole}>
                        Delete Role
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell><Badge variant="outline">{role.slug}</Badge></TableCell>
                        <TableCell className="text-gray-500 text-sm">{role.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{(role.permissions as string[]).length} permissions</Badge>
                        </TableCell>
                        <TableCell>
                          {role.isSystem ? <Badge>System</Badge> : <Badge variant="outline">Custom</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedRole(role);
                                setRoleForm({
                                  ...role,
                                  permissions: role.permissions as string[]
                                });
                                setEditRoleOpen(true);
                              }}>
                                {role.isSystem ? 'View Permissions' : 'Edit Role'}
                              </DropdownMenuItem>
                              {!role.isSystem && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setDeleteRoleDialogOpen(true);
                                    }}
                                  >
                                    Delete Role
                                  </DropdownMenuItem>
                                </>
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
          </TabsContent >

          {/* System Users Tab */}
          < TabsContent value="users" className="mt-6" >
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
                            {roles.map((r) => (
                              <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
                            ))}
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
          </TabsContent >
        </Tabs >
      </div >
    </AdminLayout >
  );
}
