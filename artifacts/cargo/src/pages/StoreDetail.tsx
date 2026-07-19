import { useRoute, Link } from 'wouter';
import { useGetStore, useGetStoreProducts } from '@workspace/api-client-react';
import { Star, Clock, MapPin, ChevronLeft, Search, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StoreDetail() {
  const [, params] = useRoute('/stores/:storeId');
  const storeId = params?.storeId ? parseInt(params.storeId, 10) : 0;

  const { data: store, isLoading: isLoadingStore } = useGetStore(storeId, { query: { enabled: !!storeId } as any });
  
  const { data: products, isLoading: isLoadingProducts } = useGetStoreProducts(storeId, { query: { enabled: !!storeId } as any });

  if (isLoadingStore) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Skeleton className="h-64 w-full" />
        <div className="p-4 -mt-10 relative z-10">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full mt-6 rounded-full" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!store) return <div className="p-8 text-center">Store not found</div>;

  const categories = Array.from(new Set(products?.map(p => p.categoryName) || []));

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-20">
      <div className="relative h-64 bg-primary/10">
        <Link href="/stores">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full h-10 w-10">
            <ChevronLeft size={24} />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full h-10 w-10">
          <Search size={20} />
        </Button>
        
        {store.bannerImage ? (
          <img src={store.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <img src={store.image} alt="Banner" className="w-full h-full object-cover blur-sm" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

      <div className="px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(94,45,145,0.08)] border border-border/50">
          <div className="flex justify-between items-start">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md -mt-12 relative z-20">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                     style={{ background: 'linear-gradient(135deg,#5E2D91 0%,#F25B57 100%)' }}>
                  {store.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20"><Info size={14} className="mr-1" /> Info</Badge>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mt-3 text-foreground">{store.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{store.categoryName} • {store.tags?.join(', ')}</p>
          
          <div className="flex items-center gap-4 mt-4 py-3 border-y border-divider">
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 font-bold text-base">
                <Star size={16} className="text-warning fill-warning" />
                {store.rating}
              </div>
              <span className="text-xs text-muted-foreground">{store.reviewCount}+ Ratings</span>
            </div>
            <div className="w-px h-8 bg-divider"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 font-bold text-base">
                <Clock size={16} className="text-primary" />
                {store.deliveryTime}
              </div>
              <span className="text-xs text-muted-foreground">Delivery Time</span>
            </div>
            <div className="w-px h-8 bg-divider"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-1 font-bold text-base">
                <MapPin size={16} className="text-primary" />
                {store.distance != null ? `${store.distance} km` : '—'}
              </div>
              <span className="text-xs text-muted-foreground">Distance</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultValue={categories[0] || 'all'}>
            <TabsList className="w-full overflow-x-auto justify-start h-auto p-1 bg-white rounded-full border border-border/50 no-scrollbar mb-4">
              <TabsTrigger value="all" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">
                All
              </TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white whitespace-nowrap">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0 space-y-6">
              {categories.map(cat => (
                <div key={cat} className="space-y-3">
                  <h3 className="font-bold text-lg px-1">{cat}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {products?.filter(p => p.categoryName === cat).map(product => (
                      <Link key={product.id} href={`/products/${product.id}`}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="relative h-32 p-2 bg-surface/50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                            {product.discountPercent && (
                              <Badge className="absolute top-2 left-2 bg-accent hover:bg-accent border-none font-bold text-[10px] px-1.5 py-0.5">
                                -{product.discountPercent}%
                              </Badge>
                            )}
                          </div>
                          <div className="p-3 border-t border-divider">
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[40px]">{product.name}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col">
                                {product.originalPrice && <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice}</span>}
                                <span className="font-bold text-primary">${product.price}</span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                                +
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            {categories.map(cat => (
              <TabsContent key={cat} value={cat} className="mt-0 grid grid-cols-2 gap-3">
                {products?.filter(p => p.categoryName === cat).map(product => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="relative h-32 p-2 bg-surface/50">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="p-3 border-t border-divider">
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[40px]">{product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary">${product.price}</span>
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">+</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
