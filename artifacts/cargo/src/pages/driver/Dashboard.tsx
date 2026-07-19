import { useState } from 'react';
import { useGetDriverEarnings, useUpdateDriverStatus, useGetDriverProfile } from '@workspace/api-client-react';
import { DollarSign, Route, Star, Wallet, Power, Navigation, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { DriverStatusUpdateStatus } from '@workspace/api-client-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DriverDashboard() {
  const { data: profile, isLoading: isLoadingProfile } = useGetDriverProfile();
  const { data: earnings, isLoading: isLoadingEarnings } = useGetDriverEarnings();
  const updateStatus = useUpdateDriverStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleStatus = () => {
    if (!profile) return;
    const newStatus = profile.status === 'online' ? DriverStatusUpdateStatus.offline : DriverStatusUpdateStatus.online;
    
    updateStatus.mutate({ data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: `You are now ${newStatus}` });
        queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
      }
    });
  };

  const isOnline = profile?.status === 'online';

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header & Status Toggle */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 ${isOnline ? 'bg-success/20' : 'bg-muted/20'}`}></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Hello, {profile?.name?.split(' ')[0] || 'Driver'}</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`}></div>
              <span className="text-sm font-medium text-muted-foreground">{isOnline ? 'Online & Ready' : 'Offline'}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleToggleStatus}
            disabled={updateStatus.isPending || isLoadingProfile}
            className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all ${isOnline ? 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20' : 'bg-success hover:bg-success/90 text-white shadow-success/20'}`}
          >
            <Power size={24} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {isLoadingEarnings ? (
          <>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary to-primary-dark text-white">
              <CardContent className="p-4 flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <DollarSign size={16} />
                  <span className="text-xs font-medium">Today's Earnings</span>
                </div>
                <h3 className="text-3xl font-black">${earnings?.todayEarnings?.toFixed(2) || '0.00'}</h3>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4 flex flex-col h-full justify-between">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Route size={16} className="text-primary" />
                  <span className="text-xs font-medium">Deliveries</span>
                </div>
                <h3 className="text-3xl font-black text-foreground">{earnings?.totalDeliveries || 0}</h3>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Weekly Goal Progress */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-surface/50 flex justify-between items-center">
          <h3 className="font-bold text-sm">Weekly Goal Progress</h3>
          <span className="text-xs font-bold text-primary">${earnings?.weekEarnings?.toFixed(2) || '0.00'} / $500.00</span>
        </div>
        <CardContent className="p-4">
          <div className="w-full bg-surface h-3 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-primary h-full rounded-full" 
              style={{ width: `${Math.min(100, ((earnings?.weekEarnings || 0) / 500) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Earn ${(Math.max(0, 500 - (earnings?.weekEarnings || 0))).toFixed(2)} more to hit your weekly goal
          </p>
        </CardContent>
      </Card>

      {/* Earnings Chart */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <div className="p-4 border-b border-border/50 bg-surface/50">
          <h3 className="font-bold text-sm">This Week's Earnings</h3>
        </div>
        <CardContent className="p-4">
          {isLoadingEarnings ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px] w-full">
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
