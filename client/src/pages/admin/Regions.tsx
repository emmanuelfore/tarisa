
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

type Jurisdiction = {
    id: number;
    name: string;
    level: 'country' | 'province' | 'district' | 'local_authority' | 'ward' | 'suburb';
    parentId: number | null;
    code: string | null;
};

export default function AdminRegions() {
    const { toast } = useToast();
    const queryClient = useQueryClient();


    const [createJurisOpen, setCreateJurisOpen] = useState(false);
    const [jurisForm, setJurisForm] = useState({ name: "", level: "local_authority", parentId: 0 as number | null, code: "" });

    const { data: jurisdictions, isLoading: loadingJuris } = useQuery<Jurisdiction[]>({
        queryKey: ['/api/jurisdictions'],
    });

    const createJurisMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/jurisdictions", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/jurisdictions'] });
            setCreateJurisOpen(false);
            setJurisForm({ name: "", level: "local_authority", parentId: 0, code: "" });
            toast({ title: "Jurisdiction Created" });
        },
        onError: () => toast({ title: "Failed to create jurisdiction", variant: "destructive" })
    });

    const provinces = jurisdictions?.filter(j => j.level === 'province') || [];
    const authorities = jurisdictions?.filter(j => j.level === 'local_authority' || j.level === 'district') || [];
    const wards = jurisdictions?.filter(j => j.level === 'ward') || [];
    const suburbs = jurisdictions?.filter(j => j.level === 'suburb') || [];

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Region Management</h2>
                    <p className="text-gray-500">Manage Local Authorities, Wards, and Suburbs.</p>
                </div>

                <Tabs defaultValue="authorities" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                        <TabsTrigger value="provinces">Provinces</TabsTrigger>
                        <TabsTrigger value="authorities">Authorities</TabsTrigger>
                        <TabsTrigger value="wards">Wards</TabsTrigger>
                        <TabsTrigger value="suburbs">Suburbs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="provinces" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Provinces</CardTitle>
                                    <CardDescription>Manage Zimbabwe's 10 Provinces.</CardDescription>
                                </div>
                                <Dialog open={createJurisOpen} onOpenChange={setCreateJurisOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setJurisForm({ name: "", level: "province", parentId: null, code: "" })} className="gap-2"><Plus size={16} /> Add Province</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Province</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Name</Label>
                                                <Input value={jurisForm.name} onChange={e => setJurisForm({ ...jurisForm, name: e.target.value })} placeholder="e.g. Harare Metropolitan" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Code</Label>
                                                <Input value={jurisForm.code} onChange={e => setJurisForm({ ...jurisForm, code: e.target.value })} placeholder="e.g. HRE" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={() => createJurisMutation.mutate(jurisForm)} disabled={createJurisMutation.isPending}>Create</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingJuris ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : provinces.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No provinces found.</TableCell></TableRow>
                                        ) : provinces.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell><Badge variant="outline">{p.code}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="authorities" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Local Authorities</CardTitle>
                                    <CardDescription>Manage City Councils and Municipalities.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2"><Plus size={16} /> Add Authority</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Add Local Authority</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Province</Label>
                                                <Select onValueChange={(v) => setJurisForm({ ...jurisForm, level: 'local_authority', parentId: parseInt(v) })}>
                                                    <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                                                    <SelectContent>
                                                        {provinces.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Name</Label>
                                                <Input onChange={e => setJurisForm({ ...jurisForm, name: e.target.value })} placeholder="e.g. Harare City Council" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Code</Label>
                                                <Input onChange={e => setJurisForm({ ...jurisForm, code: e.target.value })} placeholder="e.g. HCC" />
                                            </div>
                                        </div>
                                        <DialogFooter><Button onClick={() => createJurisMutation.mutate(jurisForm)}>Create</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Province</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingJuris ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : authorities.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No authorities or districts found.</TableCell></TableRow>
                                        ) : authorities.map((auth) => (
                                            <TableRow key={auth.id}>
                                                <TableCell className="font-medium">{auth.name}</TableCell>
                                                <TableCell><Badge variant="secondary" className="capitalize">{auth.level.replace('_', ' ')}</Badge></TableCell>
                                                <TableCell>{provinces.find(p => p.id === auth.parentId)?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="suburbs" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Suburbs</CardTitle>
                                    <CardDescription>Manage residential suburbs and areas.</CardDescription>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2"><Plus size={16} /> Add Suburb</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Add Suburb</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Ward</Label>
                                                <Select onValueChange={(v) => setJurisForm({ ...jurisForm, level: 'suburb', parentId: parseInt(v) })}>
                                                    <SelectTrigger><SelectValue placeholder="Select Ward" /></SelectTrigger>
                                                    <SelectContent>
                                                        {wards.map(w => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Suburb Name</Label>
                                                <Input onChange={e => setJurisForm({ ...jurisForm, name: e.target.value })} placeholder="e.g. Mabelreign" />
                                            </div>
                                        </div>
                                        <DialogFooter><Button onClick={() => createJurisMutation.mutate(jurisForm)}>Create</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Suburb</TableHead>
                                            <TableHead>Ward</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingJuris ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : suburbs.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">No suburbs found.</TableCell></TableRow>
                                        ) : suburbs.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">{sub.name}</TableCell>
                                                <TableCell>{wards.find(w => w.id === sub.parentId)?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Edit</Button>
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
        </AdminLayout >
    );
}
