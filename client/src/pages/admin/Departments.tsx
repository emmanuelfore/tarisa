import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Department = {
    id: number;
    name: string;
    code: string;
    category: string;
    responseTimeSlaHours: number;
    resolutionTimeSlaHours: number;
    handlesCategories: string[];
    jurisdictionId: number | null;
};

export default function AdminDepartments() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [editForm, setEditForm] = useState({
        code: "",
        responseTimeSlaHours: 0,
        resolutionTimeSlaHours: 0,
        handlesCategories: ""
    });

    const { data: departments, isLoading } = useQuery<Department[]>({
        queryKey: ['/api/departments'],
    });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [newDeptForm, setNewDeptForm] = useState({
        name: "",
        code: "",
        type: "Municipal",
        category: "roads",
        responseTimeSlaHours: 48,
        resolutionTimeSlaHours: 168,
    });

    const createDeptMutation = useMutation({
        mutationFn: async (data: typeof newDeptForm) => {
            const res = await apiRequest("POST", "/api/departments", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            setCreateDialogOpen(false);
            setNewDeptForm({
                name: "",
                code: "",
                type: "Municipal",
                category: "roads",
                responseTimeSlaHours: 48,
                resolutionTimeSlaHours: 168,
            });
            toast({ title: "Department Created", description: "New department has been added." });
        },
        onError: () => toast({ title: "Creation Failed", variant: "destructive" })
    });

    const updateDeptMutation = useMutation({
        mutationFn: async (data: { id: number; code: string; responseTimeSlaHours: number; resolutionTimeSlaHours: number; handlesCategories: string[] }) => {
            const res = await apiRequest("PUT", `/api/departments/${data.id}`, {
                code: data.code,
                responseTimeSlaHours: data.responseTimeSlaHours,
                resolutionTimeSlaHours: data.resolutionTimeSlaHours,
                handlesCategories: data.handlesCategories
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            setEditDialogOpen(false);
            toast({ title: "Department Updated", description: "Department details have been saved." });
        },
        onError: () => toast({ title: "Update Failed", variant: "destructive" })
    });

    const deleteDeptMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/departments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
            setDeleteId(null);
            toast({ title: "Department Deleted", description: "Department has been removed." });
        },
        onError: () => toast({ title: "Deletion Failed", variant: "destructive" })
    });

    const handleCreate = () => {
        createDeptMutation.mutate(newDeptForm);
    };

    const handleDelete = () => {
        if (deleteId) deleteDeptMutation.mutate(deleteId);
    };

    const handleEdit = (dept: Department) => {
        setSelectedDept(dept);
        setEditForm({
            code: dept.code,
            responseTimeSlaHours: dept.responseTimeSlaHours,
            resolutionTimeSlaHours: dept.resolutionTimeSlaHours,
            handlesCategories: dept.handlesCategories?.join(", ") || ""
        });
        setEditDialogOpen(true);
    };

    const handleSave = () => {
        if (!selectedDept) return;
        updateDeptMutation.mutate({
            id: selectedDept.id,
            code: editForm.code,
            responseTimeSlaHours: editForm.responseTimeSlaHours,
            resolutionTimeSlaHours: editForm.resolutionTimeSlaHours,
            handlesCategories: editForm.handlesCategories.split(",").map(c => c.trim()).filter(c => c.length > 0)
        });
    };

    const { data: jurisdictions = [] } = useQuery<any[]>({
        queryKey: ['/api/jurisdictions'],
    });

    // Filter for "Cities" / Top-level authorities
    // Adjust logic based on actual data levels (e.g., 'council', 'local_authority', 'district')
    const cities = jurisdictions.filter(j =>
        ['council', 'local_authority', 'district', 'municipality'].includes(j.level?.toLowerCase())
    );

    const [selectedCityId, setSelectedCityId] = useState<string>("all");

    const filteredDepartments = departments?.filter(d =>
        selectedCityId === "all" || d.jurisdictionId?.toString() === selectedCityId
    );

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-gray-900">Department Management</h2>
                        <p className="text-gray-500">Configure Service Level Agreements (SLAs) for each department.</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        New Department
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <MapPin size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Filter by Authority:</span>
                    </div>
                    <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="All Authorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Authorities</SelectItem>
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Departments</CardTitle>
                        <CardDescription>
                            {filteredDepartments?.length || 0} departments managing service delivery across Harare.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Response SLA</TableHead>
                                        <TableHead>Resolution SLA</TableHead>
                                        <TableHead>Handles Categories</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDepartments?.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium">{dept.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{dept.code}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {dept.responseTimeSlaHours}h
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {dept.resolutionTimeSlaHours}h
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {dept.handlesCategories?.slice(0, 3).map((cat) => (
                                                        <Badge key={cat} variant="secondary" className="text-xs">
                                                            {cat.replace(/_/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                    {(dept.handlesCategories?.length || 0) > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{(dept.handlesCategories?.length || 0) - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(dept)}
                                                        className="gap-2"
                                                    >
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteId(dept.id)}
                                                        className="gap-2 text-destructive hover:text-destructive"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit SLA Settings</DialogTitle>
                        <DialogDescription>
                            Configure response and resolution time targets for {selectedDept?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Department Code</Label>
                            <Input
                                value={editForm.code}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                placeholder="e.g. ZW-HA-CITY-RDS"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Response Time SLA (hours)</Label>
                            <Input
                                type="number"
                                value={editForm.responseTimeSlaHours}
                                onChange={(e) => setEditForm({ ...editForm, responseTimeSlaHours: parseInt(e.target.value) || 0 })}
                                placeholder="e.g. 24"
                            />
                            <p className="text-xs text-gray-500">
                                Expected time to acknowledge and respond to a new issue.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Resolution Time SLA (hours)</Label>
                            <Input
                                type="number"
                                value={editForm.resolutionTimeSlaHours}
                                onChange={(e) => setEditForm({ ...editForm, resolutionTimeSlaHours: parseInt(e.target.value) || 0 })}
                                placeholder="e.g. 72"
                            />
                            <p className="text-xs text-gray-500">
                                Expected time to fully resolve the issue.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Handled Categories (comma separated)</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editForm.handlesCategories}
                                onChange={(e) => setEditForm({ ...editForm, handlesCategories: e.target.value })}
                                placeholder="e.g. potholes, streetlights, drainage"
                            />
                            <p className="text-xs text-gray-500">
                                List the issue category codes this department is responsible for.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={updateDeptMutation.isPending}>
                            {updateDeptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Department</DialogTitle>
                        <DialogDescription>
                            Add a new department to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Department Name</Label>
                            <Input
                                value={newDeptForm.name}
                                onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                                placeholder="e.g. Roads and Highways"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Code</Label>
                            <Input
                                value={newDeptForm.code}
                                onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                                placeholder="e.g. HCC-ROADS"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Response SLA (hrs)</Label>
                                <Input
                                    type="number"
                                    value={newDeptForm.responseTimeSlaHours}
                                    onChange={(e) => setNewDeptForm({ ...newDeptForm, responseTimeSlaHours: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Resolution SLA (hrs)</Label>
                                <Input
                                    type="number"
                                    value={newDeptForm.resolutionTimeSlaHours}
                                    onChange={(e) => setNewDeptForm({ ...newDeptForm, resolutionTimeSlaHours: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createDeptMutation.isPending}>
                            {createDeptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the department
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleteDeptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
