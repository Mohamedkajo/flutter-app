import { useState, useEffect } from "react";
import { Search, Star, MapPin, ShoppingBag } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Link } from "wouter";

export default function MarketplacePage() {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    params.set("limit", "24");
    apiFetch<any[]>(`/stores?${params}`).then(setStores).finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore the Marketplace</h1>
          <p className="text-muted-foreground text-lg mb-8">Discover hundreds of stores and find exactly what you're looking for.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search stores..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-base shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              All
            </button>
            {categories.slice(0, 10).map((c: any) => (
              <button key={c.id} onClick={() => setCategory(c.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c.name ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-4">{stores.length} stores found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stores.map((store: any) => (
                <div key={store.id} className="border rounded-2xl overflow-hidden bg-white hover:shadow-md hover:border-primary/30 transition-all group">
                  {store.coverImage ? (
                    <img src={store.coverImage} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" alt={store.name} onError={e => (e.currentTarget.style.display="none")} />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      {store.logo && <img src={store.logo} className="w-8 h-8 rounded-lg border object-cover shrink-0" onError={e => (e.currentTarget.style.display="none")} />}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{store.name}</h3>
                        {store.description && <p className="text-xs text-muted-foreground truncate">{store.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{store.averageRating?.toFixed(1) || "4.5"}</span>
                      </div>
                      {store.isOnline && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Open</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {stores.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No stores found. Try a different search.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
