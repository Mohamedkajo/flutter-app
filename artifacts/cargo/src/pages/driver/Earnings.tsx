import { useGetDriverEarnings } from '@workspace/api-client-react';
import { DollarSign, Route, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DriverEarnings() {
  const { data: earnings, isLoading } = useGetDriverEarnings();

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Earnings</h1>
        <p className="text-muted-foreground text-sm">Your delivery earnings summary</p>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <p className="text-white/80 text-sm font-medium mb-1 relative z-10">Pending Payout</p>
        <div className="flex items-end gap-2 mb-6 relative z-10">
          <span className="text-4xl font-black">${earnings?.pendingPayout?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">This Week</p>
                <h3 className="text-xl font-bold text-foreground">${earnings?.weekEarnings?.toFixed(2) || '0.00'}</h3>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">This Month</p>
                <h3 className="text-xl font-bold text-foreground">${earnings?.monthEarnings?.toFixed(2) || '0.00'}</h3>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-surface/50">
          <h3 className="font-bold text-sm">Earnings History</h3>
        </div>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earnings?.dailyBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFF4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#7A7A7A'}} dy={10} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', {weekday: 'short'})} />
                  <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#7A7A7A'}} dx={-10} width={40} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(94,45,145,0.08)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earned']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#5E2D91" strokeWidth={3} dot={{r: 4, fill: '#5E2D91'}} activeDot={{ r: 6, fill: '#5E2D91', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
