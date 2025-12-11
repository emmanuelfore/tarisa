import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Map as MapIcon,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-heading">
            T
          </div>
          <span className="font-heading font-bold text-xl text-primary">TARISA</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin/dashboard">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/admin/dashboard") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <LayoutDashboard size={20} />
              Dashboard
            </a>
          </Link>

          <Link href="/admin/reports">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/admin/reports") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <FileText size={20} />
              Reports
            </a>
          </Link>

          <Link href="/admin/map">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/admin/map") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <MapIcon size={20} />
              Live Map
            </a>
          </Link>

          <Link href="/admin/users">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/admin/users") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <Users size={20} />
              User Management
            </a>
          </Link>

          <Link href="/admin/settings">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive("/admin/settings") 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <Settings size={20} />
              Settings
            </a>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="text-lg font-heading font-semibold text-gray-800">
            {location === '/admin/dashboard' ? 'Overview' : 
             location.split('/').pop()?.replace(/^\w/, c => c.toUpperCase())}
          </h1>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell size={20} />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">City of Harare</div>
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
