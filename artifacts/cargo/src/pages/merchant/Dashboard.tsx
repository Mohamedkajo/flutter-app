import { useGetAnalyticsSummary, useGetRevenueTrend, useGetRecentOrders } from '@workspace/api-client-react';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MerchantDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: revenueTrend, isLoading: isLoadingTrend } = useGetRevenueTrend();
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders();

  const metrics = [
    { title: 'Total Revenue', value: summary?.totalRevenue ? `$${summary.totalRevenue.toFixed(2)}` : '$0.00', icon: DollarSign, trend: '+12.5%', isPositive: true },
    { title: 'Total Orders', value: summary?.totalOrders || 0, icon: ShoppingBag, trend: '+8.2%', isPositive: true },
    { title: 'Pending Orders', value: summary?.pendingOrders || 0, icon: ShoppingBag, trend: '-2.4%', isPositive: false },
    { title: 'Avg Order Value', value: summary?.avgOrderValue ? `$${summary.avgOrderValue.toFixed(2)}` : '$0.00', icon: TrendingUp, trend: '+5.1%', isPositive: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Here's what's happening with your store today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingSummary ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : (
          metrics.map((metric, i) => (
            <Card key={i} className="rounded-xl border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${metric.title === 'Pending Orders' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                  <metric.icon size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${metric.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {metric.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {metric.trend} <span className="text-muted-foreground font-normal ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingTrend ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFF4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#7A7A7A'}} dy={10} />
                    <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#7A7A7A'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(94,45,145,0.08)' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#5E2D91" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#5E2D91', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders?.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium leading-none mb-1">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
                      <p className="text-[10px] uppercase font-bold text-warning">{order.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
