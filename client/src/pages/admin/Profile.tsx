import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AdminProfile() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "", // Note: Schema might not have email on 'users' table, need to check. Assuming basic fields for now.
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Fetch current user details
    const { data: user, isLoading } = useQuery({
        queryKey: ["/api/auth/me"],
        queryFn: async () => {
            const res = await fetch("/api/auth/me");
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        }
    });

    useEffect(() => {
        if (user?.user) {
            setFormData(prev => ({
                ...prev,
                name: user.user.name || "",
                username: user.user.username || "",
            }));
        }
    }, [user]);

    const handleSave = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "New password and confirm password do not match.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            // Assuming a patch endpoint for users or a specific profile update endpoint
            // Since /api/users/:id exists, we can use that if we are admin. 
            // But purely for self-update, normally /api/auth/me or /api/profile is better.
            // For now, let's assume we can PATCH /api/users/{id}

            if (user?.user?.id) {
                const updateData: any = { name: formData.name };
                if (formData.newPassword) {
                    updateData.password = formData.newPassword;
                }

                await apiRequest("PATCH", `/api/users/${user.user.id}`, updateData);

                toast({
                    title: "Profile Updated",
                    description: "Your profile changes have been saved successfully.",
                });
            }
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

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
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-heading font-bold text-gray-900">My Profile</h2>
                    <p className="text-gray-500">Manage your account settings and preferences.</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your public profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex flex-col items-center gap-3">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                            {user?.user?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" size="sm">Change Avatar</Button>
                                </div>

                                <div className="flex-1 space-y-4 w-full">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <Input
                                                id="username"
                                                className="pl-9 bg-gray-50"
                                                value={formData.username}
                                                disabled
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500">Username cannot be changed.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and authentication methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between items-center px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Shield size={14} />
                                <span>Two-factor authentication is currently disabled.</span>
                            </div>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
