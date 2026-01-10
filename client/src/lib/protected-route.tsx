import { useQuery } from "@tanstack/react-query";
import { useLocation, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [location] = useLocation();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["/api/auth/me"],
        retry: false,
        queryFn: async () => {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                if (res.status === 401) throw new Error("Unauthorized");
                throw new Error("Failed to fetch user");
            }
            const data = await res.json();
            return data.user;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !user) {
        return <Redirect to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If user is logged in but doesn't have permission, maybe redirect to home or show denied?
        // For now, redirect to appropriate home
        const home = ['super_admin', 'admin', 'manager', 'officer'].includes(user.role)
            ? '/admin/dashboard'
            : '/citizen/home';

        if (location !== home) {
            return <Redirect to={home} />;
        }
        // If already at home but incorrect role (edge case), just show denied
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500">You do not have permission to view this page.</p>
            </div>
        );
    }

    return <>{children}</>;
}
