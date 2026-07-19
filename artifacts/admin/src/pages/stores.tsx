import { useState } from "react";
import {
  useListAdminStores,
  useUpdateAdminStore,
  useDeleteAdminStore,
  useCreateAdminStore,
  getListAdminStoresQueryKey,
  type AdminStore,
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Search, MoreVertical, BadgeCheck, Star, Trash2, Power, PowerOff, PlusCircle, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type StoreItem = AdminStore;

const emptyCreate = () => ({
  name: "", image: "", categoryName: "", slug: "", description: "",
  logo: "", address: "", phone: "", deliveryTime: "20-30 Min",
  deliveryFee: 10, minOrder: 50,
});

const emptyEdit = (s: StoreItem) => ({
  name: s.name, image: s.image, categoryName: s.categoryName, slug: s.slug ?? "",
  description: (s as any).description ?? "", logo: s.logo ?? "", address: s.address ?? "",
  phone: s.phone ?? "", deliveryTime: s.deliveryTime ?? "20-30 Min",
  deliveryFee: s.deliveryFee ?? 10, minOrder: s.minOrder ?? 50,
});

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editStore, setEditStore] = useState<StoreItem | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate());
  const [editForm, setEditForm] = useState<ReturnType<typeof emptyEdit> | null>(null);

  const { data: stores, isLoading } = useListAdminStores({ search: search || undefined });
  const updateMutation = useUpdateAdminStore();
  const deleteMutation = useDeleteAdminStore();
  const createMutation = useCreateAdminStore();

  const toggleField = (id: number, field: string, current: boolean) => {
    updateMutation.mutate({ storeId: id, data: { [field]: !current } as any }, {
      onSuccess: () => { toast.success("Store updated"); queryClient.invalidateQueries({ queryKey: getListAdminStoresQueryKey() }); },
      onError: () => toast.error("Failed to update store"),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate({ storeId: id }, {
        onSuccess: () => { toast.success("Store deleted"); queryClient.invalidateQueries({ queryKey: getListAdminStoresQueryKey() }); },
        onError: () => toast.error("Failed to delete store"),
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: createForm as any }, {
      onSuccess: () => {
        toast.success("Store created");
        queryClient.invalidateQueries({ queryKey: getListAdminStoresQueryKey() });
        setIsCreateOpen(false);
        setCreateForm(emptyCreate());
      },
      onError: (err: any) => toast.error(err?.message ?? "Failed to create store"),
    });
  };

  const openEdit = (s: StoreItem) => {
    setEditStore(s);
    setEditForm(emptyEdit(s));
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStore || !editForm) return;
    updateMutation.mutate({ storeId: editStore.id, data: editForm as any }, {
      onSuccess: () => {
        toast.success("Store updated");
        queryClient.invalidateQueries({ queryKey: getListAdminStoresQueryKey() });
        setEditStore(null);
      },
      onError: () => toast.error("Failed to update store"),
    });
  };

  const StoreForm = ({ form, setForm, onSubmit, isPending, label }: {
    form: any; setForm: (f: any) => void; onSubmit: (e: React.FormEvent) => void;
    isPending: boolean; label: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Store Name *</Label>
          <Input required placeholder="Burger Palace" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Input required placeholder="Burgers" value={form.categoryName} onChange={e => setForm((f: any) => ({ ...f, categoryName: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cover Image URL *</Label>
        <Input required placeholder="https://..." value={form.image} onChange={e => setForm((f: any) => ({ ...f, image: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Logo URL</Label>
        <Input placeholder="https://..." value={form.logo} onChange={e => setForm((f: any) => ({ ...f, logo: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input placeholder="Short description" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Address</Label>
          <Input placeholder="123 Main St, Cairo" value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input placeholder="+20 1000000000" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Delivery Time</Label>
          <Input placeholder="20-30 Min" value={form.deliveryTime} onChange={e => setForm((f: any) => ({ ...f, deliveryTime: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Delivery Fee</Label>
          <Input type="number" step="0.5" value={form.deliveryFee} onChange={e => setForm((f: any) => ({ ...f, deliveryFee: parseFloat(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Min Order</Label>
          <Input type="number" step="1" value={form.minOrder} onChange={e => setForm((f: any) => ({ ...f, minOrder: parseFloat(e.target.value) }))} />
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditStore(null); }}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{label}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stores Management"
        description="Approve, feature, and monitor marketplace stores."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Store
          </Button>
        }
      />

      <div className="flex gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search stores..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Store</th>
                <th className="px-6 py-4 font-medium">Badges</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading stores...</td></tr>
              ) : stores?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12"><EmptyState title="No stores found" description="Try adjusting your search." icon={Store} /></td></tr>
              ) : (
                stores?.map((store) => (
                  <tr key={store.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted border overflow-hidden shrink-0">
                          {store.logo || store.image
                            ? <img src={store.logo || store.image || ""} alt={store.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Store className="w-4 h-4" /></div>}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{store.name}</div>
                          <div className="text-xs text-muted-foreground">{store.address ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {store.isVerified && <span className="px-1.5 py-0.5 text-xs rounded bg-primary/10 text-primary font-medium flex items-center gap-1"><BadgeCheck className="w-3 h-3"/>Verified</span>}
                        {store.isFeatured && <span className="px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-700 font-medium flex items-center gap-1"><Star className="w-3 h-3"/>Featured</span>}
                        {store.isOnline
                          ? <span className="px-1.5 py-0.5 text-xs rounded bg-teal-100 text-teal-700 font-medium flex items-center gap-1"><Power className="w-3 h-3"/>Online</span>
                          : <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground font-medium flex items-center gap-1"><PowerOff className="w-3 h-3"/>Offline</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary text-secondary-foreground">{store.categoryName}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{store.ownerName ?? "—"}</td>
                    <td className="px-6 py-4 font-mono">{formatCurrency(store.totalRevenue ?? 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEdit(store)}><Pencil className="w-4 h-4 mr-2" />Edit Store</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleField(store.id, "isVerified", store.isVerified ?? false)}>
                            <BadgeCheck className="w-4 h-4 mr-2" />{store.isVerified ? "Remove Verified" : "Mark Verified"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleField(store.id, "isFeatured", store.isFeatured ?? false)}>
                            <Star className="w-4 h-4 mr-2" />{store.isFeatured ? "Unfeature" : "Feature Store"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleField(store.id, "isOnline", store.isOnline ?? false)}>
                            <Power className="w-4 h-4 mr-2" />{store.isOnline ? "Set Offline" : "Set Online"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(store.id, store.name)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete Store
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
          <StoreForm form={createForm} setForm={setCreateForm} onSubmit={handleCreate} isPending={createMutation.isPending} label="Create Store" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStore} onOpenChange={open => { if (!open) setEditStore(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Store — {editStore?.name}</DialogTitle></DialogHeader>
          {editForm && (
            <StoreForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} isPending={updateMutation.isPending} label="Save Changes" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
