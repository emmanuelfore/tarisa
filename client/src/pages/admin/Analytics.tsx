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
  Legend
} from 'recharts';
import {
  Download,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [period, setPeriod] = useState("this_month");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const handleExport = (format: string) => {
    toast({
      title: "Generating Report",
      description: `Preparing ${format} export for download...`,
    });
    // Mock download delay
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: `Council_Report_${new Date().getFullYear()}.${format.toLowerCase()} has been downloaded.`,
      });
    }, 1500);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  // Transform data for charts
  const categoryData = analytics?.categoryCounts
    ? Object.entries(analytics.categoryCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'Water' ? '#0ea5e9' : name === 'Roads' ? '#f97316' : name === 'Waste' ? '#22c55e' : '#a855f7'
    }))
    : [];

  const priorityData = analytics?.priorityCounts
    ? Object.entries(analytics.priorityCounts).map(([name, value]) => ({
      name,
      value
    }))
    : [];

  // KPI Metrics
  const resolutionRate = analytics && analytics.totalIssues > 0
    ? Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)
    : 0;

  const performanceMetrics = [
    { label: "Total Issues", value: analytics?.totalIssues || 0, change: "+12", trend: "up" },
    { label: "Resolved", value: analytics?.resolvedIssues || 0, change: `Rate: ${resolutionRate}%`, trend: "up" },
    { label: "Pending", value: analytics?.pendingIssues || 0, change: "-5", trend: "down" },
    { label: "Avg Resolution", value: "3.5 Days", change: "-0.5 Days", trend: "up" },
  ];

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
          {performanceMetrics.map((metric, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <div className={`flex items-center text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
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
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Distribution Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Issues by Category</CardTitle>
                  <CardDescription>Distribution of report types.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Issues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart (Priority) */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Priority</CardTitle>
                  <CardDescription>Priority breakdown.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#22c55e'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="bottom" />
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || 'gray' }}></div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="font-bold">{cat.value} Issues</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
