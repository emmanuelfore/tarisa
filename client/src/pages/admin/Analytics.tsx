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

const DETAILED_CATEGORY_DATA = [
  { name: 'Water', critical: 12, high: 25, medium: 40, low: 15 },
  { name: 'Roads', critical: 8, high: 30, medium: 20, low: 10 },
  { name: 'Waste', critical: 5, high: 15, medium: 45, low: 20 },
  { name: 'Power', critical: 15, high: 20, medium: 10, low: 5 },
  { name: 'Police', critical: 2, high: 5, medium: 15, low: 30 },
];

const DEPARTMENT_PERFORMANCE = [
  { name: 'Water & Sanitation', resolved: 145, pending: 32, avgTime: 4.5 },
  { name: 'Roads & Works', resolved: 98, pending: 45, avgTime: 12.0 },
  { name: 'Waste Management', resolved: 210, pending: 15, avgTime: 2.1 },
  { name: 'ZESA (Power)', resolved: 85, pending: 40, avgTime: 6.8 },
  { name: 'ZRP (Traffic)', resolved: 120, pending: 10, avgTime: 1.5 },
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
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Severity by Category</CardTitle>
                  <CardDescription>Breakdown of active issues by severity level across different service categories.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DETAILED_CATEGORY_DATA} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" />
                      <Bar dataKey="high" name="High" stackId="a" fill="#f97316" />
                      <Bar dataKey="medium" name="Medium" stackId="a" fill="#eab308" />
                      <Bar dataKey="low" name="Low" stackId="a" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workload vs. Backlog</CardTitle>
                  <CardDescription>Resolved vs Pending issues per department.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEPARTMENT_PERFORMANCE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="resolved" name="Resolved Issues" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending Issues" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Response Time</CardTitle>
                  <CardDescription>Average time (in hours) to resolve reported issues.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEPARTMENT_PERFORMANCE} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" unit="h" />
                      <YAxis dataKey="name" type="category" width={120} fontSize={12} />
                      <Tooltip formatter={(value) => [`${value} hours`, 'Avg Time']} />
                      <Bar dataKey="avgTime" name="Avg Response Time" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
