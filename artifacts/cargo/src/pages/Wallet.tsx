import { Link } from 'wouter';
import { useGetWallet, useListWalletTransactions } from '@workspace/api-client-react';
import { ChevronLeft, Plus, ArrowDownRight, ArrowUpRight, Gift, CreditCard, Banknote, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  const { data: wallet, isLoading: isLoadingWallet } = useGetWallet({ query: { enabled: !!user } as any });
  const { data: transactions, isLoading: isLoadingTx } = useListWalletTransactions({ query: { enabled: !!user } as any });

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">My Wallet</h1>
      </div>

      <div className="px-4 space-y-6">
        {isLoadingWallet ? (
          <Skeleton className="h-48 w-full rounded-[32px]" />
        ) : (
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <p className="text-white/80 text-sm font-medium mb-1 relative z-10">Available Balance</p>
            <div className="flex items-end gap-2 mb-8 relative z-10">
              <span className="text-4xl font-bold">${wallet?.balance?.toFixed(2) || '0.00'}</span>
              <span className="text-white/80 pb-1">{wallet?.currency || 'USD'}</span>
            </div>
            
            <div className="flex gap-3 relative z-10">
              <Button className="flex-1 bg-white text-primary hover:bg-white/90 rounded-xl h-12 font-bold shadow-md">
                <Plus size={18} className="mr-2" /> Top Up
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl h-12 font-bold">
                Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Loyalty Points */}
        {!isLoadingWallet && wallet?.loyaltyPoints !== undefined && (
          <div className="bg-gradient-to-r from-warning/20 to-warning/5 rounded-2xl p-4 flex items-center justify-between border border-warning/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Cargo Points</p>
                <p className="text-xs text-muted-foreground">{wallet.loyaltyPoints} points available</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-warning hover:bg-warning/10 font-bold">
              Redeem
            </Button>
          </div>
        )}

        {/* Transactions */}
        <div>
          <h2 className="font-bold text-lg mb-4">Recent Transactions</h2>
          
          {isLoadingTx ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock size={40} className="mx-auto mb-4 opacity-20" />
              <p>No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => {
                const isCredit = ['credit', 'refund', 'reward'].includes(tx.type);
                const Icon = tx.type === 'reward' ? Gift : (tx.type === 'credit' ? CreditCard : Banknote);
                
                return (
                  <div key={tx.id} className="bg-white p-4 rounded-2xl border border-border/50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        {isCredit ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isCredit ? 'text-success' : 'text-foreground'}`}>
                        {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                      </p>
                      {tx.type === 'reward' && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-warning/50 text-warning">Reward</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
