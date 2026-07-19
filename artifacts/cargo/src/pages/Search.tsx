import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search as SearchIcon, SlidersHorizontal, Star, Clock, MapPin, X } from 'lucide-react';
import { useListStores, useListProducts } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stores');

  // Simple debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(handler);
  }, [query]);

  const { data: stores, isLoading: isLoadingStores } = useListStores({ search: debouncedQuery });
  const { data: products, isLoading: isLoadingProducts } = useListProducts({ search: debouncedQuery });

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="sticky top-0 z-40 bg-primary px-4 pt-3 pb-4 rounded-b-3xl">
        <div className="relative flex items-center">
          {/* Search icon — left */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <SearchIcon size={18} className="text-primary" />
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores or products..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full pl-10 pr-20 bg-white border-none rounded-full h-12 text-foreground shadow-none focus-visible:ring-0"
          />

          {/* Clear button — shows when there's text */}
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center"
            >
              <X size={11} className="text-foreground/60" />
            </button>
          )}

          {/* Filter button — right */}
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
            <SlidersHorizontal size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-full p-1 h-12 shadow-sm border border-border/50">
            <TabsTrigger value="stores" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Stores</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stores" className="mt-4 space-y-4">
            {isLoadingStores ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : stores?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>No stores found for "{debouncedQuery}"</p>
              </div>
            ) : (
              stores?.map(store => (
                <Link key={store.id} href={`/stores/${store.id}`}>
                  <Card className="rounded-2xl border-none shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex h-24">
                      <div className="w-24 shrink-0">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-base truncate">{store.name}</h3>
                        <p className="text-xs text-muted-foreground">{store.categoryName}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-warning fill-warning" />
                            <span>{store.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-primary" />
                            <span>{store.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="products" className="mt-4 grid grid-cols-2 gap-3">
            {isLoadingProducts ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            ) : products?.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-muted-foreground">
                <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>No products found for "{debouncedQuery}"</p>
              </div>
            ) : (
              products?.map(product => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="rounded-2xl border-none shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="relative h-28 p-2">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                      {product.discountPercent && (
                        <Badge className="absolute top-2 left-2 bg-accent hover:bg-accent border-none font-bold">
                          -{product.discountPercent}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 border-t border-divider">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground truncate mb-2">{product.storeName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">${product.price}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          +
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
