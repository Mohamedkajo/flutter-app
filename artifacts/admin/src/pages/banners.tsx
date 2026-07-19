import { useState } from "react";
import {
  useListAdminBanners,
  listAdminBanners,
  useCreateAdminBanner,
  useUpdateAdminBanner,
  useDeleteAdminBanner,
  getListAdminBannersQueryKey,
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImageIcon, PlusCircle, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type Banner = NonNullable<Awaited<ReturnType<typeof listAdminBanners>>>[number];

const emptyForm = () => ({ title: "", subtitle: "", image: "", link: "", isActive: true, displayOrder: 0 });

function BannerForm({ form, setForm, onSubmit, isPending, label, onCancel }: {
  form: any; setForm: (f: any) => void; onSubmit: (e: React.FormEvent) => void;
  isPending: boolean; label: string; onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input required placeholder="Summer Sale — Up to 50% Off" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input placeholder="Limited time offer" value={form.subtitle} onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Image URL *</Label>
        <Input required placeholder="https://..." value={form.image} onChange={e => setForm((f: any) => ({ ...f, image: e.target.value }))} />
        {form.image && (
          <div className="rounded-lg overflow-hidden h-32 mt-2 border bg-muted">
            <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Link URL</Label>
        <Input placeholder="https://..." value={form.link} onChange={e => setForm((f: any) => ({ ...f, link: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input type="number" step="1" value={form.displayOrder} onChange={e => setForm((f: any) => ({ ...f, displayOrder: parseInt(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center h-10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </label>
          </div>
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{label}</Button>
      </DialogFooter>
    </form>
  );
}

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [createForm, setCreateForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState<any>(null);

  const { data: banners, isLoading } = useListAdminBanners();
  const createMutation = useCreateAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  const deleteMutation = useDeleteAdminBanner();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAdminBannersQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: createForm }, {
      onSuccess: () => { toast.success("Banner created"); invalidate(); setIsCreateOpen(false); setCreateForm(emptyForm()); },
      onError: () => toast.error("Failed to create banner"),
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBanner) return;
    updateMutation.mutate({ bannerId: editBanner.id, data: editForm }, {
      onSuccess: () => { toast.success("Banner updated"); invalidate(); setEditBanner(null); },
      onError: () => toast.error("Failed to update banner"),
    });
  };

  const handleToggle = (b: Banner) => {
    updateMutation.mutate({ bannerId: b.id, data: { title: b.title, image: b.image, isActive: !b.isActive } }, {
      onSuccess: () => { toast.success("Banner updated"); invalidate(); },
      onError: () => toast.error("Failed to update banner"),
    });
  };

  const handleDelete = (b: Banner) => {
    if (confirm(`Delete banner "${b.title}"?`)) {
      deleteMutation.mutate({ bannerId: b.id }, {
        onSuccess: () => { toast.success("Banner deleted"); invalidate(); },
        onError: () => toast.error("Failed to delete banner"),
      });
    }
  };

  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setEditForm({ title: b.title, subtitle: b.subtitle ?? "", image: b.image, link: b.link ?? "", isActive: b.isActive, displayOrder: b.displayOrder });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage homepage and in-app promotional banners."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Banner
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading banners...</div>
      ) : banners?.length === 0 ? (
        <EmptyState title="No banners" description="Create your first promotional banner." icon={ImageIcon} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners?.map(banner => (
            <div key={banner.id} className={`border rounded-xl bg-card overflow-hidden transition-all ${banner.isActive ? "" : "opacity-60"}`}>
              <div className="h-36 bg-muted relative">
                {banner.image && (
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                )}
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded font-medium">Inactive</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-background/80 text-foreground font-mono">#{banner.displayOrder}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-foreground truncate">{banner.title}</div>
                {banner.subtitle && <div className="text-sm text-muted-foreground mt-0.5 truncate">{banner.subtitle}</div>}
                {banner.link && <div className="text-xs text-primary mt-1 truncate">{banner.link}</div>}
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(banner)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggle(banner)}>
                    {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(banner)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Banner</DialogTitle></DialogHeader>
          <BannerForm form={createForm} setForm={setCreateForm} onSubmit={handleCreate} isPending={createMutation.isPending} label="Create Banner" onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBanner} onOpenChange={open => { if (!open) setEditBanner(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Banner</DialogTitle></DialogHeader>
          {editForm && <BannerForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} isPending={updateMutation.isPending} label="Save Changes" onCancel={() => setEditBanner(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
