import React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ 
  title, 
  description,
  action
}: { 
  title: string; 
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp
}: {
  title: string;
  value: string | number;
  icon?: any;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="mt-4 flex items-baseline gap-4">
        <div className="text-3xl font-bold font-mono tracking-tight">{value}</div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: any; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{description}</p>
    </div>
  );
}
