import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

export default function ForgotPassword() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest("POST", "/api/auth/forgot-password", { email });

            toast({
                title: "Reset Sent",
                description: "If an account exists, you will receive a 6-digit code.",
            });

            // Redirect to reset password page after a short delay
            setTimeout(() => {
                setLocation("/reset-password");
            }, 2000);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
                <Link href="/login">
                    <Button variant="ghost" size="icon" className="-ml-3 mb-6">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 text-sm text-center">Enter your email to receive a reset code</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tatenda@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base mt-6 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Reset Code
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Link href="/login" className="text-sm text-primary font-medium hover:underline">
                        Recall your password? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
