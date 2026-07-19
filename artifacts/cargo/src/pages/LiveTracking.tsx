import { useRoute, Link } from 'wouter';
import { useGetOrderTracking } from '@workspace/api-client-react';
import { ChevronLeft, MapPin, Phone, Star, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LiveTracking() {
  const [, params] = useRoute('/orders/:orderId/track');
  const orderId = params?.orderId ? parseInt(params.orderId, 10) : 0;

  const { data: tracking, isLoading } = useGetOrderTracking(orderId, { query: { enabled: !!orderId } as any });

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        <Skeleton className="flex-1 w-full" />
        <div className="h-64 bg-white p-4 rounded-t-3xl -mt-6 relative z-10">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-20 w-full rounded-2xl mb-4" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (!tracking) return <div className="p-8 text-center">Tracking info not found</div>;

  return (
    <div className="flex flex-col h-screen bg-surface relative overflow-hidden">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-20">
        <Link href={`/orders/${orderId}`}>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-md border border-border/50">
            <ChevronLeft size={20} />
          </Button>
        </Link>
      </div>

      {/* Map Placeholder */}
      <div className="flex-1 bg-[#E8DDF6] relative flex items-center justify-center">
        {/* Decorative elements for the map placeholder */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5E2D91 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Route Line */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-primary/30 border-t-2 border-dashed border-primary"></div>
        
        {/* Store Pin */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-white px-2 py-1 rounded-md shadow-sm text-[10px] font-bold mb-1">Store</div>
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
            <MapPin size={16} />
          </div>
        </div>

        {/* Driver Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-primary text-white px-2 py-1 rounded-md shadow-sm text-[10px] font-bold mb-1 animate-pulse">ETA {tracking.eta}</div>
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white z-10">
            <Navigation size={20} className="fill-white" />
          </div>
        </div>

        {/* Destination Pin */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
          <div className="bg-white px-2 py-1 rounded-md shadow-sm text-[10px] font-bold mb-1">Home</div>
          <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
            <MapPin size={16} className="fill-white" />
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white p-5 rounded-t-[32px] shadow-[0_-10px_40px_rgba(94,45,145,0.1)] relative z-20 -mt-6">
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4"></div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Arriving in {tracking.eta}</h2>
          <p className="text-sm text-muted-foreground">{tracking.status.replace('_', ' ')}</p>
        </div>

        {tracking.driverName && (
          <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border/50 mb-6">
            <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
              <AvatarImage src={tracking.driverAvatar || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{tracking.driverName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-base">{tracking.driverName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <Star size={14} className="text-warning fill-warning" />
                <span className="font-medium text-foreground">{tracking.driverRating || '4.9'}</span>
                <span>• Courier</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 shadow-md">
                <Phone size={18} />
              </Button>
            </div>
          </div>
        )}

        <div className="bg-surface p-4 rounded-2xl border border-border/50">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-primary">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Delivery Address</p>
              <p className="text-sm font-semibold leading-tight">{tracking.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
