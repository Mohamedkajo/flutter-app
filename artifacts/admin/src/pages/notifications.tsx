import { useState } from "react";
import { 
  useListAdminNotifications, 
  useBroadcastNotification,
  getListAdminNotificationsQueryKey 
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BellRing, Send, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListAdminNotifications({ limit: 50 });
  
  const broadcastMutation = useBroadcastNotification();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    body: "",
    type: "system",
    targetRole: "all"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) return;

    broadcastMutation.mutate({ data: formData }, {
      onSuccess: (res: any) => {
        toast.success(`Broadcast sent to ${res.sent} users`);
        queryClient.invalidateQueries({ queryKey: getListAdminNotificationsQueryKey() });
        setIsDialogOpen(false);
        setFormData({ title: "", body: "", type: "system", targetRole: "all" });
      },
      onError: () => toast.error("Failed to broadcast notification")
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notifications" 
        description="System logs and global communication." 
        action={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Send className="w-4 h-4 mr-2" /> Broadcast Message
          </Button>
        }
      />

      <div className="border rounded-xl bg-card">
        <div className="p-4 border-b font-medium text-sm flex items-center gap-2">
          <BellRing className="w-4 h-4" />
          Recent Platform Notifications
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading notifications...</div>
          ) : notifications?.length === 0 ? (
            <div className="p-12">
              <EmptyState title="No notifications" description="No system notifications sent yet." icon={BellRing} />
            </div>
          ) : (
            notifications?.map((note) => (
              <div key={note.id} className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  note.type === 'promo' ? 'bg-pink-100 text-pink-600 border-pink-200' :
                  note.type === 'system' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{note.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{note.body}</p>
                  <div className="text-xs font-mono text-muted-foreground mt-2">{formatDate(note.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broadcast Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={formData.targetRole} onValueChange={(val) => setFormData({...formData, targetRole: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="customer">Customers Only</SelectItem>
                  <SelectItem value="merchant">Merchants Only</SelectItem>
                  <SelectItem value="driver">Drivers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Notice</SelectItem>
                  <SelectItem value="promo">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. System Maintenance"
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea 
                id="body" 
                rows={4}
                placeholder="Write your message here..."
                value={formData.body} 
                onChange={e => setFormData({ ...formData, body: e.target.value })} 
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={broadcastMutation.isPending}>
                Send Broadcast
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
