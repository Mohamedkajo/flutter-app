import { Router } from "express";
import { db } from "@workspace/db";
import { faqItemsTable, faqCategoriesTable } from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const faqRouter = Router();

// Public
faqRouter.get("/faq", async (req, res): Promise<void> => {
  const { categoryId } = req.query;
  const where = categoryId
    ? and(eq(faqItemsTable.isPublished, true), eq(faqItemsTable.categoryId, Number(categoryId)))
    : eq(faqItemsTable.isPublished, true);
  const items = await db.select().from(faqItemsTable).where(where).orderBy(asc(faqItemsTable.displayOrder), asc(faqItemsTable.id));
  res.json(items);
});

faqRouter.get("/faq/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(faqCategoriesTable).orderBy(asc(faqCategoriesTable.displayOrder));
  res.json(cats);
});

// Admin
faqRouter.get("/admin/faq", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(faqItemsTable).orderBy(asc(faqItemsTable.displayOrder), asc(faqItemsTable.id));
  res.json(items);
});

faqRouter.get("/admin/faq/categories", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const cats = await db.select().from(faqCategoriesTable).orderBy(asc(faqCategoriesTable.displayOrder));
  res.json(cats);
});

faqRouter.post("/admin/faq", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { question, answer, categoryId, categoryName, displayOrder = 0, isPublished = true } = req.body;
  if (!question || !answer) { res.status(400).json({ error: "question and answer required" }); return; }
  const [item] = await db.insert(faqItemsTable).values({ question, answer, categoryId, categoryName, displayOrder, isPublished }).returning();
  res.status(201).json(item);
});

faqRouter.patch("/admin/faq/:faqId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = {};
  const allowed = ["question", "answer", "categoryId", "categoryName", "displayOrder", "isPublished"];
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
  const [item] = await db.update(faqItemsTable).set({ ...updates, updatedAt: new Date() }).where(eq(faqItemsTable.id, Number(req.params.faqId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

faqRouter.delete("/admin/faq/:faqId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [item] = await db.delete(faqItemsTable).where(eq(faqItemsTable.id, Number(req.params.faqId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

faqRouter.post("/admin/faq/categories", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, slug, displayOrder = 0 } = req.body;
  if (!name || !slug) { res.status(400).json({ error: "name and slug required" }); return; }
  const [cat] = await db.insert(faqCategoriesTable).values({ name, slug, displayOrder }).returning();
  res.status(201).json(cat);
});

faqRouter.patch("/admin/faq/categories/:categoryId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = {};
  const allowed = ["name", "slug", "displayOrder"];
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
  const [cat] = await db.update(faqCategoriesTable).set(updates).where(eq(faqCategoriesTable.id, Number(req.params.categoryId))).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});

faqRouter.delete("/admin/faq/categories/:categoryId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [cat] = await db.delete(faqCategoriesTable).where(eq(faqCategoriesTable.id, Number(req.params.categoryId))).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(cat);
});
