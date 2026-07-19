import { useState, useEffect } from 'react';
import { useGetMerchantProfile, useUpdateMerchantProfile } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Store, Phone, MapPin, Clock } from 'lucide-react';

export default function StoreSettings() {
  const { data: profile, isLoading } = useGetMerchantProfile();
  const updateProfile = useUpdateMerchantProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    openingHours: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        description: profile.description || '',
        phone: profile.phone || '',
        address: profile.address || '',
        openingHours: profile.openingHours || '',
      });
    }
  }, [profile]);

  const handleSubmit = () => {
    updateProfile.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: 'Profile Updated', description: 'Your store settings have been saved.' });
        queryClient.invalidateQueries({ queryKey: ['merchant', 'profile'] });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store's public profile and details.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <Card className="rounded-xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Public Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Store size={16} className="text-primary" /> Store Name
              </label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="rounded-xl min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone size={16} className="text-primary" /> Phone Number
                </label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> Opening Hours
                </label>
                <Input 
                  value={formData.openingHours} 
                  onChange={(e) => setFormData({...formData, openingHours: e.target.value})} 
                  placeholder="e.g. 09:00 AM - 10:00 PM"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Address
              </label>
              <Textarea 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="rounded-xl min-h-[80px] resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button 
                onClick={handleSubmit} 
                disabled={updateProfile.isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-bold"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
