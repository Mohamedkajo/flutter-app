import { useEffect } from "react";
import { 
  useGetAdminSettings, 
  useUpdateAdminSettings,
  getGetAdminSettingsQueryKey
} from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateMutation = useUpdateAdminSettings();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      platformName: "",
      currency: "",
      defaultDeliveryFee: 0,
      maxDeliveryRadius: 0,
      commissionRate: 0,
      supportEmail: "",
      supportPhone: "",
      maintenanceMode: false,
      allowGuestCheckout: false,
      loyaltyPointsRate: 0,
      minWithdrawal: 0,
    }
  });

  useEffect(() => {
    if (settings) {
      reset({
        platformName: settings.platformName,
        currency: settings.currency,
        defaultDeliveryFee: settings.defaultDeliveryFee,
        maxDeliveryRadius: settings.maxDeliveryRadius,
        commissionRate: settings.commissionRate,
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        maintenanceMode: !!settings.maintenanceMode,
        allowGuestCheckout: !!settings.allowGuestCheckout,
        loyaltyPointsRate: settings.loyaltyPointsRate || 0,
        minWithdrawal: settings.minWithdrawal || 0,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      defaultDeliveryFee: Number(data.defaultDeliveryFee),
      maxDeliveryRadius: Number(data.maxDeliveryRadius),
      commissionRate: Number(data.commissionRate),
      loyaltyPointsRate: Number(data.loyaltyPointsRate),
      minWithdrawal: Number(data.minWithdrawal),
    };

    updateMutation.mutate({ data: payload }, {
      onSuccess: () => {
        toast.success("Settings saved successfully");
        queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
      },
      onError: () => toast.error("Failed to save settings")
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Platform Settings" description="Global configuration variables." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-lg font-medium border-b pb-4">
            <SettingsIcon className="w-5 h-5" />
            General Info
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input {...register("platformName")} required />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol/Code</Label>
              <Input {...register("currency")} required />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input type="email" {...register("supportEmail")} />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input {...register("supportPhone")} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
          <div className="text-lg font-medium border-b pb-4">Business Logic</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default Delivery Fee ($)</Label>
              <Input type="number" step="0.01" {...register("defaultDeliveryFee")} required />
            </div>
            <div className="space-y-2">
              <Label>Max Delivery Radius (km)</Label>
              <Input type="number" step="0.1" {...register("maxDeliveryRadius")} required />
            </div>
            <div className="space-y-2">
              <Label>Platform Commission Rate (%)</Label>
              <Input type="number" step="0.1" {...register("commissionRate")} required />
              <p className="text-xs text-muted-foreground">Percentage taken from merchant sales.</p>
            </div>
            <div className="space-y-2">
              <Label>Loyalty Points Rate</Label>
              <Input type="number" step="0.01" {...register("loyaltyPointsRate")} />
              <p className="text-xs text-muted-foreground">Points earned per $1 spent.</p>
            </div>
            <div className="space-y-2">
              <Label>Minimum Withdrawal ($)</Label>
              <Input type="number" step="1" {...register("minWithdrawal")} />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
          <div className="text-lg font-medium border-b pb-4">System Toggles</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Block non-admins from accessing the platform.</p>
              </div>
              <Switch 
                checked={watch("maintenanceMode")} 
                onCheckedChange={(c) => setValue("maintenanceMode", c)} 
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Allow Guest Checkout</Label>
                <p className="text-sm text-muted-foreground">Let users order without creating an account.</p>
              </div>
              <Switch 
                checked={watch("allowGuestCheckout")} 
                onCheckedChange={(c) => setValue("allowGuestCheckout", c)} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
