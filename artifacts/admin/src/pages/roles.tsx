import { useListAdminRoles } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/shared";
import { ShieldCheck, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function RolesPage() {
  const { data: roles, isLoading } = useListAdminRoles();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Roles & Permissions" 
        description="System access levels and assigned permissions." 
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading roles...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles?.map((role) => (
            <div key={role.role} className="border rounded-xl bg-card p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{role.role}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      {formatNumber(role.userCount)} users
                    </div>
                  </div>
                </div>
              </div>
              
              {role.description && (
                <p className="text-sm text-muted-foreground mb-6">{role.description}</p>
              )}

              <div className="mt-auto">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => (
                    <span 
                      key={perm} 
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-secondary text-secondary-foreground border"
                    >
                      {perm}
                    </span>
                  ))}
                  {role.permissions.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">No permissions defined</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
