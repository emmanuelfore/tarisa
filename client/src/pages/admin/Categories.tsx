import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, FolderTree } from "lucide-react";
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

type IssueCategory = {
    id: number;
    name: string;
    code: string;
    parentCategory: string;
    icon: string;
    responseTimeHours: number;
    resolutionTimeHours: number;
};

export default function AdminCategories() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState<IssueCategory | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        icon: "",
    });

    const { data: categories, isLoading } = useQuery<IssueCategory[]>({
        queryKey: ['/api/categories'],
    });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteCode, setDeleteCode] = useState<string | null>(null);
    const [newCatForm, setNewCatForm] = useState({
        name: "",
        code: "",
        icon: "circle",
        parentCategory: "roads",
        responseTimeHours: 48,
        resolutionTimeHours: 168,
    });

    const createCatMutation = useMutation({
        mutationFn: async (data: typeof newCatForm) => {
            const res = await apiRequest("POST", "/api/categories", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
            setCreateDialogOpen(false);
            setNewCatForm({
                name: "",
                code: "",
                icon: "circle",
                parentCategory: "roads",
                responseTimeHours: 48,
                resolutionTimeHours: 168,
            });
            toast({ title: "Category Created", description: "New issue category has been added." });
        },
        onError: () => toast({ title: "Creation Failed", variant: "destructive" })
    });

    const updateCatMutation = useMutation({
        mutationFn: async (data: { code: string; name: string; icon: string }) => {
            const res = await apiRequest("PUT", `/api/categories/${data.code}`, {
                name: data.name,
                icon: data.icon,
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
            setEditDialogOpen(false);
            toast({ title: "Category Updated", description: "Category settings have been saved." });
        },
        onError: () => toast({ title: "Update Failed", variant: "destructive" })
    });

    const deleteCatMutation = useMutation({
        mutationFn: async (code: string) => {
            await apiRequest("DELETE", `/api/categories/${code}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
            setDeleteCode(null);
            toast({ title: "Category Deleted", description: "Category has been removed." });
        },
        onError: () => toast({ title: "Deletion Failed", variant: "destructive" })
    });

    const handleCreate = () => {
        createCatMutation.mutate(newCatForm);
    };

    const handleDelete = () => {
        if (deleteCode) deleteCatMutation.mutate(deleteCode);
    };

    const handleEdit = (cat: IssueCategory) => {
        setSelectedCat(cat);
        setEditForm({
            name: cat.name,
            icon: cat.icon,
        });
        setEditDialogOpen(true);
    };

    const handleSave = () => {
        if (!selectedCat) return;
        updateCatMutation.mutate({
            code: selectedCat.code,
            ...editForm
        });
    };

    // Group categories by parent department
    const groupedCategories = categories?.reduce((acc, cat) => {
        const group = cat.parentCategory || "uncategorized";
        if (!acc[group]) acc[group] = [];
        acc[group].push(cat);
        return acc;
    }, {} as Record<string, IssueCategory[]>);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-heading font-bold text-gray-900">Issue Categories</h2>
                        <p className="text-gray-500">Manage issue types and their department assignments.</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <FolderTree className="mr-2 h-4 w-4" />
                        New Category
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {Object.entries(groupedCategories || {}).map(([dept, cats]) => (
                            <Card key={dept}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 capitalize">
                                        <FolderTree size={20} className="text-primary" />
                                        {dept.replace(/_/g, ' ')} Department
                                    </CardTitle>
                                    <CardDescription>
                                        {cats.length} issue {cats.length === 1 ? 'category' : 'categories'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Icon</TableHead>
                                                <TableHead>Response SLA</TableHead>
                                                <TableHead>Resolution SLA</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cats.map((cat) => (
                                                <TableRow key={cat.id}>
                                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{cat.code}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{cat.icon}</Badge>
                                                    </TableCell>
                                                    <TableCell>{cat.responseTimeHours}h</TableCell>
                                                    <TableCell>{cat.resolutionTimeHours}h</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(cat)}
                                                                className="gap-2"
                                                            >
                                                                <Edit2 size={14} />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteCode(cat.code)}
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update display name and icon for {selectedCat?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Category Name</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="e.g. Water Leaks"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Icon (Lucide name)</Label>
                            <Input
                                value={editForm.icon}
                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                placeholder="e.g. droplets"
                            />
                            <p className="text-xs text-gray-500">
                                Icon name from Lucide React library (e.g., droplets, wrench, trash).
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={updateCatMutation.isPending}>
                            {updateCatMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                            Add a new issue category to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Category Name</Label>
                            <Input
                                value={newCatForm.name}
                                onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                                placeholder="e.g. Water Leaks"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Code</Label>
                            <Input
                                value={newCatForm.code}
                                onChange={(e) => setNewCatForm({ ...newCatForm, code: e.target.value })}
                                placeholder="e.g. water_leak"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Parent Category</Label>
                            <Select
                                value={newCatForm.parentCategory}
                                onValueChange={(val) => setNewCatForm({ ...newCatForm, parentCategory: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="roads">Roads</SelectItem>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="sewer">Sewer</SelectItem>
                                    <SelectItem value="waste">Waste</SelectItem>
                                    <SelectItem value="lights">Lights</SelectItem>
                                    <SelectItem value="health">Health</SelectItem>
                                    <SelectItem value="housing">Housing</SelectItem>
                                    <SelectItem value="parks">Parks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Icon (Lucide name)</Label>
                            <Input
                                value={newCatForm.icon}
                                onChange={(e) => setNewCatForm({ ...newCatForm, icon: e.target.value })}
                                placeholder="e.g. droplets"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createCatMutation.isPending}>
                            {createCatMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteCode} onOpenChange={(open) => !open && setDeleteCode(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleteCatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
