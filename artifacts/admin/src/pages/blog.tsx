import { useState } from "react";
import { useListAdminBlogPosts, useCreateAdminBlogPost, useUpdateAdminBlogPost, useDeleteAdminBlogPost, useListAdminBlogCategories, useCreateAdminBlogCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Post = { id: number; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; categoryName?: string; isPublished: boolean; viewCount: number; readTime: number; createdAt: string; authorName: string };

export default function BlogPage() {
  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useListAdminBlogPosts();
  const { data: categories = [] } = useListAdminBlogCategories();
  const create = useCreateAdminBlogPost();
  const update = useUpdateAdminBlogPost();
  const remove = useDeleteAdminBlogPost();
  const createCat = useCreateAdminBlogCategory();

  const empty = { title: "", slug: "", excerpt: "", content: "", coverImage: "", categoryId: "", categoryName: "", isPublished: false, readTime: 5 };
  const [dialog, setDialog] = useState<{ open: boolean; post?: Post }>({ open: false });
  const [form, setForm] = useState<any>(empty);
  const [catDialog, setCatDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });

  const openEdit = (post: Post) => {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content, coverImage: post.coverImage || "", categoryId: "", isPublished: post.isPublished, readTime: post.readTime });
    setDialog({ open: true, post });
  };

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const save = async () => {
    const payload: any = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : undefined };
    try {
      if (dialog.post) await update.mutateAsync({ postId: dialog.post.id, data: payload });
      else await create.mutateAsync({ data: payload });
      qc.invalidateQueries({ queryKey: ["/admin/blog"] });
      toast.success("Saved");
      setDialog({ open: false });
    } catch { toast.error("Failed"); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete post?")) return;
    await remove.mutateAsync({ postId: id });
    qc.invalidateQueries({ queryKey: ["/admin/blog"] });
    toast.success("Deleted");
  };

  const togglePublish = async (post: Post) => {
    await update.mutateAsync({ postId: post.id, data: { isPublished: !post.isPublished } as any });
    qc.invalidateQueries({ queryKey: ["/admin/blog"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Blog Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{(posts as Post[]).filter(p => p.isPublished).length} published · {(posts as Post[]).filter(p => !p.isPublished).length} drafts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatDialog(true)}><Plus className="w-4 h-4 mr-1" />Category</Button>
          <Button size="sm" onClick={() => { setForm(empty); setDialog({ open: true }); }}><Plus className="w-4 h-4 mr-1" />New Post</Button>
        </div>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-3">
          {(posts as Post[]).map(post => (
            <div key={post.id} className="border rounded-lg p-4 bg-card flex gap-4">
              {post.coverImage && <img src={post.coverImage} alt="" className="w-20 h-16 object-cover rounded shrink-0" onError={e => (e.currentTarget.style.display="none")} />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={post.isPublished ? "default" : "secondary"}>{post.isPublished ? "Published" : "Draft"}</Badge>
                  {post.categoryName && <Badge variant="outline">{post.categoryName}</Badge>}
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
                  <span className="text-xs text-muted-foreground">{post.readTime} min read</span>
                </div>
                <p className="font-medium truncate">{post.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground mt-1">By {post.authorName} · {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={post.isPublished} onCheckedChange={() => togglePublish(post)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => del(post.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {(posts as any[]).length === 0 && <div className="text-center py-12 text-muted-foreground">No blog posts yet.</div>}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog.post ? "Edit Post" : "New Blog Post"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value, slug: f.slug || autoSlug(e.target.value) }))} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))} /></div>
            </div>
            <div><Label>Excerpt</Label><Input value={form.excerpt} onChange={e => setForm((f: any) => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary..." /></div>
            <div><Label>Content (Markdown)</Label><Textarea rows={10} value={form.content} onChange={e => setForm((f: any) => ({ ...f, content: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={e => setForm((f: any) => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Read Time (min)</Label><Input type="number" value={form.readTime} onChange={e => setForm((f: any) => ({ ...f, readTime: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm((f: any) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                <SelectContent>{(categories as any[]).map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={v => setForm((f: any) => ({ ...f, isPublished: v }))} /><Label>Publish</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Name</Label><Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} /></div>
            <div><Label>Slug</Label><Input value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={async () => { await createCat.mutateAsync({ data: catForm }); qc.invalidateQueries({ queryKey: ["/admin/blog/categories"] }); toast.success("Created"); setCatDialog(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
