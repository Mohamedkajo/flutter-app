import { Link, useSearch } from 'wouter';
import {
  useListStores,
  useListCategories,
  useGetNearbyStores,
} from '@workspace/api-client-react';
import { Star, Clock, MapPin, Search, ArrowLeft, Wifi, Navigation } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

/* ─── helpers ──────────────────────────────────────────────────── */

function parseSearch(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    filter: params.get('filter') ?? undefined,       // 'online' | 'nearby' | undefined
    category: params.get('category') ?? undefined,
  };
}

/* ─── store card (shared) ───────────────────────────────────────── */

function StoreCard({ store }: { store: any }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(94,45,145,0.06)] border border-border/50 cursor-pointer hover:shadow-md transition-shadow">
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {store.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-accent hover:bg-accent border-none text-white font-semibold">
              Featured
            </Badge>
          )}
          {store.isOnline && (
            <div className="absolute top-3 right-3 bg-teal-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              Online
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Star size={12} className="text-warning fill-warning" />
              <span className="text-xs font-bold">{store.rating}</span>
              <span className="text-[10px] text-muted-foreground ml-1">({store.reviewCount})</span>
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock size={12} className="text-primary" />
              <span className="text-xs font-bold">{store.deliveryTime}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 pt-2 pb-4">
          {/* Logo — circle with initials fallback */}
          <div className="w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-md shrink-0 -mt-7">
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                 style={{ background: 'linear-gradient(135deg,#5E2D91 0%,#F25B57 100%)' }}>
              {store.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-base leading-tight truncate">{store.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{store.categoryName}</p>

            {/* Info chips */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-primary/8 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                <Clock size={10} /> {store.deliveryTime}
              </span>
              <span className="inline-flex items-center gap-1 bg-muted/60 text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-full">
                ${store.deliveryFee} delivery
              </span>
              {store.distance != null && (
                <span className="inline-flex items-center gap-1 bg-muted/60 text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-full">
                  <MapPin size={10} /> {store.distance} km
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── skeleton list ─────────────────────────────────────────────── */

function StoreSkeletons() {
  return (
    <>
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-52 w-full rounded-2xl" />
      ))}
    </>
  );
}

/* ─── section configs ───────────────────────────────────────────── */

const SECTION_META: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  online: {
    title: 'Shop Online',
    subtitle: 'Vendors who sell & deliver online',
    icon: <Wifi size={18} className="text-teal-500" />,
  },
  nearby: {
    title: 'Popular Nearby',
    subtitle: 'Stores close to your location',
    icon: <Navigation size={18} className="text-primary" />,
  },
};

/* ─── main component ────────────────────────────────────────────── */

export default function StoreListing() {
  const rawSearch = useSearch();
  const { filter, category: initialCategory } = parseSearch(rawSearch);

  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);

  const isOnlineSection  = filter === 'online';
  const isNearbySection  = filter === 'nearby';
  const isFiltered       = isOnlineSection || isNearbySection;

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  // Data source depends on filter
  const { data: allStoresData,  isLoading: loadingOnline  } = useListStores();
  const onlineStores = allStoresData?.filter(s => s.isOnline);
  const { data: nearbyStores,  isLoading: loadingNearby  } = useGetNearbyStores();
  const { data: allStores,     isLoading: loadingAll     } = useListStores({ category: activeCategory });

  const stores    = isOnlineSection ? onlineStores : isNearbySection ? nearbyStores : allStores;
  const isLoading = isOnlineSection ? loadingOnline : isNearbySection ? loadingNearby : loadingAll;

  const meta = filter ? SECTION_META[filter] : null;
  const pageTitle = meta?.title ?? 'All Stores';

  return (
    <div className="flex flex-col min-h-full bg-surface pb-6">

      {/* Category chips — only shown for "All Stores" view, sticky below the layout header */}
      {!isFiltered && (
        <div className="bg-primary px-4 pt-3 pb-4 sticky top-0 z-40 rounded-b-3xl shadow-md"
             style={{ background: 'linear-gradient(135deg, #5E2D91 0%, #47206E 100%)' }}>
          <h1 className="text-xl font-bold text-white mb-3">All Stores</h1>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
            <Badge
              className={`px-4 py-2 rounded-full cursor-pointer border-none whitespace-nowrap shrink-0 ${
                !activeCategory ? 'bg-white text-primary hover:bg-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={() => setActiveCategory(undefined)}
            >
              All
            </Badge>
            {isLoadingCategories
              ? Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-8 rounded-full bg-white/20 shrink-0" />
                ))
              : categories?.map(cat => (
                  <Badge
                    key={cat.id}
                    className={`px-4 py-2 rounded-full cursor-pointer border-none whitespace-nowrap shrink-0 ${
                      activeCategory === cat.slug
                        ? 'bg-white text-primary hover:bg-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    onClick={() => setActiveCategory(cat.slug)}
                  >
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
          </div>
        </div>
      )}

      {/* ── Store list ───────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-4">
        {isLoading ? (
          <StoreSkeletons />
        ) : !stores?.length ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Search size={32} className="text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No stores found</h3>
            <p className="text-sm">
              {isFiltered ? 'Nothing here yet — check back soon.' : 'Try selecting a different category.'}
            </p>
          </div>
        ) : (
          stores.map((store: (typeof stores)[0]) => <StoreCard key={store.id} store={store} />)
        )}
      </div>
    </div>
  );
}
