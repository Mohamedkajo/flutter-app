import { useState } from "react";
import { useGetRevenueReport } from "@workspace/api-client-react";
import { PageHeader, StatCard } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { FileText, Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState<any>("day");
  
  const { data: report, isLoading } = useGetRevenueReport({ 
    groupBy 
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Revenue Reports" 
        description="Financial breakdown and settlement data."
        action={
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className="flex gap-4">
        <Select value={groupBy} onValueChange={setGroupBy}>
          <SelectTrigger className="w-[200px] bg-card">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Group By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Generating report...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Gross Revenue" value={formatCurrency(report?.totalRevenue || 0)} />
            <StatCard title="Refunds" value={formatCurrency(report?.refundedAmount || 0)} />
            <StatCard title="Net Revenue" value={formatCurrency(report?.netRevenue || (report?.totalRevenue || 0) - (report?.refundedAmount || 0))} />
            <StatCard title="Avg. Order Value" value={formatCurrency(report?.avgOrderValue || 0)} />
          </div>

          <div className="p-6 rounded-xl border bg-card shadow-sm">
            <h3 className="text-lg font-medium mb-6">Revenue Chart</h3>
            <div className="h-[400px]">
              {report?.points && report.points.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.points}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} cursor={{fill: "hsl(var(--muted)/0.5)"}} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available for this period</div>
              )}
            </div>
          </div>
          
          <div className="p-6 rounded-xl border bg-card shadow-sm">
            <h3 className="text-lg font-medium mb-6">Top Revenue Drivers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Store</th>
                    <th className="px-6 py-4 font-medium text-right">Orders</th>
                    <th className="px-6 py-4 text-right font-medium">Generated Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.topStores?.map((store: any, idx: number) => (
                    <tr key={store.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <span className="text-muted-foreground w-4">{idx + 1}.</span> {store.name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{formatNumber(store.totalOrders || 0)}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-primary">{formatCurrency(store.totalRevenue || 0)}</td>
                    </tr>
                  ))}
                  {(!report?.topStores || report.topStores.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No store data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
