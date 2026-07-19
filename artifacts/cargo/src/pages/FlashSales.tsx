import { Link } from 'wouter';
import { useListFlashSales } from '@workspace/api-client-react';
import { ChevronLeft, Timer, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FlashSales() {
  const { data: flashSales, isLoading } = useListFlashSales();
  
  const activeSale = flashSales?.[0]; // Assuming the first one is the active one

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 relative">
      <div className="bg-gradient-to-r from-destructive to-accent pt-6 pb-12 px-4 rounded-b-[40px] text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -translate-x-1/2"></div>
        
        <div className="flex items-center gap-3 relative z-10 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-none">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Flash Sales</h1>
        </div>

        <div className="relative z-10 text-center">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-3 backdrop-blur-sm">
            <Timer size={14} className="mr-1" /> Ends in 02:45:10
          </Badge>
          <h2 className="text-3xl font-black mb-2">{activeSale?.title || 'Super Mega Sale'}</h2>
          <p className="text-white/80 text-sm max-w-[250px] mx-auto">{activeSale?.description || 'Get up to 70% off on selected items before the timer runs out!'}</p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
          ) : activeSale?.products?.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-muted-foreground bg-white rounded-3xl shadow-sm">
              <Timer size={48} className="mx-auto mb-4 opacity-20" />
              <p>No active flash sales right now</p>
            </div>
          ) : (
            activeSale?.products?.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(94,45,145,0.06)] border border-border/50 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="relative h-36 p-2 bg-surface/30">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    {product.discountPercent && (
                      <Badge className="absolute top-2 left-2 bg-destructive hover:bg-destructive border-none font-black text-sm px-2 py-0.5 shadow-md animate-pulse">
                        -{product.discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 border-t border-divider">
                    <p className="text-[10px] text-muted-foreground mb-1 truncate">{product.storeName}</p>
                    <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-2 min-h-[40px]">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={12} className="text-warning fill-warning" />
                      <span className="text-[10px] font-bold">{product.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.originalPrice && <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice}</span>}
                        <span className="font-black text-destructive text-lg leading-none">${product.price}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
