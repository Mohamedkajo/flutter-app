import { useState } from "react";
import { useListAdminFlashSales, useCreateAdminFlashSale, useUpdateAdminFlashSale, useDeleteAdminFlashSale } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Zap, Clock, Percent } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Sale = { id: number; title: string; description?: string; bannerImage?: string; endsAt: string; discountPercent: number; isActive: boolean; productCount?: number; createdAt: string };

export default function FlashSalesPage() {
  const qc = useQueryClient();
  const { data: sales = [], isLoading } = useListAdminFlashSales();
  const create = useCreateAdminFlashSale();
  const update = useUpdateAdminFlashSale();
  const remove = useDeleteAdminFlashSale();

  const emptyForm = { title: "", description: "", bannerImage: "", endsAt: "", discountPercent: 20, isActive: true };
  const [dialog, setDialog] = useState<{ open: boolean; sale?: Sale }>({ open: false });
  const [form, setForm] = useState<any>(emptyForm);

  const openEdit = (sale: Sale) => {
    setForm({ title: sale.title, description: sale.description || "", bannerImage: sale.bannerImage || "", endsAt: sale.endsAt.slice(0, 16), discountPercent: sale.discountPercent, isActive: sale.isActive });
    setDialog({ open: true, sale });
  };

  const save = async () => {
    if (!form.title || !form.endsAt || !form.discountPercent) { toast.error("Fill required fields"); return; }
    const payload = { ...form, discountPercent: Number(form.discountPercent) };
    try {
      if (dialog.sale) await update.mutateAsync({ saleId: dialog.sale.id, data: payload });
      else await create.mutateAsync({ data: payload });
      qc.invalidateQueries({ queryKey: ["/admin/flash-sales"] });
      toast.success("Saved");
      setDialog({ open: false });
    } catch { toast.error("Failed"); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this flash sale?")) return;
    await remove.mutateAsync({ saleId: id });
    qc.invalidateQueries({ queryKey: ["/admin/flash-sales"] });
    toast.success("Deleted");
  };

  const toggle = async (sale: Sale) => {
    await update.mutateAsync({ saleId: sale.id, data: { isActive: !sale.isActive } as any });
    qc.invalidateQueries({ queryKey: ["/admin/flash-sales"] });
  };

  const timeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h left`;
    return `${h}h ${Math.floor((diff % 3600000) / 60000)}m left`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6" /> Flash Sales</h1>
          <p className="text-muted-foreground text-sm mt-1">{(sales as Sale[]).filter(s => s.isActive).length} active · {(sales as Sale[]).length} total</p>
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setDialog({ open: true }); }}><Plus className="w-4 h-4 mr-1" />New Flash Sale</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(sales as Sale[]).map(sale => (
            <div key={sale.id} className="border rounded-lg bg-card overflow-hidden">
              {sale.bannerImage && <img src={sale.bannerImage} alt="" className="w-full h-32 object-cover" onError={e => (e.currentTarget.style.display="none")} />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={sale.isActive ? "default" : "secondary"}>{sale.isActive ? "Active" : "Inactive"}</Badge>
                      <span className="text-2xl font-bold text-primary flex items-center gap-0.5">{sale.discountPercent}<Percent className="w-4 h-4" /></span>
                    </div>
                    <h3 className="font-semibold">{sale.title}</h3>
                    {sale.description && <p className="text-sm text-muted-foreground">{sale.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{timeLeft(sale.endsAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch checked={sale.isActive} onCheckedChange={() => toggle(sale)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(sale)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(sale.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(sales as Sale[]).length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-20" />
              No flash sales yet. Create one above.
            </div>
          )}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{dialog.sale ? "Edit Flash Sale" : "New Flash Sale"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Summer Mega Sale" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Banner Image URL</Label><Input value={form.bannerImage} onChange={e => setForm((f: any) => ({ ...f, bannerImage: e.target.value }))} placeholder="https://..." /></div>
            {form.bannerImage && <img src={form.bannerImage} alt="" className="w-full h-24 object-cover rounded" onError={() => {}} />}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Discount % *</Label><Input type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm((f: any) => ({ ...f, discountPercent: e.target.value }))} /></div>
              <div><Label>Ends At *</Label><Input type="datetime-local" value={form.endsAt} onChange={e => setForm((f: any) => ({ ...f, endsAt: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm((f: any) => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
