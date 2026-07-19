import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShoppingBag, Zap, Star, Truck, Shield, ChevronRight, Apple, Play, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

const FEATURES = [
  { icon: ShoppingBag, title: "Huge Selection", desc: "Browse thousands of products from hundreds of local and premium stores all in one place." },
  { icon: Zap, title: "Flash Deals", desc: "Limited-time offers and flash sales with discounts up to 70% off, updated daily." },
  { icon: Truck, title: "Fast Delivery", desc: "Real-time tracking and same-day delivery options to your doorstep." },
  { icon: Shield, title: "Safe & Secure", desc: "Secure payments, buyer protection, and verified merchant accounts." },
];

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1,200+", label: "Partner Stores" },
  { value: "99.8%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Customer Support" },
];

export default function HomePage() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/flash-sales").then(setFlashSales).catch(() => {});
    apiFetch<any[]>("/stores?limit=6&featured=true").then(setStores).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-purple-50 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" /> Flash deals updated daily
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Shop Smarter,<br />
                <span className="text-primary">Deliver Faster</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Cargo connects you with thousands of local stores and premium brands. Shop everything in one place and get it delivered to your door.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/download"
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                  <Apple className="w-5 h-5" /> Download for iOS
                </Link>
                <Link href="/download"
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all">
                  <Play className="w-5 h-5" /> Get on Android
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-primary" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">50,000+</span> happy shoppers
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.9</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:flex justify-center">
              <div className="w-72 h-72 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full bg-primary/15 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center">
                    <ShoppingBag className="w-20 h-20 text-primary" />
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-8 bg-white rounded-xl p-3 shadow-lg border">
                <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-yellow-500" /><span className="font-semibold">Flash Sale Live!</span></div>
              </div>
              <div className="absolute bottom-8 left-4 bg-white rounded-xl p-3 shadow-lg border">
                <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-green-500" /><span className="font-semibold">Order Delivered ✓</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-black mb-1">{s.value}</div>
                <div className="text-primary-foreground/80 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Why Choose Cargo?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need in one convenient platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="border rounded-2xl p-6 bg-white hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sales preview */}
      {flashSales.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-extrabold flex items-center gap-2"><Zap className="text-yellow-500 w-8 h-8" />Flash Sales</h2>
                <p className="text-muted-foreground mt-1">Limited-time deals, grab them fast!</p>
              </div>
              <Link href="/promotions" className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSales.slice(0, 3).map((sale: any) => (
                <div key={sale.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  {sale.bannerImage && <img src={sale.bannerImage} className="w-full h-40 object-cover" alt={sale.title} onError={e => (e.currentTarget.style.display = "none")} />}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{sale.title}</h3>
                      <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-lg text-sm">{sale.discountPercent}% OFF</span>
                    </div>
                    {sale.description && <p className="text-muted-foreground text-sm">{sale.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Stores */}
      {stores.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold">Featured Stores</h2>
              <p className="text-muted-foreground mt-1">Top-rated merchants on Cargo</p>
            </div>
            <Link href="/marketplace" className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all">All stores <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stores.slice(0, 6).map((store: any) => (
              <Link key={store.id} href={`/marketplace`}
                className="border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-sm transition-all bg-white">
                {store.logo ? (
                  <img src={store.logo} className="w-12 h-12 rounded-lg object-cover mx-auto mb-2" alt={store.name} onError={e => (e.currentTarget.style.display="none")} />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center text-primary font-bold text-lg">
                    {store.name?.[0]}
                  </div>
                )}
                <p className="font-medium text-sm truncate">{store.name}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{store.averageRating?.toFixed(1) || "4.5"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to start shopping?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join thousands of happy customers. Download Cargo now and get 15% off your first order.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/download" className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              <Apple className="w-5 h-5" /> App Store
            </Link>
            <Link href="/download" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all">
              <Play className="w-5 h-5" /> Google Play
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
