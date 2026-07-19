import { useState } from 'react';
import { useListMerchantOrders } from '@workspace/api-client-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Package, Truck } from 'lucide-react';

export default function MerchantOrders() {
  const [activeTab, setActiveTab] = useState('pending');
  const { data: orders, isLoading } = useListMerchantOrders({ status: activeTab });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="mr-1" />;
      case 'preparing': return <Package size={16} className="mr-1" />;
      case 'ready': return <CheckCircle size={16} className="mr-1" />;
      case 'delivering': return <Truck size={16} className="mr-1" />;
      default: return <Clock size={16} className="mr-1" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'preparing': return 'bg-blue-500/10 text-blue-500';
      case 'ready': return 'bg-success/10 text-success';
      case 'delivering': return 'bg-primary/10 text-primary';
      default: return 'bg-surface text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage your incoming and active orders.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-border/50 h-12 p-1 rounded-xl shadow-sm mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Pending</TabsTrigger>
          <TabsTrigger value="preparing" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Preparing</TabsTrigger>
          <TabsTrigger value="ready" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Ready for Pickup</TabsTrigger>
          <TabsTrigger value="delivering" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Delivering</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0 space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
          ) : orders?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-border/50">
              <Package size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-bold">No orders found</h3>
              <p className="text-muted-foreground">There are no orders with status "{activeTab}".</p>
            </div>
          ) : (
            orders?.map(order => (
              <Card key={order.id} className="rounded-xl border-border/50 shadow-sm overflow-hidden">
                <div className="bg-surface p-4 border-b border-border/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    <Badge className={`${getStatusColor(activeTab)} border-none shadow-none font-bold uppercase text-[10px]`}>
                      {getStatusIcon(activeTab)}
                      {activeTab}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      {(order as any).items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-start text-sm">
                          <div className="flex gap-3">
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{item.quantity}x</span>
                            <div>
                              <p className="font-semibold text-foreground">{item.name}</p>
                              {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                              {item.addons && item.addons.length > 0 && <p className="text-xs text-muted-foreground">+{item.addons.join(', ')}</p>}
                              {item.specialInstructions && <p className="text-xs text-warning mt-1 bg-warning/10 p-1 rounded">Note: {item.specialInstructions}</p>}
                            </div>
                          </div>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface p-4 border-t border-border/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'pending' && (
                        <>
                          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white rounded-lg">Reject</Button>
                          <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg">Accept Order</Button>
                        </>
                      )}
                      {activeTab === 'preparing' && (
                        <Button className="bg-success hover:bg-success/90 text-white rounded-lg">Mark as Ready</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
