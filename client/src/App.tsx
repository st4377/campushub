import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import ListCommunity from "@/pages/list-community";
import FAQ from "@/pages/faq";
import Login from "@/pages/login";
import AdminApprovals from "@/pages/admin-approvals";
import Dashboard from "@/pages/dashboard";
import SubmissionStatus from "@/pages/submission-status";
import MyCommunities from "@/pages/my-communities";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/list-community" component={ListCommunity} />
      <Route path="/faq" component={FAQ} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/submission-status" component={SubmissionStatus} />
      <Route path="/my-communities" component={MyCommunities} />
      <Route path="/admin/approvals" component={AdminApprovals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
