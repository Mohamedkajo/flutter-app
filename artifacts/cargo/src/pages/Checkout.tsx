import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetCart, useListAddresses, useCreateOrder } from '@workspace/api-client-react';
import { ChevronLeft, MapPin, CreditCard, Wallet, Apple, Banknote, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { OrderInputPaymentMethod } from '@workspace/api-client-react';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading: isCartLoading } = useGetCart({ query: { queryKey: ['cart'] } });
  const { data: addresses, isLoading: isAddressesLoading } = useListAddresses();
  
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<OrderInputPaymentMethod>(OrderInputPaymentMethod.card);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const createOrderMutation = useCreateOrder();

  // Set default address
  if (addresses && addresses.length > 0 && selectedAddressId === null) {
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    setSelectedAddressId(defaultAddr.id);
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a delivery address' });
      return;
    }

    createOrderMutation.mutate({
      data: {
        addressId: selectedAddressId,
        paymentMethod,
        specialInstructions: specialInstructions || undefined,
        couponCode: cart?.couponCode || undefined
      }
    }, {
      onSuccess: (order) => {
        toast({ title: 'Order Placed!', description: 'Your order has been successfully placed.' });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        setLocation(`/orders/${order.id}`);
      }
    });
  };

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation('/cart');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full bg-white shadow-sm border border-border/50">
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Checkout</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Delivery Address */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Delivery Address</h2>
            <Link href="/addresses">
              <Button variant="link" className="text-primary p-0 h-auto font-semibold text-sm">Add New</Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {addresses?.map((address) => (
              <div 
                key={address.id}
                onClick={() => setSelectedAddressId(address.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${selectedAddressId === address.id ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 shrink-0 ${selectedAddressId === address.id ? 'bg-primary border-primary' : 'border-input'}`}>
                  {selectedAddressId === address.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className={selectedAddressId === address.id ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="font-semibold">{address.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{address.address}, {address.apartment ? `${address.apartment}, ` : ''}{address.city}</p>
                </div>
              </div>
            ))}
            
            {addresses?.length === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-border border-dashed text-center">
                <p className="text-muted-foreground mb-4">No addresses saved</p>
                <Link href="/addresses">
                  <Button variant="outline" className="rounded-full text-primary border-primary">
                    <Plus size={16} className="mr-2" /> Add Address
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="font-bold text-lg mb-3">Payment Method</h2>
          <div className="space-y-3">
            {[
              { id: OrderInputPaymentMethod.card, label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-500' },
              { id: OrderInputPaymentMethod.wallet, label: 'Cargo Wallet', icon: Wallet, color: 'text-primary' },
              { id: OrderInputPaymentMethod.apple_pay, label: 'Apple Pay', icon: Apple, color: 'text-black dark:text-white' },
              { id: OrderInputPaymentMethod.cash, label: 'Cash on Delivery', icon: Banknote, color: 'text-green-500' },
            ].map((method) => (
              <div 
                key={method.id}
                onClick={() => setPaymentMethod(method.id as OrderInputPaymentMethod)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
              >
                <div className={`w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 ${method.color}`}>
                  <method.icon size={20} />
                </div>
                <span className="font-semibold flex-1">{method.label}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${paymentMethod === method.id ? 'bg-primary border-primary' : 'border-input'}`}>
                  {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Note to store */}
        <section>
          <h2 className="font-bold text-lg mb-3">Special Instructions</h2>
          <textarea 
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="E.g. Leave at the door, no spicy..." 
            className="w-full bg-white border border-border/50 rounded-2xl p-4 min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          ></textarea>
        </section>

        {/* Order Summary */}
        <section>
          <h2 className="font-bold text-lg mb-3">Order Summary</h2>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items ({cart.items.length})</span>
              <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">${cart.deliveryFee.toFixed(2)}</span>
            </div>
            {cart.discount ? (
              <div className="flex justify-between text-sm text-accent font-medium">
                <span>Discount</span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="border-t border-divider pt-3 mt-1 flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl text-primary">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-divider p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(94,45,145,0.08)] z-40">
        <Button 
          className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 flex justify-between items-center px-6"
          onClick={handlePlaceOrder}
          disabled={!selectedAddressId || createOrderMutation.isPending}
        >
          <span>{createOrderMutation.isPending ? 'Processing...' : 'Place Order'}</span>
          {!createOrderMutation.isPending && (
            <div className="flex items-center gap-2">
              <span>${cart.total.toFixed(2)}</span>
              <ChevronRight size={20} />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
