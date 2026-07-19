import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, stockHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const inventoryAdminRouter = Router();

function getStatus(stockQty: number, threshold: number, isAvailable: boolean) {
  if (!isAvailable || stockQty <= 0) return "out_of_stock";
  if (stockQty <= threshold) return "low_stock";
  return "in_stock";
}

// GET /admin/inventory
inventoryAdminRouter.get("/admin/inventory", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { status, search, limit = "100" } = req.query;
  const products = await db.select().from(productsTable).limit(Number(limit));
  let items = products.map(p => ({
    productId: p.id,
    productName: p.name,
    image: p.image,
    storeId: p.storeId,
    storeName: p.storeName,
    stockQuantity: p.stockQuantity ?? 999,
    lowStockThreshold: p.lowStockThreshold ?? 10,
    isAvailable: p.isAvailable,
    status: getStatus(p.stockQuantity ?? 999, p.lowStockThreshold ?? 10, p.isAvailable),
    price: p.price,
  }));

  if (status === "low") items = items.filter(i => i.status === "low_stock");
  else if (status === "out") items = items.filter(i => i.status === "out_of_stock");
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(i => i.productName.toLowerCase().includes(q) || i.storeName.toLowerCase().includes(q));
  }
  res.json(items);
});

// PATCH /admin/inventory/:productId/stock
inventoryAdminRouter.patch("/admin/inventory/:productId/stock", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const productId = Number(req.params.productId);
  const { adjustment, reason = "manual_adjustment", setQuantity } = req.body;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const previous = product.stockQuantity ?? 999;
  const newQty = setQuantity != null ? Number(setQuantity) : Math.max(0, previous + Number(adjustment || 0));
  const actualAdj = newQty - previous;

  await db.update(productsTable).set({
    stockQuantity: newQty,
    isAvailable: newQty > 0,
  }).where(eq(productsTable.id, productId));

  await db.insert(stockHistoryTable).values({
    productId,
    productName: product.name,
    previousQuantity: previous,
    newQuantity: newQty,
    adjustment: actualAdj,
    reason,
    adminEmail: res.locals.userEmail as string | undefined,
  });

  res.json({
    productId,
    productName: product.name,
    image: product.image,
    storeId: product.storeId,
    storeName: product.storeName,
    stockQuantity: newQty,
    lowStockThreshold: product.lowStockThreshold ?? 10,
    isAvailable: newQty > 0,
    status: getStatus(newQty, product.lowStockThreshold ?? 10, newQty > 0),
    price: product.price,
  });
});

// GET /admin/inventory/:productId/history
inventoryAdminRouter.get("/admin/inventory/:productId/history", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const productId = Number(req.params.productId);
  const history = await db.select().from(stockHistoryTable)
    .where(eq(stockHistoryTable.productId, productId))
    .orderBy(desc(stockHistoryTable.createdAt))
    .limit(50);
  res.json(history);
});
