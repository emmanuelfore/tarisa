import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route"; // Import ProtectedRoute
import NotFound from "@/pages/not-found";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login"; // Import Login
import CitizenHome from "@/pages/citizen/Home";
import CitizenMap from "@/pages/citizen/Map";
import ReportIssue from "@/pages/citizen/Report";
import CitizenProfile from "@/pages/citizen/Profile";
import IssueDetail from "@/pages/citizen/IssueDetail";
import CitizenCredits from "@/pages/citizen/Credits";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMap from "@/pages/admin/Map";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";
import AdminCitizens from "@/pages/admin/Citizens";
import AdminStaff from "@/pages/admin/Staff";
import AdminUsers from "@/pages/admin/Users";
import AdminBroadcast from "@/pages/admin/Broadcast";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminIssueDetail from "@/pages/admin/IssueDetail";
import AdminCitizenProfile from "@/pages/admin/CitizenProfile";
import AdminProfile from "@/pages/admin/Profile";
import Signup from "@/pages/auth/Signup";

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
      <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6 animate-bounce">
        <img src={appIcon} alt="Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-4xl font-heading font-bold text-white mt-8 tracking-wider">TARISA</h1>
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="absolute bottom-10 text-white/60 text-sm font-medium">Powered by Expo</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Citizen Routes - Protected */}
      <Route path="/citizen/home">
        <ProtectedRoute><CitizenHome /></ProtectedRoute>
      </Route>
      <Route path="/citizen/map">
        <ProtectedRoute><CitizenMap /></ProtectedRoute>
      </Route>
      <Route path="/citizen/report">
        <ProtectedRoute><ReportIssue /></ProtectedRoute>
      </Route>
      <Route path="/citizen/issue/:id">
        {(params) => <ProtectedRoute><IssueDetail params={params} /></ProtectedRoute>}
      </Route>
      <Route path="/citizen/profile">
        <ProtectedRoute><CitizenProfile /></ProtectedRoute>
      </Route>
      <Route path="/citizen/credits">
        <ProtectedRoute><CitizenCredits /></ProtectedRoute>
      </Route>

      {/* Admin Routes - Protected with Role Check */}
      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminReports /></ProtectedRoute>
      </Route>
      <Route path="/admin/map">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminMap /></ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><AdminSettings /></ProtectedRoute>
      </Route>
      <Route path="/admin/citizens">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminCitizens /></ProtectedRoute>
      </Route>
      <Route path="/admin/staff">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><AdminStaff /></ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminUsers /></ProtectedRoute>
      </Route>
      <Route path="/admin/broadcast">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><AdminBroadcast /></ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminAnalytics /></ProtectedRoute>
      </Route>
      <Route path="/admin/profile">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}><AdminProfile /></ProtectedRoute>
      </Route>
      <Route path="/admin/reports/:id">
        {params => (
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'officer']}>
            <AdminIssueDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/citizen/:id">
        {params => (
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}>
            <AdminCitizenProfile />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
