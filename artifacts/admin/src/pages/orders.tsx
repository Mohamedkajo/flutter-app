import { useState } from "react";
import { 
  useListAdminOrders, 
  useUpdateAdminOrder, 
  getListAdminOrdersQueryKey 
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShoppingCart, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-900/30",
  accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  preparing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
  packed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30",
  driver_assigned: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  picked_up: "bg-pink-100 text-pink-700 dark:bg-pink-900/30",
  delivering: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30",
  refunded: "bg-red-100 text-red-700 dark:bg-red-900/30",
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: orders, isLoading } = useListAdminOrders({ 
    status: statusFilter !== "all" ? statusFilter : undefined
  });
  
  const updateMutation = useUpdateAdminOrder();

  const handleUpdateStatus = (id: number, status: any) => {
    updateMutation.mutate({ orderId: id, data: { status } }, {
      onSuccess: () => {
        toast.success("Order status updated");
        queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
      },
      onError: () => toast.error("Failed to update status")
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders Terminal" description="Live view of all marketplace transactions." />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-card">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_COLORS).map(s => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Store</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading orders...</td>
                </tr>
              ) : orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState title="No orders found" description="Try a different filter." icon={ShoppingCart} />
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">#{order.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 font-medium">{order.storeName}</td>
                    <td className="px-6 py-4 font-mono font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select 
                        value={order.status} 
                        onValueChange={(val) => handleUpdateStatus(order.id, val)}
                      >
                        <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {Object.keys(STATUS_COLORS).map(s => (
                            <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ').toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
