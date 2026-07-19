import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, reviewsTable } from "@workspace/db";
import {
  ListReviewsQueryParams,
  CreateReviewBody,
  ListReviewsResponse,
  CreateReviewResponse,
} from "@workspace/api-zod";

const DEFAULT_USER_ID = 1;

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const parsed = ListReviewsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const conditions = [];
  if (parsed.data.storeId) conditions.push(eq(reviewsTable.storeId, parsed.data.storeId));
  if (parsed.data.productId) conditions.push(eq(reviewsTable.productId, parsed.data.productId));

  let query = db.select().from(reviewsTable).$dynamic();
  if (conditions.length) query = query.where(and(...conditions));
  const reviews = await query.limit(20);

  res.json(ListReviewsResponse.parse(reviews.map(r => ({
    ...r,
    storeId: r.storeId ?? null,
    productId: r.productId ?? null,
    orderId: r.orderId ?? null,
    userAvatar: r.userAvatar ?? null,
    comment: r.comment ?? null,
    images: r.images ? JSON.parse(r.images) as string[] : [],
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [review] = await db.insert(reviewsTable).values({
    userId: DEFAULT_USER_ID,
    userName: "Ahmed Al-Rashid",
    userAvatar: null,
    storeId: parsed.data.storeId ?? null,
    productId: parsed.data.productId ?? null,
    orderId: parsed.data.orderId ?? null,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  }).returning();

  res.status(201).json(CreateReviewResponse.parse({
    ...review,
    storeId: review.storeId ?? null,
    productId: review.productId ?? null,
    orderId: review.orderId ?? null,
    userAvatar: review.userAvatar ?? null,
    comment: review.comment ?? null,
    images: [],
    createdAt: review.createdAt.toISOString(),
  }));
});

export default router;
