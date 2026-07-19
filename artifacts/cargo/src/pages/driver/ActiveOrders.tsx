import { useState } from 'react';
import { useListDriverOrders } from '@workspace/api-client-react';
import { MapPin, Navigation, Clock, Package, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ActiveOrders() {
  const [activeTab, setActiveTab] = useState('active');
  const { data: orders, isLoading } = useListDriverOrders();

  const activeOrders = orders?.filter(o => ['driver_assigned', 'picked_up', 'delivering'].includes(o.status)) || [];
  const availableOrders = orders?.filter(o => o.status === 'packed') || []; // Orders ready for pickup

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage your deliveries</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-border/50 h-12 p-1 rounded-full shadow-sm mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Active Delivery</TabsTrigger>
          <TabsTrigger value="available" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Available</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0 space-y-4">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-border/50">
              <Package size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-bold">No active delivery</h3>
              <p className="text-muted-foreground text-sm">You are currently not assigned to any order.</p>
            </div>
          ) : (
            activeOrders.map(order => (
              <Card key={order.id} className="rounded-3xl border-border/50 shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                <CardContent className="p-0">
                  <div className="p-5 border-b border-border/50 bg-white relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className="bg-primary/10 text-primary border-none mb-2 px-3 py-1 font-bold text-xs uppercase tracking-wider">
                          {order.status.replace('_', ' ')}
                        </Badge>
                        <h3 className="font-bold text-xl">Order #{order.id}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-muted-foreground">Earning</p>
                        <p className="text-xl font-black text-primary">${order.deliveryFee?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-surface relative z-10 space-y-6">
                    <div className="relative before:absolute before:top-6 before:bottom-6 before:left-5 before:w-0.5 before:bg-border before:z-0">
                      {/* Store */}
                      <div className="flex gap-4 relative z-10 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white border-4 border-surface shadow-sm flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pickup From</p>
                          <p className="font-semibold text-base">{order.storeName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Downtown Dubai Mall, Store #42</p>
                        </div>
                      </div>
                      
                      {/* Customer */}
                      <div className="flex gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white border-4 border-surface shadow-sm flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deliver To</p>
                          <p className="font-semibold text-base">Customer</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-white border-t border-border/50 relative z-10 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl h-12 border-primary text-primary font-bold">
                      View Details
                    </Button>
                    <Button className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20">
                      <Navigation size={18} className="mr-2 fill-white" /> Navigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-0 space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
          ) : availableOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-border/50">
              <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg font-bold">No new orders</h3>
              <p className="text-muted-foreground text-sm">Stay online to receive new delivery requests.</p>
            </div>
          ) : (
            availableOrders.map(order => (
              <Card key={order.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface overflow-hidden shrink-0">
                        <img src={order.storeImage || ''} alt={order.storeName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold">{order.storeName}</h3>
                        <p className="text-xs text-muted-foreground">3.2 km away • 12 mins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-lg">${order.deliveryFee?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button variant="outline" className="flex-1 rounded-lg text-destructive border-destructive/30 hover:bg-destructive hover:text-white">Decline</Button>
                    <Button className="flex-1 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md">Accept Order</Button>
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
