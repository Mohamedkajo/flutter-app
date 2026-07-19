import { 
  useGetAdminReportSummary, 
  useGetRevenueTrend, 
  useGetRecentOrders, 
  useGetTopStores 
} from "@workspace/api-client-react";
import { PageHeader, StatCard } from "@/components/ui/shared";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { Users, Store, ShoppingCart, DollarSign, Package, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAdminReportSummary();
  const { data: revenueTrend, isLoading: isLoadingTrend } = useGetRevenueTrend();
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders();
  const { data: topStores, isLoading: isLoadingStores } = useGetTopStores();

  if (isLoadingSummary || isLoadingTrend || isLoadingOrders || isLoadingStores) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Live platform health and KPIs."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(summary?.totalRevenue || 0)} 
          icon={DollarSign}
          trend={`${formatCurrency(summary?.revenueToday || 0)} today`}
          trendUp={true}
        />
        <StatCard 
          title="Total Orders" 
          value={formatNumber(summary?.totalOrders || 0)} 
          icon={ShoppingCart}
          trend={`${summary?.ordersToday || 0} today`}
          trendUp={true}
        />
        <StatCard 
          title="Active Users" 
          value={formatNumber(summary?.totalUsers || 0)} 
          icon={Users}
          trend={`${summary?.newUsersToday || 0} today`}
          trendUp={true}
        />
        <StatCard 
          title="Total Stores" 
          value={formatNumber(summary?.totalStores || 0)} 
          icon={Store}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-medium mb-4">Revenue Trend (30 Days)</h3>
            <div className="h-[300px]">
              {revenueTrend && revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No trend data available</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-medium mb-4">Recent Orders Feed</h3>
            <div className="space-y-4">
              {recentOrders?.map(order => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">
                      #{order.id}
                    </div>
                    <div>
                      <div className="font-medium">{order.storeName}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                    <div className="text-sm font-mono text-muted-foreground">{order.status}</div>
                  </div>
                </div>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <div className="text-center text-muted-foreground py-4 text-sm">No recent orders</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-medium mb-4">Top Performing Stores</h3>
            <div className="space-y-4">
              {topStores?.map((store, index) => (
                <div key={store.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-muted-foreground text-sm">{index + 1}.</div>
                    <div>
                      <div className="font-medium text-sm">{store.name}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber((store as any).totalOrders || 0)} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency((store as any).totalRevenue || 0)}</div>
                  </div>
                </div>
              ))}
              {(!topStores || topStores.length === 0) && (
                <div className="text-center text-muted-foreground py-4 text-sm">No store data</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm bg-primary text-primary-foreground">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> 
              System Health
            </h3>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex justify-between">
                <span>Pending Orders</span>
                <span className="font-mono font-bold text-primary-foreground">{summary?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Drivers</span>
                <span className="font-mono font-bold text-primary-foreground">{summary?.activeDrivers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate</span>
                <span className="font-mono font-bold text-primary-foreground">{summary?.completionRate ? `${summary.completionRate}%` : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
