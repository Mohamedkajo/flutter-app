import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetProduct, useAddToCart } from '@workspace/api-client-react';
import { ChevronLeft, Heart, Share2, Star, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:productId');
  const [, setLocation] = useLocation();
  const productId = params?.productId ? parseInt(params.productId, 10) : 0;
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } as any });

  const addToCartMutation = useAddToCart();

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-surface">
        <Skeleton className="h-80 w-full rounded-b-3xl" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full mt-6" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      data: {
        productId,
        quantity,
        variantId: selectedVariant || undefined,
        addonIds: selectedAddons.length > 0 ? selectedAddons : undefined
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: `${quantity}x ${product.name} added to your cart.`
        });
        setLocation('/cart');
      }
    });
  };

  const toggleAddon = (id: number) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  let totalPrice = product.price;
  if (selectedVariant) {
    const variant = product.variants?.find(v => v.id === selectedVariant);
    if (variant) totalPrice = variant.price;
  }
  selectedAddons.forEach(addonId => {
    const addon = product.addons?.find(a => a.id === addonId);
    if (addon) totalPrice += addon.price;
  });
  totalPrice *= quantity;

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-24 relative">
      <div className="relative h-80 bg-white rounded-b-[40px] shadow-sm overflow-hidden flex items-center justify-center p-8">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="bg-surface/80 backdrop-blur-md rounded-full">
            <ChevronLeft size={24} />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="bg-surface/80 backdrop-blur-md rounded-full">
              <Share2 size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-surface/80 backdrop-blur-md rounded-full text-destructive">
              <Heart size={20} />
            </Button>
          </div>
        </div>
        
        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        
        {product.discountPercent && (
          <Badge className="absolute bottom-6 left-6 bg-accent border-none px-3 py-1 text-sm font-bold shadow-lg">
            -{product.discountPercent}% OFF
          </Badge>
        )}
      </div>

      <div className="p-5 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
            <Link href={`/stores/${product.storeId}`}>
              <p className="text-primary font-medium text-sm mt-1 flex items-center hover:underline">
                {product.storeName}
              </p>
            </Link>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-warning fill-warning" />
            <span>{product.rating || '4.5'}</span>
            <span className="text-muted-foreground ml-1">({product.reviewCount || 100}+)</span>
          </div>
        </div>

        {product.description && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.variants && product.variants.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-3">Variants</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map(variant => (
                <div 
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedVariant === variant.id ? 'border-primary bg-primary/5' : 'border-border bg-white'}`}
                >
                  <p className="font-semibold text-sm">{variant.name}</p>
                  <p className="text-primary font-bold mt-1">+${variant.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.addons && product.addons.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-3">Add-ons</h3>
            <div className="space-y-3">
              {product.addons.map(addon => (
                <div 
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border bg-white cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedAddons.includes(addon.id) ? 'bg-primary border-primary text-white' : 'border-input'}`}>
                      {selectedAddons.includes(addon.id) && <span className="text-xs">✓</span>}
                    </div>
                    <span className="font-medium text-sm">{addon.name}</span>
                  </div>
                  <span className="text-primary font-bold">+${addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-divider p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(94,45,145,0.08)] z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface rounded-full h-14 p-1 border border-border/50">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-12 w-12 rounded-full hover:bg-white text-foreground"
            >
              <Minus size={18} />
            </Button>
            <span className="w-8 text-center font-bold text-lg">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setQuantity(quantity + 1)}
              className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90"
            >
              <Plus size={18} />
            </Button>
          </div>
          
          <Button 
            className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? 'Adding...' : `Add - $${totalPrice.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
