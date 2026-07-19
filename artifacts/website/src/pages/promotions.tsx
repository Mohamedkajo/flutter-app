import { useState, useEffect } from "react";
import { Zap, Clock, Percent, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";

function timeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

export default function PromotionsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>("/flash-sales"),
      apiFetch<any[]>("/coupons").catch(() => []),
    ]).then(([s, c]) => { setSales(s); setCoupons(c); }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-600 font-semibold mb-4">
            <Zap className="w-5 h-5" /> Limited Time Offers
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Promotions & Deals</h1>
          <p className="text-muted-foreground text-lg">Flash sales, exclusive coupons, and special offers updated daily.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Flash Sales */}
        <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-6"><Zap className="text-yellow-500" />Flash Sales</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground mb-12 border rounded-2xl">No active flash sales right now. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sales.map((sale: any) => (
              <div key={sale.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                {sale.bannerImage && <img src={sale.bannerImage} className="w-full h-44 object-cover" alt={sale.title} onError={e => (e.currentTarget.style.display="none")} />}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{sale.title}</h3>
                    <span className="bg-red-100 text-red-600 font-black px-3 py-1 rounded-xl text-lg flex items-center gap-0.5">
                      {sale.discountPercent}<Percent className="w-4 h-4" />
                    </span>
                  </div>
                  {sale.description && <p className="text-muted-foreground text-sm mb-3">{sale.description}</p>}
                  <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                    <Clock className="w-4 h-4" />
                    {timeLeft(sale.endsAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupons */}
        {coupons.length > 0 && (
          <>
            <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-6"><Tag className="text-primary" />Available Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c: any) => (
                <div key={c.id} className="border-2 border-dashed border-primary/30 rounded-2xl p-5 bg-primary/5 flex items-center gap-4">
                  <div className="text-primary font-black text-2xl border-r-2 border-dashed border-primary/30 pr-4">
                    {c.discountType === "percent" ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </div>
                  <div>
                    <p className="font-bold text-primary">{c.code}</p>
                    <p className="text-sm text-muted-foreground">{c.description || "Apply at checkout"}</p>
                    {c.minOrderAmount && <p className="text-xs text-muted-foreground mt-0.5">Min. order: ${c.minOrderAmount}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
