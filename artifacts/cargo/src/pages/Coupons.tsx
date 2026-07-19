import { Link } from 'wouter';
import { useListCoupons, useValidateCoupon } from '@workspace/api-client-react';
import { ChevronLeft, Tag, Copy, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Coupons() {
  const { data: coupons, isLoading } = useListCoupons();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: 'Coupon Copied!', description: `${code} copied to clipboard` });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface pb-28 pt-4">
      <div className="px-4 mb-4 flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-border/50">
            <ChevronLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">My Coupons</h1>
      </div>

      <div className="px-4 space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
        ) : coupons?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Tag size={48} className="mx-auto mb-4 opacity-20" />
            <p>You don't have any coupons available.</p>
          </div>
        ) : (
          coupons?.map(coupon => (
            <div key={coupon.id} className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-border/50 flex">
              {/* Left decorative edge */}
              <div className="w-4 bg-primary flex flex-col justify-between py-2 items-center">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/20"></div>
                ))}
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-primary">{coupon.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-2xl text-accent">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </span>
                    <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OFF</span>
                  </div>
                </div>
                
                <div className="border-t border-dashed border-divider mt-2 pt-3 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">Valid until {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`rounded-full h-8 px-4 font-bold border-primary/20 ${copiedCode === coupon.code ? 'bg-success/10 text-success border-success/20' : 'text-primary'}`}
                    onClick={() => handleCopy(coupon.code)}
                  >
                    {copiedCode === coupon.code ? (
                      <><CheckCircle2 size={14} className="mr-1" /> Copied</>
                    ) : (
                      <><Copy size={14} className="mr-1" /> Code: {coupon.code}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
