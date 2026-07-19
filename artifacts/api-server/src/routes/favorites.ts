import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, favoritesTable } from "@workspace/db";
import {
  ToggleFavoriteBody,
  ListFavoritesResponse,
  ToggleFavoriteResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/favorites", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const favorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    res.json(ListFavoritesResponse.parse(favorites.map(f => ({
      ...f,
      type: f.type as "store" | "product",
      category: f.category ?? null,
      rating: f.rating ?? null,
      price: f.price ?? null,
    }))));
  } catch (err) { next(err); }
});

router.post("/favorites/toggle", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const parsed = ToggleFavoriteBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const existing = await db.select().from(favoritesTable)
      .where(and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.refId, parsed.data.refId),
        eq(favoritesTable.type, parsed.data.type),
      )).limit(1);

    if (existing.length > 0) {
      const [deleted] = await db.delete(favoritesTable).where(eq(favoritesTable.id, existing[0].id)).returning();
      res.json(ToggleFavoriteResponse.parse({ ...deleted, type: deleted.type as "store" | "product", category: deleted.category ?? null, rating: deleted.rating ?? null, price: deleted.price ?? null }));
      return;
    }

    const data = parsed.data as typeof parsed.data & { name?: string; image?: string };
    const [fav] = await db.insert(favoritesTable).values({
      userId,
      type: parsed.data.type,
      refId: parsed.data.refId,
      name: data.name ?? "Favorite Item",
      image: data.image ?? "",
    }).returning();

    res.json(ToggleFavoriteResponse.parse({ ...fav, type: fav.type as "store" | "product", category: fav.category ?? null, rating: fav.rating ?? null, price: fav.price ?? null }));
  } catch (err) { next(err); }
});

export default router;
