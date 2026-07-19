import { useState } from "react";
import { useListAdminCareers, useCreateAdminCareer, useUpdateAdminCareer, useDeleteAdminCareer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Briefcase, MapPin, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Job = { id: number; title: string; department: string; location: string; type: string; description: string; requirements: string[]; benefits?: string[]; salary?: string; isActive: boolean; createdAt: string };

export default function CareersPage() {
  const qc = useQueryClient();
  const { data: jobs = [], isLoading } = useListAdminCareers();
  const create = useCreateAdminCareer();
  const update = useUpdateAdminCareer();
  const remove = useDeleteAdminCareer();

  const empty = { title: "", department: "Engineering", location: "Cairo, Egypt", type: "full-time", description: "", requirements: [""], salary: "", isActive: true };
  const [dialog, setDialog] = useState<{ open: boolean; job?: Job }>({ open: false });
  const [form, setForm] = useState<any>(empty);

  const openEdit = (job: Job) => {
    setForm({ title: job.title, department: job.department, location: job.location, type: job.type, description: job.description, requirements: job.requirements.length ? job.requirements : [""], salary: job.salary || "", isActive: job.isActive });
    setDialog({ open: true, job });
  };

  const save = async () => {
    if (!form.title || !form.description) { toast.error("Fill required fields"); return; };
    const payload = { ...form, requirements: form.requirements.filter((r: string) => r.trim()) };
    try {
      if (dialog.job) await update.mutateAsync({ careerId: dialog.job.id, data: payload });
      else await create.mutateAsync({ data: payload });
      qc.invalidateQueries({ queryKey: ["/admin/careers"] });
      toast.success("Saved");
      setDialog({ open: false });
    } catch { toast.error("Failed"); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this job listing?")) return;
    await remove.mutateAsync({ careerId: id });
    qc.invalidateQueries({ queryKey: ["/admin/careers"] });
    toast.success("Deleted");
  };

  const toggle = async (job: Job) => {
    await update.mutateAsync({ careerId: job.id, data: { isActive: !job.isActive } as any });
    qc.invalidateQueries({ queryKey: ["/admin/careers"] });
  };

  const addReq = () => setForm((f: any) => ({ ...f, requirements: [...f.requirements, ""] }));
  const updateReq = (i: number, v: string) => setForm((f: any) => { const r = [...f.requirements]; r[i] = v; return { ...f, requirements: r }; });
  const removeReq = (i: number) => setForm((f: any) => ({ ...f, requirements: f.requirements.filter((_: any, j: number) => j !== i) }));

  const TYPE_COLORS: Record<string, string> = { "full-time": "bg-blue-500/10 text-blue-700", "part-time": "bg-purple-500/10 text-purple-700", "contract": "bg-orange-500/10 text-orange-700", "remote": "bg-green-500/10 text-green-700" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6" /> Careers</h1>
          <p className="text-muted-foreground text-sm mt-1">{(jobs as Job[]).filter(j => j.isActive).length} open positions · {(jobs as Job[]).length} total</p>
        </div>
        <Button size="sm" onClick={() => { setForm(empty); setDialog({ open: true }); }}><Plus className="w-4 h-4 mr-1" />Add Position</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-3">
          {(jobs as Job[]).map(job => (
            <div key={job.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={job.isActive ? "default" : "secondary"}>{job.isActive ? "Open" : "Closed"}</Badge>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_COLORS[job.type] || ""}`}>{job.type}</span>
                    <span className="text-xs text-muted-foreground">{job.department}</span>
                  </div>
                  <h3 className="font-semibold text-base">{job.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    {job.salary && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.salary}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                  {job.requirements.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {job.requirements.slice(0, 3).map((r, i) => <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{r}</span>)}
                      {job.requirements.length > 3 && <span className="text-xs text-muted-foreground">+{job.requirements.length - 3} more</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={job.isActive} onCheckedChange={() => toggle(job)} />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(job)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => del(job.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
          {(jobs as Job[]).length === 0 && <div className="text-center py-12 text-muted-foreground">No job listings yet.</div>}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialog.job ? "Edit Position" : "New Position"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Senior React Developer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm((f: any) => ({ ...f, department: e.target.value }))} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm((f: any) => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm((f: any) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["full-time", "part-time", "contract", "remote"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salary Range</Label><Input value={form.salary} onChange={e => setForm((f: any) => ({ ...f, salary: e.target.value }))} placeholder="$3,000 - $5,000" /></div>
            </div>
            <div><Label>Description *</Label><Textarea rows={3} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Requirements</Label><Button variant="ghost" size="sm" onClick={addReq}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
              {form.requirements.map((r: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={r} onChange={e => updateReq(i, e.target.value)} placeholder={`Requirement ${i + 1}`} />
                  <Button variant="ghost" size="icon" onClick={() => removeReq(i)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={v => setForm((f: any) => ({ ...f, isActive: v }))} /><Label>Open for applications</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
