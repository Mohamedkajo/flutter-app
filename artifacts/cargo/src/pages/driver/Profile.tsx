import { useGetDriverProfile, useUpdateDriverProfile } from '@workspace/api-client-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function DriverProfile() {
  const { data: profile, isLoading } = useGetDriverProfile();
  const updateProfile = useUpdateDriverProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    vehiclePlate: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        vehicleType: profile.vehicleType || '',
        vehiclePlate: profile.vehiclePlate || '',
      });
    }
  }, [profile]);

  const handleSubmit = () => {
    updateProfile.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: 'Profile Updated', description: 'Your driver profile has been saved.' });
        queryClient.invalidateQueries({ queryKey: ['driver', 'profile'] });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Driver Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your vehicle and contact details</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <div className="h-24 bg-primary/10 w-full relative"></div>
        <CardContent className="pt-0 relative">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md absolute -top-10">
            <AvatarImage src={profile?.avatar || ''} />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
              {profile?.name?.charAt(0) || 'D'}
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-14 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="h-12 rounded-xl bg-surface border-border/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="h-12 rounded-xl bg-surface border-border/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle Type</label>
                <Input 
                  value={formData.vehicleType} 
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} 
                  className="h-12 rounded-xl bg-surface border-border/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">License Plate</label>
                <Input 
                  value={formData.vehiclePlate} 
                  onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})} 
                  className="h-12 rounded-xl bg-surface border-border/50"
                />
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border/50">
              <Button 
                onClick={handleSubmit} 
                disabled={updateProfile.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold shadow-md shadow-primary/20"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
