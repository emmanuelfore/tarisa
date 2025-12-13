import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import appIcon from "@assets/generated_images/app_icon_for_tarisa.png";

// Pages
import Landing from "@/pages/Landing";
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
      {/* Default redirect to app home */}
      <Route path="/" component={Landing} />
      
      <Route path="/signup" component={Signup} />
      
      {/* Citizen Routes */}
      <Route path="/citizen/home" component={CitizenHome} />
      <Route path="/citizen/map" component={CitizenMap} />
      <Route path="/citizen/report" component={ReportIssue} />
      <Route path="/citizen/issue/:id" component={IssueDetail} />
      <Route path="/citizen/profile" component={CitizenProfile} />
      <Route path="/citizen/credits" component={CitizenCredits} /> 

      {/* Admin Routes - hidden from main flow but accessible */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/reports" component={AdminReports} /> 
      <Route path="/admin/map" component={AdminMap} /> 
      <Route path="/admin/settings" component={AdminSettings} /> 

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
