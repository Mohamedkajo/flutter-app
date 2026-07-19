import { useState, useEffect } from "react";
import { useListAdminSiteSettings, useUpdateAdminSiteSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Globe, Save, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type Setting = { key: string; value: string; type: string; group: string; label: string };

const GROUP_LABELS: Record<string, string> = {
  general: "General",
  homepage: "Home Page",
  app: "App Downloads",
  social: "Social Media",
  footer: "Footer",
  about: "About Page",
};

export default function SiteSettingsPage() {
  const qc = useQueryClient();
  const { data: settings = [], isLoading } = useListAdminSiteSettings();
  const updateSettings = useUpdateAdminSiteSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && (settings as Setting[]).length > 0) {
      const init: Record<string, string> = {};
      (settings as Setting[]).forEach(s => { init[s.key] = s.value; });
      setValues(init);
    }
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      await updateSettings.mutateAsync({ data: { settings: payload } });
      qc.invalidateQueries({ queryKey: ["/admin/site-settings"] });
      toast.success("Settings saved");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const groups = [...new Set((settings as Setting[]).map(s => s.group))];

  const renderField = (s: Setting) => {
    const isLong = s.type === "text" && (s.key.includes("description") || s.key.includes("about") || s.value.length > 80);
    return (
      <div key={s.key} className="space-y-1">
        <Label className="text-sm">{s.label}</Label>
        {isLong ? (
          <Textarea rows={2} value={values[s.key] || ""} onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))} className="text-sm" />
        ) : (
          <Input value={values[s.key] || ""} onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))} className="text-sm" placeholder={s.key.includes("url") || s.key.includes("link") ? "https://..." : ""} />
        )}
        <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6" /> Site Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage public website content and branding</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save All"}</Button>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="space-y-8">
          {groups.map(group => {
            const groupSettings = (settings as Setting[]).filter(s => s.group === group);
            return (
              <div key={group} className="border rounded-lg bg-card overflow-hidden">
                <div className="bg-muted/40 border-b px-5 py-3">
                  <h2 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4" />{GROUP_LABELS[group] || group}</h2>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupSettings.map(renderField)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && (settings as Setting[]).length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button onClick={save} disabled={saving} size="lg"><Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save All Changes"}</Button>
        </div>
      )}
    </div>
  );
}
