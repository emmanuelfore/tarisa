
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function usePermission(permission: string) {
    const { data: user } = useQuery<User>({
        queryKey: ["/api/auth/me"],
        retry: false,
    });

    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check if permission exists in user's assigned permissions
    // Note: The backend already merges role defaults + custom permissions 
    // into the session/user object before sending it back.
    // HOWEVER, we need to check if your User type definition includes 'permissions'.
    // If the standard User type doesn't explicitly have it (it's JSONB), we cast.

    const userPerms = (user.permissions as string[]) || [];
    return userPerms.includes(permission);
}

export function usePermissions() {
    const { data: user } = useQuery<User>({
        queryKey: ["/api/auth/me"],
        retry: false,
    });

    return (user?.permissions as string[]) || [];
}
