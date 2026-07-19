import { Link, useLocation } from 'wouter';
import { Home, List, DollarSign, User as UserIcon, Menu, LogOut, Navigation } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/driver', icon: Home },
    { label: 'Active Orders', path: '/driver/orders', icon: List },
    { label: 'Earnings', path: '/driver/earnings', icon: DollarSign },
    { label: 'Profile', path: '/driver/profile', icon: UserIcon },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">Cargo<span className="text-warning">Driver</span></h2>
      </div>
      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/driver' && location.startsWith(item.path));
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
            <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || 'D'}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || 'Driver'}</p>
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
    <div className="min-h-[100dvh] bg-surface flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border bg-sidebar shrink-0 sticky top-0 h-[100dvh]">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <header className="md:hidden sticky top-0 z-50 bg-primary border-b border-border h-16 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full shrink-0">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h2 className="text-xl font-bold text-white">Cargo<span className="text-warning">Driver</span></h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto md:max-w-5xl p-4 md:p-8 relative">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-divider rounded-t-3xl shadow-[0_-4px_20px_rgba(94,45,145,0.05)] md:hidden">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 h-20">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== '/driver' && location.startsWith(item.path));
            if (item.path === '/driver/orders') {
              return (
                <div key={item.path} className="relative -top-5">
                  <Link href={item.path}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform ${isActive ? 'bg-warning text-white shadow-warning/30 scale-105' : 'bg-primary text-white shadow-primary/30'}`}>
                      <Navigation size={24} />
                    </div>
                  </Link>
                </div>
              );
            }
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center justify-center w-16 h-full text-xs font-medium gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label.split(' ')[0]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
