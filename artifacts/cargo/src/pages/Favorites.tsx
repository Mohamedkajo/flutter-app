import { Link } from 'wouter';
import { useListFavorites, useToggleFavorite } from '@workspace/api-client-react';
import { Heart, Star, ChevronLeft, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export default function Favorites() {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useListFavorites({ query: { enabled: !!user } as any });
  const toggleFavorite = useToggleFavorite();
  const queryClient = useQueryClient();

  const handleToggle = (type: 'store' | 'product', refId: number) => {
    toggleFavorite.mutate(
      { data: { type, refId } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }) }
    );
  };

  const storeFavorites = favorites?.filter(f => f.type === 'store') || [];
  const productFavorites = favorites?.filter(f => f.type === 'product') || [];

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Favorites</h1>
      </div>

      <div className="px-4">
        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-full p-1 h-12 shadow-sm border border-border/50 mb-6">
            <TabsTrigger value="stores" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Stores</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stores" className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : storeFavorites.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p>No favorite stores yet</p>
              </div>
            ) : (
              storeFavorites.map(store => (
                <div key={store.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm border border-border/50 relative group">
                  <Link href={`/stores/${store.refId}`} className="absolute inset-0 z-0"></Link>
                  <div className="w-20 h-20 bg-surface rounded-xl overflow-hidden shrink-0 z-10 pointer-events-none">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center z-10 pointer-events-none">
                    <h3 className="font-bold text-sm line-clamp-1">{store.name}</h3>
                    <p className="text-xs text-muted-foreground">{store.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-warning fill-warning" />
                        <span>{store.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('store', store.refId)} 
                    className="z-20 p-2 text-destructive hover:bg-destructive/10 rounded-full h-fit self-center"
                  >
                    <Heart size={20} className="fill-destructive" />
                  </button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="products" className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            ) : productFavorites.length === 0 ? (
              <div className="col-span-2 text-center py-20 text-muted-foreground">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p>No favorite products yet</p>
              </div>
            ) : (
              productFavorites.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 relative">
                  <Link href={`/products/${product.refId}`} className="absolute inset-0 z-0"></Link>
                  <button 
                    onClick={() => handleToggle('product', product.refId)} 
                    className="absolute top-2 right-2 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-destructive shadow-sm"
                  >
                    <Heart size={16} className="fill-destructive" />
                  </button>
                  <div className="relative h-28 p-2 z-10 pointer-events-none">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="p-3 border-t border-divider z-10 pointer-events-none">
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[40px]">{product.name}</h4>
                    <div className="mt-2">
                      <span className="font-bold text-primary">${product.price}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
