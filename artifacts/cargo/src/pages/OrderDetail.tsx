import { useRoute, Link } from 'wouter';
import { useGetOrder } from '@workspace/api-client-react';
import { ChevronLeft, MapPin, Receipt, Clock, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderDetail() {
  const [, params] = useRoute('/orders/:orderId');
  const orderId = params?.orderId ? parseInt(params.orderId, 10) : 0;

  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } as any });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const isActive = !['delivered', 'completed', 'cancelled', 'refunded', 'returned'].includes(order.status);

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Order #{order.id}</h1>
        </div>
        {order.invoice && (
          <Button variant="outline" size="sm" className="rounded-full text-primary border-primary">
            <Receipt size={16} className="mr-2" /> Receipt
          </Button>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Order Status</h2>
            <Badge className="bg-primary/10 text-primary border-none">
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="space-y-6 mt-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {order.timeline?.map((event, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.completed ? 'bg-primary text-white' : 'text-muted-foreground'}`}>
                  {event.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-2xl border border-border/50 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-sm">{event.label}</span>
                    <span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isActive && (
            <div className="mt-6 pt-4 border-t border-divider">
              <Link href={`/orders/${order.id}/track`}>
                <Button className="w-full rounded-full h-12 bg-primary">
                  <MapPin size={18} className="mr-2" /> Track Order Live
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 mb-4 border-b border-divider pb-4">
            <div className="w-12 h-12 rounded-xl bg-surface overflow-hidden">
              <img src={order.storeImage || ''} alt={order.storeName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-base">{order.storeName}</h3>
              <p className="text-sm text-muted-foreground">{order.items?.length || 0} items</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div className="flex gap-3">
                  <span className="font-bold text-primary">{item.quantity}x</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                    {item.addons && item.addons.length > 0 && <p className="text-xs text-muted-foreground">+{item.addons.join(', ')}</p>}
                  </div>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-divider pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee?.toFixed(2)}</span>
            </div>
            {order.discount ? (
              <div className="flex justify-between text-accent font-medium">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between items-center pt-2 font-bold text-lg border-t border-divider border-dashed mt-2">
              <span>Total</span>
              <span className="text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icons for timeline
function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function Circle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
