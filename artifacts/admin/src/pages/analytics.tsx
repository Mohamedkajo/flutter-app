import { useGetAnalyticsSummary, useGetOrdersByStatus, useGetRevenueTrend, useGetTopStores, useGetRecentOrders } from "@workspace/api-client-react";
import { PageHeader, StatCard } from "@/components/ui/shared";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Analytics() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: ordersByStatus, isLoading: isLoadingStatus } = useGetOrdersByStatus();
  const { data: revenueTrend, isLoading: isLoadingTrend } = useGetRevenueTrend();
  const { data: topStores, isLoading: isLoadingStores } = useGetTopStores();

  if (isLoadingSummary || isLoadingStatus || isLoadingTrend || isLoadingStores) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Analytics Overview" 
        description="Deep dive into marketplace performance and trends."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Order Value" value={formatCurrency(summary?.avgOrderValue || 0)} />
        <StatCard title="Total Customers" value={formatNumber(summary?.totalCustomers || 0)} />
        <StatCard title="Completion Rate" value={`${summary?.completionRate || 0}%`} />
        <StatCard title="Active Drivers" value={formatNumber(summary?.activeDrivers || 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-lg font-medium mb-6">Revenue & Orders Trend</h3>
          <div className="h-[300px]">
            {revenueTrend && revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-lg font-medium mb-6">Orders by Status</h3>
          <div className="h-[300px]">
            {ordersByStatus && ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
