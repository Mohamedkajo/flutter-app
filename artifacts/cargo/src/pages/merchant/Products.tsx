import { useState } from 'react';
import { useListMerchantProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useListCategories } from '@workspace/api-client-react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function MerchantProducts() {
  const { data: products, isLoading } = useListMerchantProducts();
  const { data: categories } = useListCategories();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryName: '',
    image: ''
  });

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleAddSubmit = () => {
    createProduct.mutate({
      data: {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        categoryName: formData.categoryName || (categories?.[0]?.name || 'General'),
        image: formData.image || 'https://placehold.co/400x400?text=Product'
      }
    }, {
      onSuccess: () => {
        toast({ title: 'Product Added', description: 'Product has been created successfully.' });
        queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
        setIsAddOpen(false);
        setFormData({ name: '', description: '', price: '', originalPrice: '', categoryName: '', image: '' });
      }
    });
  };

  const handleEditSubmit = () => {
    if (!editingProduct) return;
    updateProduct.mutate({
      productId: editingProduct.id,
      data: {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
      }
    }, {
      onSuccess: () => {
        toast({ title: 'Product Updated', description: 'Product has been updated successfully.' });
        queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
        setIsEditOpen(false);
      }
    });
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      categoryName: product.categoryName,
      image: product.image
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate({ productId: id }, {
        onSuccess: () => {
          toast({ title: 'Product Deleted' });
          queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your store's inventory.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-md">
              <Plus size={18} className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
              <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl h-12" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl h-12" />
                <Input type="number" placeholder="Original Price (Optional)" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="rounded-xl h-12" />
              </div>
              <Input placeholder="Category Name" value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} className="rounded-xl h-12" />
              <Input placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="rounded-xl h-12" />
            </div>
            <Button className="w-full h-12 rounded-xl bg-primary text-white" onClick={handleAddSubmit} disabled={createProduct.isPending || !formData.name || !formData.price}>
              {createProduct.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-surface/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-border/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface/30 text-muted-foreground text-xs uppercase font-semibold border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <ImageIcon size={32} className="mx-auto mb-3 opacity-20" />
                    No products found. Add some products to get started.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-border/50 bg-white hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface overflow-hidden shrink-0 border border-border/50 p-1">
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{product.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.categoryName}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">${product.price.toFixed(2)}</div>
                      {product.originalPrice && <div className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={product.isAvailable !== false ? "bg-success/10 text-success border-none" : "bg-muted text-muted-foreground border-none"}>
                        {product.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => openEdit(product)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDelete(product.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
            <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl h-12" />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="rounded-xl h-12" />
              <Input type="number" placeholder="Original Price (Optional)" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="rounded-xl h-12" />
            </div>
            <Input placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="rounded-xl h-12" />
          </div>
          <Button className="w-full h-12 rounded-xl bg-primary text-white" onClick={handleEditSubmit} disabled={updateProduct.isPending || !formData.name || !formData.price}>
            {updateProduct.isPending ? 'Saving...' : 'Update Product'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
