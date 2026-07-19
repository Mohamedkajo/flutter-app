import { useState } from "react";
import { 
  useListAdminCategories, 
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
  getListAdminCategoriesQueryKey 
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tags, Plus, MoreVertical, Trash2, Edit } from "lucide-react";
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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListAdminCategories();
  
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    image: ""
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", icon: "", image: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      image: category.image || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.icon) {
      toast.error("Name, slug, and icon are required");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ categoryId: editingId, data: formData }, {
        onSuccess: () => {
          toast.success("Category updated");
          queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => toast.error("Failed to update category")
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast.success("Category created");
          queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => toast.error("Failed to create category")
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate({ categoryId: id }, {
        onSuccess: () => {
          toast.success("Category deleted");
          queryClient.invalidateQueries({ queryKey: getListAdminCategoriesQueryKey() });
        },
        onError: () => toast.error("Failed to delete category")
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        description="Manage top-level store and product categories." 
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground animate-pulse">Loading categories...</div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No categories found" description="Create a category to get started." icon={Tags} />
          </div>
        ) : (
          categories?.map((cat) => (
            <div key={cat.id} className="group relative border rounded-xl bg-card p-6 flex flex-col items-center text-center shadow-sm hover:border-primary/50 transition-colors">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(cat)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(cat.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-4 overflow-hidden shadow-inner">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : cat.icon}
              </div>
              <h3 className="font-semibold text-lg">{cat.name}</h3>
              <p className="text-sm text-muted-foreground font-mono mt-1 mb-4">{cat.slug}</p>
              
              <div className="mt-auto px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium border">
                {cat.storeCount || 0} Stores
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    name: val, 
                    // Auto-generate slug if it's a new category
                    slug: editingId ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                  }));
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                className="font-mono"
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji or URL)</Label>
              <Input 
                id="icon" 
                value={formData.icon} 
                onChange={e => setFormData({ ...formData, icon: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Banner Image URL (optional)</Label>
              <Input 
                id="image" 
                value={formData.image} 
                onChange={e => setFormData({ ...formData, image: e.target.value })} 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
