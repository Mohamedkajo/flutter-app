import { Router, type IRouter } from "express";
import { eq, like, ilike, and, sql } from "drizzle-orm";
import { db, storesTable, categoriesTable } from "@workspace/db";
import {
  ListStoresQueryParams,
  GetStoreParams,
  GetStoreProductsParams,
  ListStoresResponse,
  GetStoreResponse,
  GetStoreProductsResponse,
  GetFeaturedStoresResponse,
  GetNearbyStoresQueryParams,
  GetNearbyStoresResponse,
  GetMerchantProfileResponse,
  UpdateMerchantProfileBody,
  UpdateMerchantProfileResponse,
} from "@workspace/api-zod";
import { productsTable } from "@workspace/db";

const router: IRouter = Router();

function storeToDto(s: typeof storesTable.$inferSelect) {
  return {
    ...s,
    tags: s.productCategories ? (JSON.parse(s.productCategories) as string[]) : [],
    distance: null,
  };
}

router.get("/stores", async (req, res): Promise<void> => {
  const parsed = ListStoresQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, search, featured, online, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(storesTable).$dynamic();
  const conditions = [];
  if (category) conditions.push(ilike(storesTable.categoryName, `%${category}%`));
  if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
  if (featured) conditions.push(eq(storesTable.isFeatured, true));
  if (online) conditions.push(eq(storesTable.isOnline, true));
  if (conditions.length) query = query.where(and(...conditions));
  const stores = await query.limit(limit ?? 20).offset(offset ?? 0);
  res.json(ListStoresResponse.parse(stores.map(storeToDto)));
});

router.get("/stores/online", async (_req, res): Promise<void> => {
  const stores = await db.select().from(storesTable).where(eq(storesTable.isOnline, true)).limit(10);
  res.json(ListStoresResponse.parse(stores.map(storeToDto)));
});

router.get("/stores/featured", async (_req, res): Promise<void> => {
  const stores = await db.select().from(storesTable).where(eq(storesTable.isFeatured, true)).limit(10);
  res.json(GetFeaturedStoresResponse.parse(stores.map(storeToDto)));
});

router.get("/stores/nearby", async (req, res): Promise<void> => {
  const parsed = GetNearbyStoresQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const stores = await db.select().from(storesTable).where(eq(storesTable.isOpen, true)).limit(12);
  const withDistance = stores.map((s, i) => ({ ...storeToDto(s), distance: 0.5 + i * 0.3 }));
  res.json(GetNearbyStoresResponse.parse(withDistance));
});

router.get("/stores/:storeId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const params = GetStoreParams.safeParse({ storeId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [store] = await db.select().from(storesTable).where(eq(storesTable.id, params.data.storeId)).limit(1);
  if (!store) { res.status(404).json({ error: "Store not found" }); return; }
  res.json(GetStoreResponse.parse({
    ...storeToDto(store),
    productCategories: store.productCategories ? JSON.parse(store.productCategories) : [],
    socialMedia: { instagram: null, facebook: null, twitter: null },
  }));
});

router.get("/stores/:storeId/products", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const params = GetStoreProductsParams.safeParse({ storeId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const products = await db.select().from(productsTable).where(eq(productsTable.storeId, params.data.storeId));
  res.json(GetStoreProductsResponse.parse(products.map(p => ({
    ...p, tags: p.tags ? JSON.parse(p.tags) : [],
  }))));
});

// Merchant routes
router.get("/merchant/profile", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1); // simplified — use auth in prod
  if (!store) { res.status(404).json({ error: "Store not found" }); return; }
  res.json(GetMerchantProfileResponse.parse({
    ...storeToDto(store),
    productCategories: store.productCategories ? JSON.parse(store.productCategories) : [],
    socialMedia: { instagram: null, facebook: null, twitter: null },
  }));
});

router.patch("/merchant/profile", async (req, res): Promise<void> => {
  const parsed = UpdateMerchantProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) { res.status(404).json({ error: "Store not found" }); return; }
  const [updated] = await db.update(storesTable).set(parsed.data).where(eq(storesTable.id, store.id)).returning();
  res.json(UpdateMerchantProfileResponse.parse({
    ...storeToDto(updated),
    productCategories: updated.productCategories ? JSON.parse(updated.productCategories) : [],
    socialMedia: { instagram: null, facebook: null, twitter: null },
  }));
});

export default router;
