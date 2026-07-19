import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BarChart3, Users, Store, Package, Tags, ShoppingCart, Ticket,
  BellRing, Wallet, FileText, Settings, ShieldCheck, LogOut, MessageSquare,
  ImageIcon, Globe, HelpCircle, BookOpen, Mail, Zap, Boxes, Briefcase,
  Activity, Paintbrush, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = { name: string; href: string; icon: any };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Audit Logs", href: "/audit-logs", icon: Activity },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Stores", href: "/stores", icon: Store },
      { name: "Products", href: "/products", icon: Package },
      { name: "Categories", href: "/categories", icon: Tags },
      { name: "Inventory", href: "/inventory", icon: Boxes },
      { name: "Flash Sales", href: "/flash-sales", icon: Zap },
      { name: "Coupons", href: "/coupons", icon: Ticket },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Reviews", href: "/reviews", icon: MessageSquare },
      { name: "Wallet", href: "/wallet", icon: Wallet },
      { name: "Roles", href: "/roles", icon: ShieldCheck },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Site Settings", href: "/site-settings", icon: Paintbrush },
      { name: "Banners", href: "/banners", icon: ImageIcon },
      { name: "CMS Pages", href: "/cms", icon: Globe },
      { name: "Blog", href: "/blog", icon: BookOpen },
      { name: "FAQ", href: "/faq", icon: HelpCircle },
      { name: "Careers", href: "/careers", icon: Briefcase },
    ],
  },
  {
    label: "Communication",
    items: [
      { name: "Contact", href: "/contact", icon: Mail },
      { name: "Notifications", href: "/notifications", icon: BellRing },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    localStorage.removeItem("cargo_token");
    setLocation("/login");
  };

  const toggleGroup = (label: string) => setCollapsed(c => ({ ...c, [label]: !c[label] }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-60 flex-shrink-0 border-r bg-card flex flex-col">
        <div className="h-14 flex items-center px-4 border-b">
          <div className="flex items-center gap-2 font-bold text-base tracking-tight text-primary">
            <div className="w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-bold">C</div>
            Cargo Ops
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {NAV_GROUPS.map(group => {
            const isOpen = !collapsed[group.label];
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {group.label}
                  <ChevronDown className={cn("w-3 h-3 transition-transform", !isOpen && "-rotate-90")} />
                </button>
                {isOpen && group.items.map(item => {
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
