import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import CitizenHome from "@/pages/citizen/Home";
import CitizenMap from "@/pages/citizen/Map";
import ReportIssue from "@/pages/citizen/Report";
import CitizenProfile from "@/pages/citizen/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Citizen Routes */}
      <Route path="/citizen/home" component={CitizenHome} />
      <Route path="/citizen/map" component={CitizenMap} />
      <Route path="/citizen/report" component={ReportIssue} />
      <Route path="/citizen/profile" component={CitizenProfile} />
      <Route path="/citizen/credits" component={CitizenProfile} /> 
      {/* Reuse Profile for Credits for MVP */}

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/reports" component={AdminDashboard} /> 
      {/* Reuse Dashboard for now */}
      <Route path="/admin/map" component={CitizenMap} /> 
      {/* Reuse Map for now but ideally different */}

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
