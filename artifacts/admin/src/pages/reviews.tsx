import { useState } from "react";
import { useListAdminReviews, useDeleteAdminReview, getListAdminReviewsQueryKey } from "@workspace/api-client-react";
import { PageHeader, EmptyState } from "@/components/ui/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquare, Trash2, Star, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [storeFilter, setStoreFilter] = useState("");

  const { data: reviews, isLoading } = useListAdminReviews({ limit: 100 });
  const deleteMutation = useDeleteAdminReview();

  const handleDelete = (id: number) => {
    if (confirm("Delete this review? This cannot be undone.")) {
      deleteMutation.mutate({ reviewId: id }, {
        onSuccess: () => { toast.success("Review deleted"); queryClient.invalidateQueries({ queryKey: getListAdminReviewsQueryKey() }); },
        onError: () => toast.error("Failed to delete review"),
      });
    }
  };

  const filtered = storeFilter
    ? reviews?.filter(r => String(r.storeId) === storeFilter || String(r.productId) === storeFilter)
    : reviews;

  const avgRating = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Monitor and moderate customer reviews across all stores and products."
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviews?.length ?? 0 },
          { label: "Avg Rating", value: avgRating },
          { label: "This Month", value: reviews?.filter(r => new Date(r.createdAt) > new Date(Date.now() - 30 * 86400_000)).length ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="border rounded-xl bg-card p-5">
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by Store or Product ID..."
          className="pl-9 bg-card"
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        />
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Reviewer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Comment</th>
                <th className="px-6 py-4 font-medium">Store / Product</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading reviews...</td></tr>
              ) : filtered?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12"><EmptyState title="No reviews found" description="No reviews yet. They will appear once customers start reviewing." icon={MessageSquare} /></td></tr>
              ) : (
                filtered?.map((review) => (
                  <tr key={review.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {review.userAvatar
                            ? <img src={review.userAvatar} className="w-full h-full rounded-full object-cover" alt={review.userName} />
                            : review.userName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{review.userName}</div>
                          <div className="text-xs text-muted-foreground">#{review.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StarRating rating={review.rating} /></td>
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground max-w-xs truncate" title={review.comment ?? ""}>{review.comment ?? <em className="opacity-50">No comment</em>}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {review.storeId && <div>Store #{review.storeId}</div>}
                      {review.productId && <div>Product #{review.productId}</div>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(review.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(review.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
