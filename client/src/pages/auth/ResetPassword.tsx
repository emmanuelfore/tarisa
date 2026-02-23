import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPassword() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        token: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                title: "Validation Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            toast({
                title: "Validation Error",
                description: "Password must be at least 6 characters.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await apiRequest("POST", "/api/auth/reset-password", {
                email: formData.email,
                token: formData.token,
                newPassword: formData.newPassword
            });

            toast({
                title: "Success",
                description: "Password updated successfully. You can now log in.",
            });

            setTimeout(() => {
                setLocation("/login");
            }, 2000);
        } catch (error: any) {
            const errorData = await error.response?.json();
            toast({
                title: "Reset Failed",
                description: errorData?.error || "Invalid or expired token.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
                <Link href="/forgot-password">
                    <Button variant="ghost" size="icon" className="-ml-3 mb-6">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Set New Password</h1>
                    <p className="text-gray-500 text-sm text-center">Enter the 6-digit code and your new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tatenda@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="token">Reset Code (6-digits)</Label>
                        <Input
                            id="token"
                            placeholder="123456"
                            value={formData.token}
                            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base mt-6 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    );
}
