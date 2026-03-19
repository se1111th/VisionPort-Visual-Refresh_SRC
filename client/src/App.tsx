import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function getRouterBase() {
  if (typeof window === "undefined") {
    return "";
  }

  const isGithubPagesHost = window.location.hostname.endsWith("github.io");
  if (!isGithubPagesHost) {
    return "";
  }

  const [firstSegment] = window.location.pathname.split("/").filter(Boolean);

  return firstSegment ? `/${firstSegment}` : "";
}

function App() {
  const base = getRouterBase();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router base={base}>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
