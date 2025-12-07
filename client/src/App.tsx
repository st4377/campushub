import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import ListCommunity from "@/pages/list-community";
import FAQ from "@/pages/faq";
import Login from "@/pages/login";
import AdminApprovals from "@/pages/admin-approvals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/list-community" component={ListCommunity} />
      <Route path="/faq" component={FAQ} />
      <Route path="/login" component={Login} />
      <Route path="/admin/approvals" component={AdminApprovals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
