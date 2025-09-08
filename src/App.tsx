import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthForm from "./components/AuthForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ReportsPage from "./components/ReportsPage";
import UserReportsPage from "./components/UserReportsPage";
import SmartFeedsPage from "./components/SmartFeedsPage";
import NotFound from "./pages/NotFound";
import ScannerPage from "./components/ScannerPage";
import DeepSearchPage from "./components/DeepSearchPage";
import AILinksPage from "./components/AILinksPage";
import TrackingRedirectPage from "./components/TrackingRedirectPage";
import ManualPage from "./components/ManualPage";
import BotPackagesPage from "./components/BotPackagesPage";
import AdminBotManagement from "./components/AdminBotManagement";
import AdminUsersManagement from "./components/AdminUsersManagement";
import AdminReportsManagement from "./components/AdminReportsManagement";
import AdminThreatsPage from "./components/AdminThreatsPage";
import SecurityAlertsPage from "./components/SecurityAlertsPage";
import ProfilePage from "./pages/ProfilePage";
import RecoveryPage from "./components/RecoveryPage";
import AdminRecoveryJobsPage from "./components/AdminRecoveryJobsPage";
import AdminAnalyticsPage from "./components/AdminAnalyticsPage";
import AdminABTestingPage from "./components/AdminABTestingPage";
import AdminContentManagement from "./components/AdminContentManagement";
import AdminSystemMonitoring from "./components/AdminSystemMonitoring";
import AdminSecurityCenter from "./components/AdminSecurityCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/alerts" element={<SecurityAlertsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/bots" element={<AdminBotManagement />} />
          <Route path="/admin/users" element={<AdminUsersManagement />} />
          <Route path="/admin/reports" element={<AdminReportsManagement />} />
          <Route path="/admin/threats" element={<AdminThreatsPage />} />
          <Route path="/admin/recovery" element={<AdminRecoveryJobsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/ab-testing" element={<AdminABTestingPage />} />
        <Route path="/admin/contents" element={<AdminContentManagement />} />
        <Route path="/admin/monitoring" element={<AdminSystemMonitoring />} />
        <Route path="/admin/security" element={<AdminSecurityCenter />} />
          <Route path="/admin/manual" element={<ManualPage />} />
          <Route path="/bots" element={<BotPackagesPage />} />
          <Route path="/reports" element={<UserReportsPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/smartfeeds" element={<SmartFeedsPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/deepsearch" element={<DeepSearchPage />} />
          <Route path="/links" element={<AILinksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/track/:shortCode" element={<TrackingRedirectPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
