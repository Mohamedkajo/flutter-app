import { useState } from "react";
import { 
  useListAdminCoupons, 
  useCreateAdminCoupon,
  useUpdateAdminCoupon,
  useDeleteAdminCoupon,
  getListAdminCouponsQueryKey 
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Ticket, Plus, MoreVertical, Trash2, Edit } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Switch } from "@/components/ui/switch";

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { data: coupons, isLoading } = useListAdminCoupons();
  
  const createMutation = useCreateAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<any>({
    code: "",
    title: "",
    discount: 0,
    type: "percentage",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0,16),
    isActive: true
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: "",
      title: "",
      discount: 0,
      type: "percentage",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0,16),
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      title: coupon.title,
      discount: coupon.discount,
      type: coupon.type,
      expiresAt: coupon.expiresAt.slice(0,16),
      isActive: coupon.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      discount: Number(formData.discount),
      expiresAt: new Date(formData.expiresAt).toISOString()
    };

    if (editingId) {
      updateMutation.mutate({ couponId: editingId, data: payload }, {
        onSuccess: () => {
          toast.success("Coupon updated");
          queryClient.invalidateQueries({ queryKey: getListAdminCouponsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => toast.error("Failed to update coupon")
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast.success("Coupon created");
          queryClient.invalidateQueries({ queryKey: getListAdminCouponsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => toast.error("Failed to create coupon")
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate({ couponId: id }, {
        onSuccess: () => {
          toast.success("Coupon deleted");
          queryClient.invalidateQueries({ queryKey: getListAdminCouponsQueryKey() });
        },
        onError: () => toast.error("Failed to delete coupon")
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Promotions & Coupons" 
        description="Create and manage discount codes." 
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" /> Create Coupon
          </Button>
        }
      />

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Code & Title</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Expires</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading coupons...</td>
                </tr>
              ) : coupons?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState title="No coupons found" description="Create a coupon to offer discounts." icon={Ticket} />
                  </td>
                </tr>
              ) : (
                coupons?.map((coupon) => (
                  <tr key={coupon.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-foreground text-base tracking-wider">{coupon.code}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{coupon.title}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {coupon.type === "percentage" ? `${coupon.discount}%` : formatCurrency(coupon.discount)} OFF
                    </td>
                    <td className="px-6 py-4">
                      {coupon.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {coupon.usageCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'uses'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(coupon)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input 
                  id="code" 
                  className="font-mono uppercase"
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                  disabled={!!editingId}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Value</Label>
                <Input 
                  id="discount" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount} 
                  onChange={e => setFormData({ ...formData, discount: e.target.value })} 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date</Label>
              <Input 
                id="expiresAt" 
                type="datetime-local"
                value={formData.expiresAt} 
                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} 
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <div className="text-sm text-muted-foreground">Allow users to apply this coupon.</div>
              </div>
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={checked => setFormData({...formData, isActive: checked})}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
