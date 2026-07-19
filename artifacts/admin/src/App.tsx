import { useEffect } from "react";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("cargo_token"));

import { Shell } from "@/components/layout/Shell";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Users from "@/pages/users";
import Stores from "@/pages/stores";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Orders from "@/pages/orders";
import Coupons from "@/pages/coupons";
import Notifications from "@/pages/notifications";
import Wallet from "@/pages/wallet";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Roles from "@/pages/roles";
import Reviews from "@/pages/reviews";
import Banners from "@/pages/banners";
import Cms from "@/pages/cms";
import Faq from "@/pages/faq";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import AuditLogs from "@/pages/audit-logs";
import FlashSales from "@/pages/flash-sales";
import Inventory from "@/pages/inventory";
import Careers from "@/pages/careers";
import SiteSettings from "@/pages/site-settings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  const token = localStorage.getItem("cargo_token");
  useEffect(() => { if (!token) setLocation("/login"); }, [token, location, setLocation]);
  if (!token) return null;
  return <Shell><Component {...rest} /></Shell>;
}

function PR({ c }: { c: any }) {
  return <ProtectedRoute component={c} />;
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <PR c={Dashboard} />} />
      <Route path="/analytics" component={() => <PR c={Analytics} />} />
      <Route path="/users" component={() => <PR c={Users} />} />
      <Route path="/stores" component={() => <PR c={Stores} />} />
      <Route path="/products" component={() => <PR c={Products} />} />
      <Route path="/categories" component={() => <PR c={Categories} />} />
      <Route path="/orders" component={() => <PR c={Orders} />} />
      <Route path="/coupons" component={() => <PR c={Coupons} />} />
      <Route path="/notifications" component={() => <PR c={Notifications} />} />
      <Route path="/wallet" component={() => <PR c={Wallet} />} />
      <Route path="/reports" component={() => <PR c={Reports} />} />
      <Route path="/settings" component={() => <PR c={Settings} />} />
      <Route path="/roles" component={() => <PR c={Roles} />} />
      <Route path="/reviews" component={() => <PR c={Reviews} />} />
      <Route path="/banners" component={() => <PR c={Banners} />} />
      <Route path="/cms" component={() => <PR c={Cms} />} />
      <Route path="/faq" component={() => <PR c={Faq} />} />
      <Route path="/blog" component={() => <PR c={Blog} />} />
      <Route path="/contact" component={() => <PR c={Contact} />} />
      <Route path="/audit-logs" component={() => <PR c={AuditLogs} />} />
      <Route path="/flash-sales" component={() => <PR c={FlashSales} />} />
      <Route path="/inventory" component={() => <PR c={Inventory} />} />
      <Route path="/careers" component={() => <PR c={Careers} />} />
      <Route path="/site-settings" component={() => <PR c={SiteSettings} />} />
      <Route component={() => (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center"><h1 className="text-4xl font-bold">404</h1><p className="text-muted-foreground mt-2">Page not found.</p></div>
        </div>
      )} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <MainRouter />
      </WouterRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
