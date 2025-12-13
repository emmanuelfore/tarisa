import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const MONTHLY_DATA = [
  { name: 'Jan', issues: 65, resolved: 40 },
  { name: 'Feb', issues: 59, resolved: 45 },
  { name: 'Mar', issues: 80, resolved: 55 },
  { name: 'Apr', issues: 81, resolved: 60 },
  { name: 'May', issues: 56, resolved: 50 },
  { name: 'Jun', issues: 95, resolved: 75 },
  { name: 'Jul', issues: 110, resolved: 85 },
];

const CATEGORY_DATA = [
  { name: 'Water & Sanitation', value: 400, color: '#0ea5e9' }, // Sky-500
  { name: 'Roads & Infrastructure', value: 300, color: '#f97316' }, // Orange-500
  { name: 'Waste Management', value: 300, color: '#22c55e' }, // Green-500
  { name: 'Public Safety (ZRP)', value: 200, color: '#eab308' }, // Yellow-500
  { name: 'Power (ZESA)', value: 150, color: '#a855f7' }, // Purple-500
];

const PERFORMANCE_METRICS = [
  { label: "Resolution Rate", value: "78%", change: "+2.5%", trend: "up" },
  { label: "Avg Response Time", value: "4.2 Hrs", change: "-1.5 Hrs", trend: "up" }, // down is good for time, but up trend meaning improvement
  { label: "Citizen Satisfaction", value: "4.1/5", change: "+0.3", trend: "up" },
  { label: "Pending Backlog", value: "142", change: "+12", trend: "down" }, // up is bad
];

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [period, setPeriod] = useState("this_month");

  const handleExport = (format: string) => {
    toast({
      title: "Generating Report",
      description: `Preparing ${format} export for download...`,
    });
    // Mock download delay
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: `Council_Report_Dec_2025.${format.toLowerCase()} has been downloaded.`,
      });
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900">Analytics & Reports</h2>
            <p className="text-gray-500">Performance metrics and council reporting.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('CSV')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button onClick={() => handleExport('PDF')}>
              <FileText className="mr-2 h-4 w-4" /> Generate PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERFORMANCE_METRICS.map((metric, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <div className={`flex items-center text-xs font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {metric.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Department Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Issue Resolution Trends</CardTitle>
                  <CardDescription>Reported vs Resolved issues over the last 7 months.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="issues" name="Reported" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" name="Resolved" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Category</CardTitle>
                  <CardDescription>Distribution of report types.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="bottom" height={150}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Detailed Category Breakdown</CardTitle>
                <CardDescription>Deep dive into specific issue types and their resolution times.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg m-6">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Detailed category analytics would appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
             <Card>
              <CardHeader>
                <CardTitle>Departmental Efficiency</CardTitle>
                <CardDescription>Response times and backlog per department.</CardDescription>
              </CardHeader>
               <CardContent className="h-[400px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg m-6">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Departmental performance metrics would appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
