import { useState } from "react";
import { useListAdminTransactions } from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, RefreshCcw, Gift } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WalletPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: transactions, isLoading } = useListAdminTransactions({ 
    type: typeFilter !== "all" ? typeFilter : undefined,
    limit: 100
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'credit': return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'debit': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'refund': return <RefreshCcw className="w-4 h-4 text-blue-600" />;
      case 'reward': return <Gift className="w-4 h-4 text-purple-600" />;
      default: return <WalletIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Global Ledger" description="View all wallet transactions across the platform." />

      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px] bg-card">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credits</SelectItem>
            <SelectItem value="debit">Debits</SelectItem>
            <SelectItem value="refund">Refunds</SelectItem>
            <SelectItem value="reward">Rewards</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading ledger...</td>
                </tr>
              ) : transactions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState title="No transactions" description="Ledger is currently empty." icon={WalletIcon} />
                  </td>
                </tr>
              ) : (
                transactions?.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium capitalize">
                        {getIcon(tx.type)}
                        {tx.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{formatDate(tx.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{tx.userName}</div>
                      <div className="text-muted-foreground text-xs font-mono">{tx.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tx.description}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{tx.orderId ? `#${tx.orderId}` : '-'}</td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${
                      tx.type === 'debit' ? 'text-foreground' : 'text-green-600'
                    }`}>
                      {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
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
