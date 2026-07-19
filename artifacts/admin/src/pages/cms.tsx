import { useState } from "react";
import {
  useListAdminCmsPages,
  listAdminCmsPages,
  useCreateAdminCmsPage,
  useUpdateAdminCmsPage,
  useDeleteAdminCmsPage,
  getListAdminCmsPagesQueryKey,
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, PlusCircle, Pencil, Trash2, Globe, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type CmsPage = NonNullable<Awaited<ReturnType<typeof listAdminCmsPages>>>[number];

const emptyForm = () => ({ title: "", slug: "", content: "", metaDescription: "", isPublished: false });

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function PageForm({ form, setForm, onSubmit, isPending, label, onCancel, isNew }: {
  form: any; setForm: (f: any) => void; onSubmit: (e: React.FormEvent) => void;
  isPending: boolean; label: string; onCancel: () => void; isNew?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Page Title *</Label>
        <Input
          required
          placeholder="About Us"
          value={form.title}
          onChange={e => {
            const title = e.target.value;
            setForm((f: any) => ({ ...f, title, ...(isNew ? { slug: slugify(title) } : {}) }));
          }}
        />
      </div>
      <div className="space-y-2">
        <Label>URL Slug *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/</span>
          <Input required placeholder="about-us" value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: slugify(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Content *</Label>
        <Textarea
          required
          rows={8}
          placeholder="Write your page content here (plain text or HTML)..."
          value={form.content}
          onChange={e => setForm((f: any) => ({ ...f, content: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label>Meta Description</Label>
        <Input placeholder="Short description for SEO..." value={form.metaDescription} onChange={e => setForm((f: any) => ({ ...f, metaDescription: e.target.value }))} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm((f: any) => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4" />
        <Label htmlFor="published" className="cursor-pointer">Publish this page</Label>
      </div>
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{label}</Button>
      </DialogFooter>
    </form>
  );
}

export default function CmsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editPage, setEditPage] = useState<CmsPage | null>(null);
  const [createForm, setCreateForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState<any>(null);

  const { data: pages, isLoading } = useListAdminCmsPages();
  const createMutation = useCreateAdminCmsPage();
  const updateMutation = useUpdateAdminCmsPage();
  const deleteMutation = useDeleteAdminCmsPage();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAdminCmsPagesQueryKey() });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: createForm }, {
      onSuccess: () => { toast.success("Page created"); invalidate(); setIsCreateOpen(false); setCreateForm(emptyForm()); },
      onError: (err: any) => toast.error(err?.message ?? "Failed to create page"),
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPage) return;
    updateMutation.mutate({ pageId: editPage.id, data: editForm }, {
      onSuccess: () => { toast.success("Page updated"); invalidate(); setEditPage(null); },
      onError: () => toast.error("Failed to update page"),
    });
  };

  const handleTogglePublish = (page: CmsPage) => {
    updateMutation.mutate({ pageId: page.id, data: { title: page.title, slug: page.slug, content: page.content, isPublished: !page.isPublished } }, {
      onSuccess: () => { toast.success(page.isPublished ? "Page unpublished" : "Page published"); invalidate(); },
      onError: () => toast.error("Failed to update page"),
    });
  };

  const handleDelete = (page: CmsPage) => {
    if (confirm(`Delete "${page.title}"? This cannot be undone.`)) {
      deleteMutation.mutate({ pageId: page.id }, {
        onSuccess: () => { toast.success("Page deleted"); invalidate(); },
        onError: () => toast.error("Failed to delete page"),
      });
    }
  };

  const openEdit = (page: CmsPage) => {
    setEditPage(page);
    setEditForm({ title: page.title, slug: page.slug, content: page.content, metaDescription: page.metaDescription ?? "", isPublished: page.isPublished });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS Pages"
        description="Manage static pages like About, Terms, Privacy Policy, and FAQs."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> New Page
          </Button>
        }
      />

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading pages...</td></tr>
              ) : pages?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12"><EmptyState title="No pages yet" description="Create your first CMS page, such as About Us or Terms of Service." icon={FileText} /></td></tr>
              ) : (
                pages?.map((page) => (
                  <tr key={page.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="font-medium text-foreground">{page.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">/{page.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      {page.isPublished
                        ? <span className="flex items-center gap-1 text-xs text-teal-600 font-medium"><Globe className="w-3.5 h-3.5" />Published</span>
                        : <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium"><EyeOff className="w-3.5 h-3.5" />Draft</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(page.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(page)}>
                          {page.isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(page)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(page)}>
                          <Trash2 className="w-4 h-4" />
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader>
          <PageForm form={createForm} setForm={setCreateForm} onSubmit={handleCreate} isPending={createMutation.isPending} label="Create Page" onCancel={() => setIsCreateOpen(false)} isNew />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPage} onOpenChange={open => { if (!open) setEditPage(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit — {editPage?.title}</DialogTitle></DialogHeader>
          {editForm && <PageForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} isPending={updateMutation.isPending} label="Save Changes" onCancel={() => setEditPage(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
