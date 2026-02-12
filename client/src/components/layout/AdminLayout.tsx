import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Map as MapIcon,
  Bell,
  Shield,
  Megaphone,
  BarChart,
  UserCircle,
  Landmark,
  ChevronLeft,
  Menu,
  Building2,
  Tag
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-10 hidden md:flex flex-col transition-all duration-300`}>
        <div className={`p-6 border-b border-gray-100 flex items-center gap-3 justify-between ${isCollapsed ? "p-4 justify-center" : ""}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-heading">
                T
              </div>
              <span className="font-heading font-bold text-xl text-primary">TARISA</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-heading shrink-0">
              T
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/dashboard")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <LayoutDashboard size={20} className="shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <Link href="/admin/reports" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/reports")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <FileText size={20} className="shrink-0" />
            {!isCollapsed && <span>Issue Management</span>}
          </Link>

          <Link href="/admin/map" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/map")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <MapIcon size={20} className="shrink-0" />
            {!isCollapsed && <span>Live Map</span>}
          </Link>


          <Link href="/admin/regions" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/regions")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Landmark size={20} className="shrink-0" />
            {!isCollapsed && <span>Jurisdictions</span>}
          </Link>

          <Link href="/admin/departments" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/departments")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Building2 size={20} className="shrink-0" />
            {!isCollapsed && <span>Departments</span>}
          </Link>

          <Link href="/admin/categories" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/categories")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Tag size={20} className="shrink-0" />
            {!isCollapsed && <span>Categories</span>}
          </Link>

          <Link href="/admin/citizens" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/citizens")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Users size={20} className="shrink-0" />
            {!isCollapsed && <span>Citizens</span>}
          </Link>

          <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/users")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Users size={20} className="shrink-0" />
            {!isCollapsed && <span>Users & Roles</span>}
          </Link>

          <Link href="/admin/staff" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/staff")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Shield size={20} className="shrink-0" />
            {!isCollapsed && <span>Staff</span>}
          </Link>

          <Link href="/admin/broadcast" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/broadcast")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Megaphone size={20} className="shrink-0" />
            {!isCollapsed && <span>Broadcasts</span>}
          </Link>

          <Link href="/admin/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/analytics")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <BarChart size={20} className="shrink-0" />
            {!isCollapsed && <span>Analytics</span>}
          </Link>

          <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin/settings")
            ? "bg-primary/10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${isCollapsed ? "justify-center px-2" : ""}`}>
            <Settings size={20} className="shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 flex justify-center">
          <Button variant="ghost" className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? "justify-center p-0 h-10 w-10 px-0" : ""}`}>
            <LogOut size={20} className={isCollapsed ? "" : "mr-2"} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isCollapsed ? "md:ml-20" : "md:ml-64"} min-h-screen flex flex-col transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="text-lg font-heading font-semibold text-gray-800">
            {location === '/admin/dashboard' ? 'Overview' :
              location.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}
          </h1>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-medium text-sm">New Issue Reported</span>
                    <span className="text-xs text-gray-500">A new pothole report was submitted in Ward 4.</span>
                    <span className="text-[10px] text-gray-400 mt-1">2 mins ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-medium text-sm">System Update</span>
                    <span className="text-xs text-gray-500">Maintenance scheduled for midnight.</span>
                    <span className="text-[10px] text-gray-400 mt-1">1 hour ago</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-500">City of Harare</div>
                  </div>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/admin/profile")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
