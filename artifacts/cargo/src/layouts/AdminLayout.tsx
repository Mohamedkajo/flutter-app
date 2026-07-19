import { Link, useLocation } from 'wouter';
import { LayoutDashboard, ShoppingBag, Store, Users, DollarSign, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Stores', path: '/admin/stores', icon: Store },
    { label: 'Drivers', path: '/admin/drivers', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: DollarSign },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Cargo<span className="text-accent">Admin</span></h2>
      </div>
      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/admin' && location.startsWith(item.path));
          return (
            <Link key={item.path} href={item.path} onClick={() => setIsSidebarOpen(false)}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 rounded-xl h-12 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-primary'} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border bg-sidebar shrink-0 sticky top-0 h-[100dvh]">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-border h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary rounded-full shrink-0">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h2 className="text-xl font-bold text-primary">Cargo<span className="text-accent">Admin</span></h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
