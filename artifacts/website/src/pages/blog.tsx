import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Clock, User, Tag, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>("/blog/categories").then(setCategories).catch(() => {});
    apiFetch<any[]>("/blog").then(setPosts).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? posts : posts.filter((p: any) => p.categoryName === filter);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Cargo Blog</h1>
          <p className="text-muted-foreground text-lg">News, insights, and tips for merchants and shoppers.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All</button>
            {categories.map((c: any) => (
              <button key={c.id} onClick={() => setFilter(c.name)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c.name ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No posts yet.</div>
        ) : (
          <>
            {/* Featured post */}
            {filtered[0] && (
              <Link href={`/blog/${filtered[0].slug}`} className="block mb-8 group">
                <div className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow grid grid-cols-1 md:grid-cols-2">
                  {filtered[0].coverImage ? (
                    <img src={filtered[0].coverImage} className="h-64 md:h-full object-cover" onError={e => (e.currentTarget.style.display="none")} />
                  ) : (
                    <div className="h-64 md:h-full bg-gradient-to-br from-primary/10 to-purple-100 min-h-48" />
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">Featured</span>
                      {filtered[0].categoryName && <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">{filtered[0].categoryName}</span>}
                    </div>
                    <h2 className="text-2xl font-extrabold mb-3 group-hover:text-primary transition-colors">{filtered[0].title}</h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{filtered[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{filtered[0].authorName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{filtered[0].readTime} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(1).map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block border rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                  {post.coverImage ? (
                    <img src={post.coverImage} className="w-full h-44 object-cover" onError={e => (e.currentTarget.style.display="none")} />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-primary/10 to-purple-100" />
                  )}
                  <div className="p-5">
                    {post.categoryName && <span className="text-xs text-primary font-semibold">{post.categoryName}</span>}
                    <h3 className="font-bold text-base mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.authorName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
