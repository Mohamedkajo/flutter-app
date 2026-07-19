import { useState } from "react";
import { useListAdminAuditLogs } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/15 text-green-700 border-green-200",
  update: "bg-yellow-500/15 text-yellow-700 border-yellow-200",
  delete: "bg-red-500/15 text-red-700 border-red-200",
  login: "bg-blue-500/15 text-blue-700 border-blue-200",
  logout: "bg-slate-500/15 text-slate-700 border-slate-200",
  settings_change: "bg-purple-500/15 text-purple-700 border-purple-200",
};

type Log = { id: number; userId?: number; userEmail?: string; userName?: string; action: string; entity: string; entityId?: string; details?: string; createdAt: string };

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useListAdminAuditLogs({ limit: 200 } as any);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");

  const filtered = (logs as Log[]).filter(log => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (filterEntity !== "all" && log.entity !== filterEntity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (log.userEmail || "").toLowerCase().includes(q) || log.entity.includes(q) || (log.entityId || "").includes(q);
    }
    return true;
  });

  const actions = [...new Set((logs as Log[]).map(l => l.action))];
  const entities = [...new Set((logs as Log[]).map(l => l.entity))];

  const formatDetails = (details?: string) => {
    if (!details) return null;
    try { const d = JSON.parse(details); return JSON.stringify(d, null, 2); } catch { return details; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6" /> Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} of {(logs as Log[]).length} entries</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by user, entity..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <div className="text-muted-foreground">Loading...</div> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Details</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{log.userName || "System"}</div>
                    <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize font-medium">{log.entity}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.entityId || "—"}</td>
                  <td className="px-4 py-3 max-w-xs">
                    {log.details && (
                      <span className="text-xs text-muted-foreground truncate block max-w-xs" title={formatDetails(log.details) || ""}>
                        {log.details.slice(0, 60)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No audit logs yet.</div>}
        </div>
      )}
    </div>
  );
}
