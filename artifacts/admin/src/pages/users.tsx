import { useState } from "react";
import {
  useListAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useCreateAdminUser,
  getListAdminUsersQueryKey,
} from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Search, MoreVertical, Shield, Trash2, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/10 text-primary",
  merchant: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  driver: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  customer: "bg-muted text-muted-foreground",
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", phone: "", role: "customer" });

  const { data: users, isLoading } = useListAdminUsers({
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  });

  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();
  const createMutation = useCreateAdminUser();

  const handleUpdateRole = (id: number, role: any) => {
    updateMutation.mutate({ userId: id, data: { role } }, {
      onSuccess: () => { toast.success("Role updated"); queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); },
      onError: () => toast.error("Failed to update user"),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate({ userId: id }, {
        onSuccess: () => { toast.success("User deleted"); queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); },
        onError: () => toast.error("Failed to delete user"),
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: createForm as any }, {
      onSuccess: () => {
        toast.success("User created");
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        setIsCreateOpen(false);
        setCreateForm({ name: "", email: "", password: "", phone: "", role: "customer" });
      },
      onError: (err: any) => toast.error(err?.message ?? "Failed to create user"),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Management"
        description="Manage customers, merchants, drivers, and admins."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add User
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="merchant">Merchant</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Spent</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading users...</td></tr>
              ) : users?.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12"><EmptyState title="No users found" description="Try adjusting your search or filters." icon={Users} /></td></tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} /> : user.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${ROLE_COLORS[user.role] ?? ROLE_COLORS.customer}`}>
                        <Shield className="w-3 h-3" /> {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive
                        ? <span className="flex items-center gap-1 text-teal-600"><CheckCircle className="w-4 h-4" /> Active</span>
                        : <span className="flex items-center gap-1 text-destructive"><XCircle className="w-4 h-4" /> Inactive</span>}
                    </td>
                    <td className="px-6 py-4 font-mono">{user.totalOrders ?? 0}</td>
                    <td className="px-6 py-4 font-mono">{formatCurrency(user.totalSpent ?? 0)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          {["customer", "merchant", "driver", "admin"].filter(r => r !== user.role).map(r => (
                            <DropdownMenuItem key={r} onClick={() => handleUpdateRole(user.id, r)}>
                              Set as {r}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id, user.name)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
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

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input required placeholder="John Doe" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+20 1000000000" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input required type="email" placeholder="user@example.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input required type="password" placeholder="Min 6 characters" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
