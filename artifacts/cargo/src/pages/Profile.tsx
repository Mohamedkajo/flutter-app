import { Link, useLocation } from 'wouter';
import { useGetUserProfile } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User as UserIcon, 
  Settings, 
  MapPin, 
  Wallet, 
  Heart, 
  Bell, 
  CircleHelp, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  const { data: profile, isLoading } = useGetUserProfile({ query: { enabled: !!user } as any });

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (!user) {
    setLocation('/login');
    return null;
  }

  const menuItems = [
    { icon: MapPin, label: 'Saved Addresses', path: '/addresses' },
    { icon: Wallet, label: 'Payment Methods', path: '/wallet' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: ShieldCheck, label: 'Security & Privacy', path: '#' },
    { icon: CircleHelp, label: 'Help & Support', path: '#' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-8">
      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="w-20 h-20 border-4 border-white shadow-md">
              <AvatarImage src={profile?.avatar || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile?.name}</h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              {profile?.phone && <p className="text-sm text-muted-foreground mt-0.5">{profile.phone}</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/wallet">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white shadow-lg shadow-primary/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              <Wallet size={24} className="mb-2 text-white/80" />
              <p className="text-sm text-white/80 font-medium">Wallet Balance</p>
              <p className="text-xl font-bold mt-1">$45.00</p>
            </div>
          </Link>
          
          <div className="bg-gradient-to-br from-warning to-orange-400 rounded-2xl p-4 text-white shadow-lg shadow-warning/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <Gift size={24} className="mb-2 text-white/80" />
            <p className="text-sm text-white/80 font-medium">Cargo Points</p>
            <p className="text-xl font-bold mt-1">{profile?.loyaltyPoints || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-2 shadow-sm border border-border/50">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.path}>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <item.icon size={20} />
                  </div>
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-6 h-14 rounded-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold text-base transition-all"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
