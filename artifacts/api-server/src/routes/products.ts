import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, productsTable, productVariantsTable, productAddonsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  ListProductsResponse,
  GetProductResponse,
  GetTrendingProductsResponse,
  ListMerchantProductsResponse,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
  DeleteProductResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function productToDto(p: typeof productsTable.$inferSelect) {
  return { ...p, tags: p.tags ? JSON.parse(p.tags) as string[] : [] };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { search, storeId, limit = 20, offset = 0 } = parsed.data;

  let query = db.select().from(productsTable).$dynamic();
  const conditions = [];
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (storeId) conditions.push(eq(productsTable.storeId, storeId));
  if (conditions.length) query = query.where(and(...conditions));
  const products = await query.limit(limit ?? 20).offset(offset ?? 0);
  res.json(ListProductsResponse.parse(products.map(productToDto)));
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(10);
  res.json(GetTrendingProductsResponse.parse(products.map(productToDto)));
});

router.get("/products/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = GetProductParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.productId)).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const variants = await db.select().from(productVariantsTable).where(eq(productVariantsTable.productId, product.id));
  const addons = await db.select().from(productAddonsTable).where(eq(productAddonsTable.productId, product.id));

  res.json(GetProductResponse.parse({
    ...productToDto(product),
    variants,
    addons,
    gallery: [product.image],
  }));
});

// Merchant product management
router.get("/merchant/products", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable);
  res.json(ListMerchantProductsResponse.parse(products.map(productToDto)));
});

router.post("/merchant/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    storeId: 1,
    storeName: "My Store",
    image: parsed.data.image ?? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  }).returning();
  res.status(201).json(CreateProductResponse.parse(productToDto(product)));
});

router.patch("/merchant/products/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = UpdateProductParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [product] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, params.data.productId)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(UpdateProductResponse.parse(productToDto(product)));
});

router.delete("/merchant/products/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = DeleteProductParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.productId)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(DeleteProductResponse.parse(productToDto(product)));
});

export default router;
