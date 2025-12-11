import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin
} from "lucide-react";
import mapBg from "@assets/generated_images/map_background_texture.png";

const data = [
  { name: 'Mon', reports: 12 },
  { name: 'Tue', reports: 19 },
  { name: 'Wed', reports: 15 },
  { name: 'Thu', reports: 22 },
  { name: 'Fri', reports: 28 },
  { name: 'Sat', reports: 10 },
  { name: 'Sun', reports: 8 },
];

const pieData = [
  { name: 'Roads', value: 400 },
  { name: 'Water', value: 300 },
  { name: 'Waste', value: 300 },
  { name: 'Lights', value: 200 },
];

const COLORS = ['#2E7D32', '#0288D1', '#F57C00', '#FFCA28'];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">1,248</h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +12% this week
              </div>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <AlertCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">854</h3>
              <div className="flex items-center mt-1 text-green-600 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +5% vs last month
              </div>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <CheckCircle size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">4.2 Days</h3>
              <div className="flex items-center mt-1 text-red-500 text-xs font-medium">
                <ArrowUpRight size={14} className="mr-1" />
                +0.5 days slower
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Zones</p>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mt-1">Ward 7</h3>
              <p className="text-xs text-gray-400 mt-1">Highest activity</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <MapPin size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Report Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heat Map Mini */}
        <Card className="overflow-hidden">
          <CardHeader>
             <CardTitle className="text-lg font-heading">Hotspots</CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative h-[300px]">
             <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${mapBg})` }}
            />
            <div className="absolute inset-0 bg-black/10" />
            
            {/* Heat Points */}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500/30 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-orange-500/30 rounded-full blur-xl" />
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Avondale West</span>
                <span className="text-red-600 font-bold">Critical</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Tracking ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">TAR-2025-0042</td>
                  <td className="px-4 py-3">Roads</td>
                  <td className="px-4 py-3">123 Samora Machel Ave</td>
                  <td className="px-4 py-3">Today, 10:30 AM</td>
                  <td className="px-4 py-3"><StatusBadge status="submitted" /></td>
                  <td className="px-4 py-3 text-primary font-medium cursor-pointer">View</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">TAR-2025-0041</td>
                  <td className="px-4 py-3">Water</td>
                  <td className="px-4 py-3">45 Borrowdale Rd</td>
                  <td className="px-4 py-3">Yesterday</td>
                  <td className="px-4 py-3"><StatusBadge status="in_progress" /></td>
                  <td className="px-4 py-3 text-primary font-medium cursor-pointer">View</td>
                </tr>
                 <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">TAR-2025-0038</td>
                  <td className="px-4 py-3">Street Lights</td>
                  <td className="px-4 py-3">Westgate Area</td>
                  <td className="px-4 py-3">Dec 09</td>
                  <td className="px-4 py-3"><StatusBadge status="resolved" /></td>
                  <td className="px-4 py-3 text-primary font-medium cursor-pointer">View</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
