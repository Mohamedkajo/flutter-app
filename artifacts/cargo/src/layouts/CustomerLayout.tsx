import { Link, useLocation, useSearch } from 'wouter';
import { Home, Search, ShoppingBag, User as UserIcon, Bell, Menu, MapPin, ArrowLeft, Wifi, Navigation, Grid3X3 } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';

/* ── Section metadata for filtered views ─────────────────────────── */
const SECTION_META: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  back: string;
}> = {
  online: {
    title: 'Shop Online',
    subtitle: 'Vendors who sell & deliver online',
    icon: <Wifi size={20} className="text-teal-300" />,
    back: '/',
  },
  nearby: {
    title: 'Popular Nearby',
    subtitle: 'Stores close to your location',
    icon: <Navigation size={20} className="text-purple-200" />,
    back: '/',
  },
  categories: {
    title: 'All Categories',
    subtitle: 'Browse by category',
    icon: <Grid3X3 size={20} className="text-purple-200" />,
    back: '/',
  },
};

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const rawSearch = useSearch();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isSearchPage  = location === '/search';
  const isStoresPage  = location === '/stores' || location.startsWith('/stores?') || location.startsWith('/stores/');
  const isCategoryPage = location === '/categories';

  // Determine section filter
  const params = new URLSearchParams(rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch);
  const filter  = params.get('filter') ?? undefined;           // 'online' | 'nearby'
  const sectionKey = isCategoryPage ? 'categories' : filter;
  const section = sectionKey ? SECTION_META[sectionKey] : null;

  // Whether we're in a "sub-section" that needs the contextual header row
  const hasSubHeader = !!section;
  const roundBottom  = !isSearchPage && !isStoresPage && !isCategoryPage;

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 bg-gradient-to-r from-[#5E2D91] to-[#47206E] text-white rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-white/10 text-white text-xl">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">{user?.name || 'Guest User'}</h2>
            <p className="text-white/80 text-sm">{user?.phone || 'Login to continue'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!user ? (
            <Button
              variant="secondary"
              className="w-full bg-white text-[#5E2D91] hover:bg-white/90 rounded-full"
              onClick={() => setLocation('/login')}
            >
              Login / Register
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full bg-black/10 p-3 rounded-2xl">
              <div>
                <p className="text-xs text-white/70">Loyalty Points</p>
                <p className="font-semibold text-[#F25B57]">{user?.loyaltyPoints || 0} pts</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setLocation('/wallet')}
              >
                Wallet
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {[
          { label: 'Home',      path: '/',          icon: Home },
          { label: 'Orders',    path: '/orders',    icon: ShoppingBag },
          { label: 'Addresses', path: '/addresses', icon: MapPin },
          { label: 'Coupons',   path: '/coupons',   icon: ShoppingBag },
          { label: 'Profile',   path: '/profile',   icon: UserIcon },
        ].map((item) => (
          <Link key={item.path} href={item.path} onClick={() => setIsSidebarOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 text-left font-medium text-foreground hover:bg-surface rounded-2xl h-14"
            >
              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center text-[#5E2D91]">
                <item.icon size={20} />
              </div>
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      {user && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-14"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-[#F8F8FC] flex flex-col overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header
        className={`shrink-0 bg-[#5E2D91] text-white shadow-md z-30 ${roundBottom ? 'rounded-b-[28px]' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #5E2D91 0%, #47206E 100%)',
        }}
      >
        {/* Main row: menu / location / bell */}
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full shrink-0">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px] border-none">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex flex-col">
              <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Delivering to</span>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="truncate max-w-[140px]">Home — Dubai</span>
                <MapPin size={14} className="text-[#F25B57]" />
              </div>
            </div>
          </div>

          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full relative shrink-0">
              <Bell size={22} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#F25B57] rounded-full border border-[#5E2D91]" />
            </Button>
          </Link>
        </div>

        {/* Sub-header row: back + icon + title + subtitle (filtered sections) */}
        {hasSubHeader && section && (
          <div className="flex items-center gap-3 px-4 pb-4">
            <Link href={section.back}>
              <button className="text-white/70 hover:text-white transition-colors shrink-0">
                <ArrowLeft size={22} />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              {section.icon}
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">{section.title}</h1>
                <p className="text-white/65 text-xs">{section.subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <main
        className="flex-1 min-h-0 overflow-y-auto bg-[#F8F8FC] overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        <style>{`main::-webkit-scrollbar { display: none; }`}</style>
        {children}
      </main>

      {/* ── Bottom nav ─────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
