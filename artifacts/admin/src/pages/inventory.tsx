import { useState } from "react";
import { useListAdminInventory, useAdjustAdminStock, useListProductStockHistory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Search, TrendingUp, TrendingDown, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Item = { productId: number; productName: string; image?: string; storeId: number; storeName: string; stockQuantity: number; lowStockThreshold: number; isAvailable: boolean; status: string; price: number };

const STATUS_STYLES = {
  in_stock: "bg-green-500/15 text-green-700 border-green-200",
  low_stock: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  out_of_stock: "bg-red-500/15 text-red-700 border-red-200",
};
const STATUS_LABELS = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock" };

export default function InventoryPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useListAdminInventory({ status: status as any, search });
  const adjustStock = useAdjustAdminStock();

  const [adjDialog, setAdjDialog] = useState<{ open: boolean; item?: Item }>({ open: false });
  const [histDialog, setHistDialog] = useState<{ open: boolean; productId?: number }>({ open: false });
  const [adjForm, setAdjForm] = useState({ mode: "adjust", adjustment: 0, setQuantity: 0, reason: "manual_adjustment" });
  const { data: history = [] } = useListProductStockHistory(histDialog.productId ?? 0, { query: { enabled: !!histDialog.productId } as any });

  const totals = { total: (items as Item[]).length, low: (items as Item[]).filter(i => i.status === "low_stock").length, out: (items as Item[]).filter(i => i.status === "out_of_stock").length };

  const saveAdj = async () => {
    if (!adjDialog.item) return;
    const payload: any = { reason: adjForm.reason };
    if (adjForm.mode === "set") payload.setQuantity = Number(adjForm.setQuantity);
    else payload.adjustment = Number(adjForm.adjustment);
    try {
      await adjustStock.mutateAsync({ productId: adjDialog.item.productId, data: payload });
      qc.invalidateQueries({ queryKey: ["/admin/inventory"] });
      toast.success("Stock updated");
      setAdjDialog({ open: false });
    } catch { toast.error("Failed"); }
  };

  const reasonLabels = ["manual_adjustment", "restock", "sale", "return", "correction", "write_off"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6" /> Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">{totals.total} products · {totals.low} low stock · {totals.out} out of stock</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[{ label: "In Stock", count: totals.total - totals.low - totals.out, color: "text-green-600", icon: TrendingUp },
          { label: "Low Stock", count: totals.low, color: "text-yellow-600", icon: TrendingDown },
          { label: "Out of Stock", count: totals.out, color: "text-destructive", icon: Package }
        ].map(s => (
          <div key={s.label} className="border rounded-lg p-4 bg-card flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color} opacity-70`} />
            <div><p className="text-sm text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.count}</p></div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Store</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Threshold</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(items as Item[]).map(item => (
                <tr key={item.productId} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.image && <img src={item.image} alt="" className="w-8 h-8 object-cover rounded" onError={e => (e.currentTarget.style.display="none")} />}
                      <span className="font-medium">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.storeName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[item.status as keyof typeof STATUS_STYLES] || ""}`}>
                      {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{item.stockQuantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => { setAdjDialog({ open: true, item }); setAdjForm({ mode: "adjust", adjustment: 0, setQuantity: item.stockQuantity, reason: "manual_adjustment" }); }}>
                        Adjust
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setHistDialog({ open: true, productId: item.productId })}>
                        <History className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(items as Item[]).length === 0 && <div className="text-center py-8 text-muted-foreground">No products found.</div>}
        </div>
      )}

      {/* Adjust dialog */}
      <Dialog open={adjDialog.open} onOpenChange={o => setAdjDialog({ open: o })}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Adjust Stock — {adjDialog.item?.productName}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-muted-foreground">Current stock: <span className="font-bold text-foreground">{adjDialog.item?.stockQuantity}</span></div>
            <div className="grid grid-cols-2 gap-2">
              {["adjust", "set"].map(m => (
                <button key={m} onClick={() => setAdjForm(f => ({ ...f, mode: m }))}
                  className={`p-2 rounded border text-sm font-medium capitalize transition-colors ${adjForm.mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {m === "adjust" ? "+/- Adjust" : "Set Quantity"}
                </button>
              ))}
            </div>
            {adjForm.mode === "adjust" ? (
              <div><Label>Adjustment (+ or -)</Label><Input type="number" value={adjForm.adjustment} onChange={e => setAdjForm(f => ({ ...f, adjustment: Number(e.target.value) }))} /></div>
            ) : (
              <div><Label>New Quantity</Label><Input type="number" min="0" value={adjForm.setQuantity} onChange={e => setAdjForm(f => ({ ...f, setQuantity: Number(e.target.value) }))} /></div>
            )}
            <div><Label>Reason</Label>
              <Select value={adjForm.reason} onValueChange={v => setAdjForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{reasonLabels.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjDialog({ open: false })}>Cancel</Button>
            <Button onClick={saveAdj}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={histDialog.open} onOpenChange={o => setHistDialog({ open: o })}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Stock History</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {(history as any[]).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className={`font-bold ${h.adjustment > 0 ? "text-green-600" : "text-red-600"}`}>{h.adjustment > 0 ? "+" : ""}{h.adjustment}</span>
                  <span className="text-muted-foreground ml-2">{h.previousQuantity} → {h.newQuantity}</span>
                  <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{h.reason}</span>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>{h.adminEmail || "System"}</div>
                  <div>{new Date(h.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {(history as any[]).length === 0 && <div className="text-center py-6 text-muted-foreground">No history yet.</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
