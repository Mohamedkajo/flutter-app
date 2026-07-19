import { Router } from "express";
import { db } from "@workspace/db";
import { flashSalesTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const flashSalesAdminRouter = Router();

// GET /admin/flash-sales
flashSalesAdminRouter.get("/admin/flash-sales", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const sales = await db.select().from(flashSalesTable).orderBy(desc(flashSalesTable.createdAt));
  res.json(sales.map(s => ({ ...s, productCount: 0 })));
});

// POST /admin/flash-sales
flashSalesAdminRouter.post("/admin/flash-sales", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, description, bannerImage, endsAt, discountPercent, isActive = true } = req.body;
  if (!title || !endsAt || discountPercent == null) {
    res.status(400).json({ error: "title, endsAt, discountPercent required" }); return;
  }
  const [sale] = await db.insert(flashSalesTable).values({
    title, description, bannerImage, endsAt: new Date(endsAt), discountPercent, isActive,
  }).returning();
  res.status(201).json({ ...sale, productCount: 0 });
});

// PATCH /admin/flash-sales/:saleId
flashSalesAdminRouter.patch("/admin/flash-sales/:saleId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = {};
  const allowed = ["title", "description", "bannerImage", "discountPercent", "isActive"];
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
  if (req.body.endsAt) updates.endsAt = new Date(req.body.endsAt);
  const [sale] = await db.update(flashSalesTable).set(updates)
    .where(eq(flashSalesTable.id, Number(req.params.saleId))).returning();
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...sale, productCount: 0 });
});

// DELETE /admin/flash-sales/:saleId
flashSalesAdminRouter.delete("/admin/flash-sales/:saleId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [sale] = await db.delete(flashSalesTable).where(eq(flashSalesTable.id, Number(req.params.saleId))).returning();
  if (!sale) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...sale, productCount: 0 });
});

// POST /admin/flash-sales/:saleId/products — assign discount to product
flashSalesAdminRouter.post("/admin/flash-sales/:saleId/products", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const saleId = Number(req.params.saleId);
  const { productId } = req.body;
  const [sale] = await db.select().from(flashSalesTable).where(eq(flashSalesTable.id, saleId));
  if (!sale) { res.status(404).json({ error: "Flash sale not found" }); return; }
  await db.update(productsTable)
    .set({ discountPercent: sale.discountPercent })
    .where(eq(productsTable.id, Number(productId)));
  res.json({ ...sale, productCount: 1 });
});
