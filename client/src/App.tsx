import { } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/lib/protected-route"; // Import ProtectedRoute
import NotFound from "@/pages/not-found";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

// Pages
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
import AdminRegions from "@/pages/admin/Regions";
import AdminDepartments from "@/pages/admin/Departments";
import AdminCategories from "@/pages/admin/Categories";
import AdminIssueDetail from "@/pages/admin/IssueDetail";
import AdminCitizenProfile from "@/pages/admin/CitizenProfile";
import AdminProfile from "@/pages/admin/Profile";
import Signup from "@/pages/auth/Signup";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <Redirect to="/admin/dashboard" />
      </Route>
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
      <Route path="/admin/regions">
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'officer']}><AdminRegions /></ProtectedRoute>
      </Route>
      <Route path="/admin/departments">
        <ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminDepartments /></ProtectedRoute>
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminCategories /></ProtectedRoute>
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
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
