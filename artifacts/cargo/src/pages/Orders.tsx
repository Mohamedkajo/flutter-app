import { Link } from 'wouter';
import { useListOrders } from '@workspace/api-client-react';
import { ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function Orders() {
  const { user } = useAuth();
  const { data: activeOrders, isLoading: isLoadingActive } = useListOrders({ status: 'pending,accepted,preparing,packed,driver_assigned,picked_up,delivering' }, { query: { enabled: !!user } as any });
  const { data: pastOrders, isLoading: isLoadingPast } = useListOrders({ status: 'delivered,completed,cancelled,refunded,returned' }, { query: { enabled: !!user } as any });

  const getStatusColor = (status: string) => {
    if (['delivered', 'completed'].includes(status)) return 'bg-success/10 text-success';
    if (['cancelled', 'refunded', 'returned'].includes(status)) return 'bg-destructive/10 text-destructive';
    return 'bg-primary/10 text-primary';
  };

  const getStatusIcon = (status: string) => {
    if (['delivered', 'completed'].includes(status)) return <CheckCircle2 size={16} className="text-success mr-1" />;
    if (['cancelled', 'refunded', 'returned'].includes(status)) return <XCircle size={16} className="text-destructive mr-1" />;
    return <Clock size={16} className="text-primary mr-1" />;
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const OrderList = ({ orders, isLoading, emptyMessage }: any) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      );
    }

    if (!orders || orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 text-primary/40">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-lg font-bold">No orders found</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order: any) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-surface rounded-xl overflow-hidden">
                    <img src={order.storeImage || 'https://placehold.co/100x100?text=Store'} alt={order.storeName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{order.storeName}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-bold">${order.total.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-divider">
                <Badge className={`${getStatusColor(order.status)} border-none flex items-center`}>
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </Badge>
                
                <div className="flex items-center text-xs font-semibold text-primary">
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4 px-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white rounded-full p-1 h-12 shadow-sm border border-border/50 mb-6">
          <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Active Orders</TabsTrigger>
          <TabsTrigger value="past" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Past Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <OrderList orders={activeOrders} isLoading={isLoadingActive} emptyMessage="You don't have any active orders right now." />
        </TabsContent>
        
        <TabsContent value="past">
          <OrderList orders={pastOrders} isLoading={isLoadingPast} emptyMessage="You don't have any past orders yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
