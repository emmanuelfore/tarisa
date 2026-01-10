import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

export default function Login() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiRequest("POST", "/api/auth/login", formData);
            const data = await res.json();

            toast({
                title: "Welcome back!",
                description: `Logged in as ${data.user.name}`,
            });

            // Redirect based on role
            if (['super_admin', 'admin', 'manager', 'officer'].includes(data.user.role)) {
                setLocation('/admin/dashboard');
            } else {
                setLocation('/citizen/home');
            }
        } catch (error) {
            toast({
                title: "Login Failed",
                description: "Invalid username or password",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="-ml-3 mb-6">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <img src={appIcon} alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-sm text-center">Log in to your TARISA account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username / Email</Label>
                        <Input
                            id="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password">
                                <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base mt-6" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                        <ShieldCheck size={12} />
                        <span>Secure Official Portal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
