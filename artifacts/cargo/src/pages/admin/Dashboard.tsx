import { useGetAnalyticsSummary, useGetTopStores, useGetRecentOrders, useGetRevenueTrend } from '@workspace/api-client-react';
import { DollarSign, ShoppingBag, Users, Store, TrendingUp, TrendingDown, Navigation, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: revenueTrend, isLoading: isLoadingTrend } = useGetRevenueTrend();
  const { data: topStores, isLoading: isLoadingStores } = useGetTopStores();
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders();

  const metrics = [
    { title: 'Total Revenue', value: summary?.totalRevenue ? `$${summary.totalRevenue.toFixed(2)}` : '$0.00', icon: DollarSign, trend: '+14.2%', isPositive: true },
    { title: 'Total Orders', value: summary?.totalOrders || 0, icon: ShoppingBag, trend: '+8.1%', isPositive: true },
    { title: 'Active Customers', value: summary?.totalCustomers || 0, icon: Users, trend: '+12.5%', isPositive: true },
    { title: 'Total Stores', value: summary?.totalStores || 0, icon: Store, trend: '+2.4%', isPositive: true },
    { title: 'Active Drivers', value: summary?.activeDrivers || 0, icon: Navigation, trend: '-1.2%', isPositive: false },
    { title: 'Completion Rate', value: summary?.completionRate ? `${summary.completionRate}%` : '0%', icon: TrendingUp, trend: '+0.5%', isPositive: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground">Welcome to the Cargo Admin Dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingSummary ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : (
          metrics.map((metric, i) => (
            <Card key={i} className="rounded-xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/5 text-primary`}>
                  <metric.icon size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${metric.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {metric.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {metric.trend} <span className="text-muted-foreground font-normal ml-1">vs last month</span>
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Platform Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingTrend ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFF4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#7A7A7A'}} dy={10} />
                    <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#7A7A7A'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(94,45,145,0.08)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#5E2D91" strokeWidth={4} dot={{r: 4, fill: '#5E2D91'}} activeDot={{ r: 8, fill: '#5E2D91', stroke: '#fff', strokeWidth: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 rounded-xl border-border/50 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Top Performing Stores</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pr-2">
            {isLoadingStores ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {topStores?.slice(0, 6).map((store, i) => (
                  <div key={store.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={store.logo || store.image} />
                          <AvatarFallback>{store.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {i + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none mb-1 line-clamp-1">{store.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star size={10} className="text-warning fill-warning" />
                          <span>{store.rating} ({store.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingOrders ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    </tr>
                  ))
                ) : (
                  recentOrders?.slice(0, 10).map(order => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-3 font-medium">#{order.id}</td>
                      <td className="px-4 py-3">{order.storeName}</td>
                      <td className="px-4 py-3 font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge className={`border-none ${
                          ['delivered', 'completed'].includes(order.status) ? 'bg-success/10 text-success' :
                          ['cancelled', 'refunded'].includes(order.status) ? 'bg-destructive/10 text-destructive' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

