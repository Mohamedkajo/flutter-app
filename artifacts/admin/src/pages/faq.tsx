import { useState } from "react";
import { useListAdminFaq, useCreateAdminFaq, useUpdateAdminFaq, useDeleteAdminFaq, useListAdminFaqCategories, useCreateAdminFaqCategory, useDeleteAdminFaqCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, HelpCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function FaqPage() {
  const qc = useQueryClient();
  const { data: faqs = [], isLoading } = useListAdminFaq();
  const { data: categories = [] } = useListAdminFaqCategories();
  const createFaq = useCreateAdminFaq();
  const updateFaq = useUpdateAdminFaq();
  const deleteFaq = useDeleteAdminFaq();
  const createCat = useCreateAdminFaqCategory();
  const deleteCat = useDeleteAdminFaqCategory();

  const [dialog, setDialog] = useState<{ open: boolean; item?: any }>({ open: false });
  const [catDialog, setCatDialog] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", categoryId: "", displayOrder: 0, isPublished: true });
  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [filterCat, setFilterCat] = useState<string>("all");

  const openCreate = () => { setForm({ question: "", answer: "", categoryId: "", displayOrder: 0, isPublished: true }); setDialog({ open: true }); };
  const openEdit = (item: any) => { setForm({ question: item.question, answer: item.answer, categoryId: item.categoryId?.toString() ?? "", displayOrder: item.displayOrder, isPublished: item.isPublished }); setDialog({ open: true, item }); };

  const save = async () => {
    const payload: any = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : undefined, categoryName: categories.find((c: any) => c.id === Number(form.categoryId))?.name };
    try {
      if (dialog.item) await updateFaq.mutateAsync({ faqId: dialog.item.id, data: payload });
      else await createFaq.mutateAsync({ data: payload });
      qc.invalidateQueries({ queryKey: ["/admin/faq"] });
      toast.success(dialog.item ? "FAQ updated" : "FAQ created");
      setDialog({ open: false });
    } catch { toast.error("Failed to save"); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteFaq.mutateAsync({ faqId: id });
    qc.invalidateQueries({ queryKey: ["/admin/faq"] });
    toast.success("Deleted");
  };

  const togglePublish = async (item: any) => {
    await updateFaq.mutateAsync({ faqId: item.id, data: { isPublished: !item.isPublished } as any });
    qc.invalidateQueries({ queryKey: ["/admin/faq"] });
  };

  const saveCat = async () => {
    try {
      await createCat.mutateAsync({ data: catForm });
      qc.invalidateQueries({ queryKey: ["/admin/faq/categories"] });
      toast.success("Category created");
      setCatDialog(false);
      setCatForm({ name: "", slug: "" });
    } catch { toast.error("Failed"); }
  };

  const filtered = filterCat === "all" ? faqs : faqs.filter((f: any) => String(f.categoryId) === filterCat);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6" /> FAQ Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{faqs.length} questions across {categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatDialog(true)}><Plus className="w-4 h-4 mr-1" />Category</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add FAQ</Button>
        </div>
      </div>

      {/* Categories filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge variant={filterCat === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterCat("all")}>All ({faqs.length})</Badge>
        {categories.map((c: any) => (
          <Badge key={c.id} variant={filterCat === String(c.id) ? "default" : "outline"} className="cursor-pointer flex gap-1 items-center" onClick={() => setFilterCat(String(c.id))}>
            {c.name} ({faqs.filter((f: any) => f.categoryId === c.id).length})
            <Trash2 className="w-3 h-3 ml-1 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteCat.mutateAsync({ categoryId: c.id }).then(() => qc.invalidateQueries({ queryKey: ["/admin/faq/categories"] })); }} />
          </Badge>
        ))}
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-2">
          {filtered.map((item: any, i: number) => (
            <div key={item.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.categoryName && <Badge variant="secondary" className="text-xs">{item.categoryName}</Badge>}
                    <Badge variant={item.isPublished ? "default" : "secondary"}>{item.isPublished ? "Published" : "Draft"}</Badge>
                    <span className="text-xs text-muted-foreground">Order: {item.displayOrder}</span>
                  </div>
                  <p className="font-medium">{item.question}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.isPublished} onCheckedChange={() => togglePublish(item)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No FAQs yet. Create one above.</div>}
        </div>
      )}

      {/* FAQ dialog */}
      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{dialog.item ? "Edit FAQ" : "Create FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Question</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} /></div>
            <div><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Display Order</Label><Input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={v => setForm(f => ({ ...f, isPublished: v }))} /><Label>Published</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Name</Label><Input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} /></div>
            <div><Label>Slug</Label><Input value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={saveCat}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
