import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Star, Clock, ChevronRight, Timer, MapPin } from 'lucide-react';
import { 
  useGetFeaturedStores, 
  useGetNearbyStores, 
  useListCategories, 
  useListFlashSales, 
  useGetTrendingProducts,
  useListStores,
} from '@workspace/api-client-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: featuredStores, isLoading: isLoadingFeatured } = useGetFeaturedStores();
  const { data: nearbyStores, isLoading: isLoadingNearby } = useGetNearbyStores();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: flashSales, isLoading: isLoadingFlashSales } = useListFlashSales();
  const { data: trendingProducts, isLoading: isLoadingTrending } = useGetTrendingProducts();

  const services = [
    { id: 'scooter', name: 'Scooter', icon: '🛵', color: 'bg-orange-100', text: 'text-orange-600', href: '/stores?category=food' },
    { id: 'package', name: 'Package', icon: '📦', color: 'bg-blue-100', text: 'text-blue-600', href: '/stores' },
    { id: 'tricycle', name: 'Tricycle', icon: '🛺', color: 'bg-purple-100', text: 'text-purple-600', href: '/stores' },
    { id: 'van', name: 'Van', icon: '🚐', color: 'bg-green-100', text: 'text-green-600', href: '/stores' },
  ];

  const { data: allStores, isLoading: isLoadingOnline } = useListStores();
  const onlineStores = allStores?.filter(s => s.isOnline);

  const activeFlashSale = flashSales?.[0];

  return (
    <div className="flex flex-col gap-6 pb-8 pt-4">
      {/* Featured Stores - Stories Carousel */}
      <section className="px-4">
        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
          {isLoadingFeatured ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))
          ) : (
            featuredStores?.map((store, i) => (
              <Link key={store.id} href={`/stores/${store.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer w-[76px]"
                >
                  {/* Circle with gradient ring */}
                  <div className="relative">
                    <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-accent to-primary">
                      <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-border/60 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm whitespace-nowrap">
                      <Star size={9} className="text-amber-400 fill-amber-400" />
                      <span className="text-[9px] font-bold text-foreground">{store.rating}</span>
                    </div>
                  </div>

                  {/* Name */}
                  <span className="text-[11px] font-semibold text-center w-full truncate leading-tight mt-1">
                    {store.name}
                  </span>

                  {/* Delivery time */}
                  <div className="flex items-center gap-0.5 text-muted-foreground">
                    <Clock size={9} className="text-primary" />
                    <span className="text-[9px] font-medium">{store.deliveryTime}</span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4">
        <div className="grid grid-cols-4 gap-3">
          {services.map((service, i) => (
            <Link key={service.id} href={service.href}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-border/50 cursor-pointer hover:shadow-md active:scale-95 transition-all"
              >
                <div className={`w-12 h-12 rounded-full ${service.color} ${service.text} flex items-center justify-center text-2xl`}>
                  {service.icon}
                </div>
                <span className="text-[10px] font-semibold">{service.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      {activeFlashSale && (
        <section className="px-4">
          <Link href="/flash-sales">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-destructive to-accent p-5 text-white shadow-lg cursor-pointer"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 mb-2 border-none">
                    <Timer size={12} className="mr-1" /> Flash Sale
                  </Badge>
                  <h3 className="text-lg font-bold">Up to {activeFlashSale.discountPercent}% OFF</h3>
                  <p className="text-sm text-white/80">Ends in 2h 45m</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl"></div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* Online Stores */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Shop Online</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Vendors who sell online</p>
          </div>
          <Link href="/stores?filter=online" className="text-sm font-semibold text-primary flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1">
          {isLoadingOnline ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="shrink-0 w-28 flex flex-col gap-2">
                <Skeleton className="w-28 h-24 rounded-2xl" />
                <Skeleton className="w-20 h-4 rounded-full mx-auto" />
              </div>
            ))
          ) : (
            onlineStores?.map((store: (typeof onlineStores)[0], i: number) => (
              <Link key={store.id} href={`/stores/${store.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  className="shrink-0 w-28 cursor-pointer active:scale-95 transition-transform"
                >
                  {/* Card */}
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden shadow-sm border border-border/30">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Online badge */}
                    <div className="absolute top-1.5 right-1.5 bg-teal-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-white inline-block" />
                      Online
                    </div>
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-white font-bold text-[11px] px-1 leading-tight truncate">
                      {store.name}
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="mt-1.5 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 truncate max-w-full">
                      {store.categoryIcon} {store.categoryName}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Explore Categories</h2>
          <Link href="/categories" className="text-sm font-semibold text-primary flex items-center gap-0.5">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {isLoadingCategories ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))
          ) : (
            categories?.slice(0, 8).map((category, i) => (
              <Link key={category.id} href={`/stores?category=${category.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex flex-col items-center justify-center gap-2 bg-white p-2 h-20 rounded-2xl shadow-[0_2px_10px_rgba(94,45,145,0.04)] border border-border/30 cursor-pointer"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-[10px] font-medium text-center leading-tight">{category.name}</span>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Popular Nearby */}
      <section className="px-0">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg font-bold text-foreground">Popular Nearby</h2>
          <Link href="/stores?filter=nearby" className="text-sm font-semibold text-primary flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar" style={{ touchAction: 'pan-x', cursor: 'grab' }}>
          {isLoadingNearby ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-64 h-48 rounded-2xl shrink-0" />
            ))
          ) : (
            nearbyStores?.map((store, i) => (
              <Link key={store.id} href={`/stores/${store.id}`}>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="w-64 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 cursor-pointer"
                >
                  <div className="relative h-32">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="text-xs font-bold">{store.rating}</span>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock size={12} className="text-primary" />
                      <span className="text-xs font-bold">{store.deliveryTime}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm truncate">{store.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{store.categoryName}</span>
                      {store.distance != null && <><span>•</span><span>{store.distance}km</span></>}
                      <span>•</span>
                      <span>${store.deliveryFee} delivery</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Trending Items</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {isLoadingTrending ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))
          ) : (
            trendingProducts?.slice(0, 4).map((product, i) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(94,45,145,0.06)] border border-border/30 cursor-pointer"
                >
                  <div className="relative h-28 p-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-xl" />
                    {product.discountPercent && (
                      <Badge className="absolute top-2 left-2 bg-accent hover:bg-accent border-none font-bold">
                        -{product.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 border-t border-divider">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        {product.originalPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                        <span className="font-bold text-primary">${product.price}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        +
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
