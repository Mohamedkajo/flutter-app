import { useState } from "react";
import { useListAdminContactMessages, useUpdateAdminContactMessage, useDeleteAdminContactMessage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2, Reply, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Msg = { id: number; name: string; email: string; phone?: string; subject: string; message: string; isRead: boolean; repliedAt?: string; createdAt: string };

export default function ContactPage() {
  const qc = useQueryClient();
  const { data: messages = [], isLoading } = useListAdminContactMessages();
  const updateMsg = useUpdateAdminContactMessage();
  const deleteMsg = useDeleteAdminContactMessage();
  const [selected, setSelected] = useState<Msg | null>(null);

  const unread = (messages as Msg[]).filter(m => !m.isRead).length;

  const open = async (msg: Msg) => {
    setSelected(msg);
    if (!msg.isRead) {
      await updateMsg.mutateAsync({ messageId: msg.id, data: { isRead: true } });
      qc.invalidateQueries({ queryKey: ["/admin/contact"] });
    }
  };

  const markReplied = async (id: number) => {
    await updateMsg.mutateAsync({ messageId: id, data: { markReplied: true } as any });
    qc.invalidateQueries({ queryKey: ["/admin/contact"] });
    toast.success("Marked as replied");
    setSelected(null);
  };

  const del = async (id: number) => {
    if (!confirm("Delete message?")) return;
    await deleteMsg.mutateAsync({ messageId: id });
    qc.invalidateQueries({ queryKey: ["/admin/contact"] });
    toast.success("Deleted");
    setSelected(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6" /> Contact Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">{(messages as Msg[]).length} total · {unread > 0 && <span className="text-destructive font-medium">{unread} unread</span>}</p>
        </div>
        {unread > 0 && <Badge variant="destructive">{unread} New</Badge>}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: "Total", value: (messages as Msg[]).length, color: "bg-primary/10 text-primary" },
          { label: "Unread", value: unread, color: "bg-destructive/10 text-destructive" },
          { label: "Replied", value: (messages as Msg[]).filter(m => m.repliedAt).length, color: "bg-green-500/10 text-green-600" }
        ].map(s => (
          <div key={s.label} className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {(messages as Msg[]).map(msg => (
            <div key={msg.id} onClick={() => open(msg)}
              className={`border rounded-lg p-4 bg-card cursor-pointer hover:border-primary/40 transition-colors ${!msg.isRead ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${!msg.isRead ? "text-primary" : "text-muted-foreground"}`}>
                    {msg.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${!msg.isRead ? "text-primary" : ""}`}>{msg.name}</span>
                      <span className="text-xs text-muted-foreground">{msg.email}</span>
                      {msg.repliedAt && <Badge variant="outline" className="text-xs text-green-600">Replied</Badge>}
                    </div>
                    <p className="font-medium mt-0.5">{msg.subject}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{msg.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); del(msg.id); }}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {(messages as Msg[]).length === 0 && <div className="text-center py-12 text-muted-foreground">No contact messages yet.</div>}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{selected.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                {selected.phone && <div><span className="text-muted-foreground">Phone:</span> {selected.phone}</div>}
                <div><span className="text-muted-foreground">Date:</span> {new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/40 text-sm whitespace-pre-wrap">{selected.message}</div>
              <div className="flex gap-2 justify-end">
                {!selected.repliedAt && (
                  <Button variant="outline" size="sm" onClick={() => markReplied(selected.id)}>
                    <Reply className="w-4 h-4 mr-1" />Mark Replied
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`)}>
                  <Mail className="w-4 h-4 mr-1" />Reply via Email
                </Button>
                <Button variant="destructive" size="sm" onClick={() => del(selected.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
