import { Link } from 'wouter';
import { useListNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { ChevronLeft, Bell, Package, Tag, Info, Navigation, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useListNotifications({ query: { enabled: !!user } as any });
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();

  const handleMarkRead = (id: number) => {
    markRead.mutate(
      { notificationId: id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) }
    );
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'order': return <Package size={20} className="text-primary" />;
      case 'promo': return <Tag size={20} className="text-accent" />;
      case 'driver': return <Navigation size={20} className="text-warning" />;
      case 'chat': return <MessageCircle size={20} className="text-blue-500" />;
      default: return <Info size={20} className="text-muted-foreground" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'order': return 'bg-primary/10';
      case 'promo': return 'bg-accent/10';
      case 'driver': return 'bg-warning/10';
      case 'chat': return 'bg-blue-500/10';
      default: return 'bg-surface';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : notifications?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications?.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-2xl flex gap-4 shadow-sm border transition-colors ${notification.isRead ? 'bg-white border-border/50 opacity-70' : 'bg-white border-primary/20 shadow-md shadow-primary/5'}`}
              onClick={() => !notification.isRead && handleMarkRead(notification.id)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${notification.isRead ? 'font-medium text-foreground' : 'font-bold text-primary'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">{notification.body}</p>
                {notification.orderId && (
                  <Link href={`/orders/${notification.orderId}`}>
                    <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold mt-2">View Order</Button>
                  </Link>
                )}
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
