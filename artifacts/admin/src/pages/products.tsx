import { useState } from "react";
import {
  useListAdminProducts,
  useUpdateAdminProduct,
  useDeleteAdminProduct,
  useCreateAdminProduct,
  useListAdminStores,
  getListAdminProductsQueryKey,
  type Product,
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, Search, MoreVertical, Trash2, Eye, EyeOff, PlusCircle, Pencil, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type ProductItem = Product;

const emptyCreate = () => ({
  name: "", description: "", price: 0, originalPrice: undefined as number | undefined,
  image: "", storeId: 0, categoryName: "", discountPercent: undefined as number | undefined,
  isAvailable: true, isFeatured: false,
});

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate());
  const [editForm, setEditForm] = useState<Partial<ProductItem> | null>(null);

  const { data: products, isLoading } = useListAdminProducts({ search: search || undefined });
  const { data: stores } = useListAdminStores({});
  const updateMutation = useUpdateAdminProduct();
  const deleteMutation = useDeleteAdminProduct();
  const createMutation = useCreateAdminProduct();

  const handleToggleAvailability = (id: number, current: boolean) => {
    updateMutation.mutate({ productId: id, data: { isAvailable: !current } }, {
      onSuccess: () => { toast.success("Availability updated"); queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); },
      onError: () => toast.error("Failed to update"),
    });
  };

  const handleToggleFeatured = (id: number, current: boolean) => {
    updateMutation.mutate({ productId: id, data: { isFeatured: !current } }, {
      onSuccess: () => { toast.success("Featured status updated"); queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); },
      onError: () => toast.error("Failed to update"),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate({ productId: id }, {
        onSuccess: () => { toast.success("Product deleted"); queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); },
        onError: () => toast.error("Failed to delete product"),
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.storeId) { toast.error("Please select a store"); return; }
    createMutation.mutate({ data: createForm as any }, {
      onSuccess: () => {
        toast.success("Product created");
        queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
        setIsCreateOpen(false);
        setCreateForm(emptyCreate());
      },
      onError: (err: any) => toast.error(err?.message ?? "Failed to create product"),
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct || !editForm) return;
    updateMutation.mutate({ productId: editProduct.id, data: editForm as any }, {
      onSuccess: () => {
        toast.success("Product updated");
        queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
        setEditProduct(null);
      },
      onError: () => toast.error("Failed to update product"),
    });
  };

  const openEdit = (p: ProductItem) => {
    setEditProduct(p);
    setEditForm({
      name: p.name, description: p.description ?? undefined, price: p.price,
      image: p.image, categoryName: p.categoryName, isAvailable: p.isAvailable,
      isFeatured: p.isFeatured, discountPercent: p.discountPercent ?? undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products Global List"
        description="Monitor and moderate products across all stores."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Product
          </Button>
        }
      />

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Store</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading products...</td></tr>
              ) : products?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12"><EmptyState title="No products found" description="Try adjusting your search." icon={Package} /></td></tr>
              ) : (
                products?.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted border overflow-hidden shrink-0">
                          {product.image
                            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-4 h-4" /></div>}
                        </div>
                        <div>
                          <div className="font-medium text-foreground truncate max-w-[200px]">{product.name}</div>
                          {product.isFeatured && <span className="text-xs text-amber-600 flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.storeName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary text-secondary-foreground">{product.categoryName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium font-mono">{formatCurrency(product.price)}</div>
                      {product.originalPrice && <div className="text-xs text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {product.isAvailable
                        ? <span className="px-2 py-0.5 rounded-md text-xs bg-teal-100 text-teal-700 font-medium">Available</span>
                        : <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground font-medium">Hidden</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEdit(product)}><Pencil className="w-4 h-4 mr-2" />Edit Product</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleAvailability(product.id, product.isAvailable ?? true)}>
                            {product.isAvailable ? <><EyeOff className="w-4 h-4 mr-2" />Hide</> : <><Eye className="w-4 h-4 mr-2" />Show</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(product.id, product.isFeatured ?? false)}>
                            <Star className="w-4 h-4 mr-2" />{product.isFeatured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id, product.name)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete
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
          <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Store *</Label>
              <Select value={createForm.storeId ? String(createForm.storeId) : ""} onValueChange={v => setCreateForm({ ...createForm, storeId: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select a store" /></SelectTrigger>
                <SelectContent>
                  {stores?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input required placeholder="Crispy Chicken Burger" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input required placeholder="Burgers" value={createForm.categoryName} onChange={e => setCreateForm({ ...createForm, categoryName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input required placeholder="https://..." value={createForm.image} onChange={e => setCreateForm({ ...createForm, image: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Product description" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (EGP) *</Label>
                <Input required type="number" step="0.5" min="0" value={createForm.price || ""} onChange={e => setCreateForm({ ...createForm, price: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Original Price</Label>
                <Input type="number" step="0.5" min="0" value={createForm.originalPrice ?? ""} onChange={e => setCreateForm({ ...createForm, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })} />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input type="number" step="1" min="0" max="100" value={createForm.discountPercent ?? ""} onChange={e => setCreateForm({ ...createForm, discountPercent: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>Create Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={open => { if (!open) setEditProduct(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Edit Product — {editProduct?.name}</DialogTitle></DialogHeader>
          {editForm && (
            <form onSubmit={handleEdit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input placeholder="Name" value={editForm.name ?? ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input placeholder="https://..." value={editForm.image ?? ""} onChange={e => setEditForm({ ...editForm, image: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Description" value={editForm.description ?? ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (EGP)</Label>
                  <Input type="number" step="0.5" value={editForm.price ?? ""} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input placeholder="Category" value={editForm.categoryName ?? ""} onChange={e => setEditForm({ ...editForm, categoryName: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isAvailable ?? true} onChange={e => setEditForm({ ...editForm, isAvailable: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.isFeatured ?? false} onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
