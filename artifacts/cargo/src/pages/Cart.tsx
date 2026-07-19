import { Link, useLocation } from 'wouter';
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useValidateCoupon } from '@workspace/api-client-react';
import { Minus, Plus, Trash2, Tag, ChevronRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState('');
  
  const { data: cart, isLoading } = useGetCart({ query: { enabled: !!user, queryKey: ['cart'] } });
  
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const validateCouponMutation = useValidateCoupon();

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    updateItemMutation.mutate(
      { itemId: productId, data: { quantity: newQuantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
      }
    );
  };

  const handleRemoveItem = (productId: number) => {
    removeItemMutation.mutate(
      { itemId: productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          toast({ title: 'Item removed', description: 'Item has been removed from cart' });
        }
      }
    );
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    validateCouponMutation.mutate(
      { data: { code: couponCode, orderAmount: cart?.subtotal || 0 } },
      {
        onSuccess: (res) => {
          if (res.valid) {
            toast({ title: 'Coupon applied!', description: `Discount applied successfully.` });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          } else {
            toast({ variant: 'destructive', title: 'Invalid coupon', description: res.message || 'This coupon is not valid.' });
          }
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-40" />
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        <Skeleton className="h-40 w-full rounded-2xl mt-8" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any items to your cart yet.</p>
        <Link href="/">
          <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white h-12 font-semibold">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-foreground">My Cart</h1>
        <p className="text-sm text-muted-foreground">{cart.storeName}</p>
      </div>

      <div className="px-4 space-y-4">
        {cart.items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-border/50">
            <div className="w-20 h-20 bg-surface rounded-xl overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  {item.variant && <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>}
                  {item.addons && item.addons.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">+{item.addons.join(', ')}</p>
                  )}
                </div>
                <button onClick={() => handleRemoveItem(item.productId)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-primary">${item.price}</span>
                <div className="flex items-center bg-surface rounded-full h-8 px-1">
                  <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-foreground hover:bg-white"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-white hover:bg-primary/90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Promo Code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white border-border/50"
            />
          </div>
          <Button 
            onClick={handleApplyCoupon} 
            disabled={!couponCode || validateCouponMutation.isPending}
            className="h-12 rounded-xl bg-primary"
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border/50 space-y-3">
          <h3 className="font-bold mb-2">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:bottom-20 max-w-md mx-auto bg-white border-t border-divider p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(94,45,145,0.08)] z-40">
        <Button 
          className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 flex justify-between items-center px-6"
          onClick={() => setLocation('/checkout')}
        >
          <span>Checkout</span>
          <div className="flex items-center gap-2">
            <span>${cart.total.toFixed(2)}</span>
            <ChevronRight size={20} />
          </div>
        </Button>
      </div>
    </div>
  );
}
