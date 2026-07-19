import { Link } from 'wouter';
import { useListAddresses, useAddAddress, useDeleteAddress } from '@workspace/api-client-react';
import { ChevronLeft, MapPin, Plus, Trash2, Home, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { MapAddressPicker } from '@/components/MapAddressPicker';

export default function Addresses() {
  const { data: addresses, isLoading } = useListAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    address: '',
    apartment: '',
    city: 'Dubai',
    lat: 0,
    lng: 0,
  });

  const handleMapAddress = useCallback((address: string, lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, address, lat, lng }));
  }, []);

  const handleAdd = () => {
    const { lat, lng, ...rest } = formData;
    addAddress.mutate({ data: rest }, {
      onSuccess: () => {
        toast({ title: 'Address added successfully' });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        setIsOpen(false);
        setFormData({ label: '', address: '', apartment: '', city: 'Dubai', lat: 0, lng: 0 });
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteAddress.mutate({ addressId: id }, {
      onSuccess: () => {
        toast({ title: 'Address deleted' });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
      },
    });
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return <Home size={20} />;
    if (l.includes('work') || l.includes('office')) return <Building size={20} />;
    return <MapPin size={20} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Saved Addresses</h1>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-primary text-white hover:bg-primary/90">
              <Plus size={20} />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md rounded-[32px] p-6 max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Address</DialogTitle>
              <p className="text-sm text-muted-foreground">Drag the pin or tap the map to set your exact location</p>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Interactive map */}
              <MapAddressPicker onAddressSelected={handleMapAddress} />

              {/* Form fields */}
              <div className="space-y-3">
                <Input
                  placeholder="Label (e.g. Home, Work, Office)"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="rounded-xl h-12"
                />
                <Input
                  placeholder="Full Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="rounded-xl h-12"
                />
                <Input
                  placeholder="Apartment / Floor / Building (Optional)"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <Button
              className="w-full rounded-full h-12 bg-primary text-white font-bold mt-2"
              onClick={handleAdd}
              disabled={addAddress.isPending || !formData.address || !formData.label}
            >
              {addAddress.isPending ? 'Saving…' : 'Save Address'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address list */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : addresses?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MapPin size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No saved addresses yet</p>
            <p className="text-sm mt-1">Tap + to add your first address</p>
          </div>
        ) : (
          addresses?.map(address => (
            <div
              key={address.id}
              className="bg-white p-4 rounded-2xl flex items-start justify-between shadow-sm border border-border/50"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-primary shrink-0">
                  {getLabelIcon(address.label)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{address.label}</h3>
                    {address.isDefault && (
                      <Badge className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-none">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{address.address}</p>
                  {address.apartment && (
                    <p className="text-xs text-muted-foreground mt-1">Apt: {address.apartment}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDelete(address.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
