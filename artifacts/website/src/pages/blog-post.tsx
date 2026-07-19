import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Clock, User, ArrowLeft, Tag } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    apiFetch<any>(`/blog/${params.slug}`)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}</div>
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Post not found</h2>
      <Link href="/blog" className="text-primary hover:underline flex items-center gap-1 justify-center"><ArrowLeft className="w-4 h-4" />Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/blog" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      {post.categoryName && <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">{post.categoryName}</span>}

      <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4">{post.title}</h1>

      {post.excerpt && <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{post.excerpt}</p>}

      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
        <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.authorName}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime} min read</span>
        <span>{new Date(post.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</span>
      </div>

      {post.coverImage && (
        <img src={post.coverImage} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-10" onError={e => (e.currentTarget.style.display="none")} />
      )}

      <div className="prose prose-gray max-w-none text-foreground leading-relaxed">
        {post.content ? (
          <div className="whitespace-pre-wrap">{post.content}</div>
        ) : (
          <p className="text-muted-foreground italic">No content available.</p>
        )}
      </div>
    </div>
  );
}
