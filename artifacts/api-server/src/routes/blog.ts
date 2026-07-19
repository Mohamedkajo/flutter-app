import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable, blogCategoriesTable } from "@workspace/db";
import { eq, desc, asc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const blogRouter = Router();

blogRouter.get("/blog", async (req, res): Promise<void> => {
  const { categoryId, limit = "20", offset = "0" } = req.query;
  const where = categoryId
    ? and(eq(blogPostsTable.isPublished, true), eq(blogPostsTable.categoryId, Number(categoryId)))
    : eq(blogPostsTable.isPublished, true);
  const posts = await db.select().from(blogPostsTable).where(where)
    .orderBy(desc(blogPostsTable.createdAt)).limit(Number(limit)).offset(Number(offset));
  res.json(posts.map(p => ({ ...p, tags: p.tags ? JSON.parse(p.tags) : [] })));
});

blogRouter.get("/blog/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(blogCategoriesTable).orderBy(asc(blogCategoriesTable.name));
  res.json(cats);
});

blogRouter.get("/blog/:slug", async (req, res): Promise<void> => {
  const [post] = await db.select().from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, req.params.slug), eq(blogPostsTable.isPublished, true)));
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(blogPostsTable).set({ viewCount: (post.viewCount || 0) + 1 }).where(eq(blogPostsTable.id, post.id));
  res.json({ ...post, tags: post.tags ? JSON.parse(post.tags) : [] });
});

blogRouter.get("/admin/blog", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const posts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
  res.json(posts.map(p => ({ ...p, tags: p.tags ? JSON.parse(p.tags) : [] })));
});

blogRouter.get("/admin/blog/categories", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const cats = await db.select().from(blogCategoriesTable).orderBy(asc(blogCategoriesTable.name));
  res.json(cats);
});

blogRouter.post("/admin/blog", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, slug, excerpt, content, coverImage, categoryId, categoryName, isPublished = false, readTime = 5 } = req.body;
  if (!title || !slug || !content) { res.status(400).json({ error: "title, slug, content required" }); return; }
  const tags = Array.isArray(req.body.tags) ? JSON.stringify(req.body.tags) : "[]";
  const publishedAt = isPublished ? new Date() : null;
  const [post] = await db.insert(blogPostsTable).values({
    title, slug, excerpt, content, coverImage, categoryId, categoryName, isPublished, readTime, tags, publishedAt,
    authorName: "Cargo Admin",
  }).returning();
  res.status(201).json({ ...post, tags: JSON.parse(post.tags || "[]") });
});

blogRouter.patch("/admin/blog/:postId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ["title", "slug", "excerpt", "content", "coverImage", "categoryId", "categoryName", "isPublished", "readTime"];
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
  if (Array.isArray(req.body.tags)) updates.tags = JSON.stringify(req.body.tags);
  if (req.body.isPublished === true) updates.publishedAt = new Date();
  const [post] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, Number(req.params.postId))).returning();
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...post, tags: JSON.parse(post.tags || "[]") });
});

blogRouter.delete("/admin/blog/:postId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [post] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, Number(req.params.postId))).returning();
  if (!post) { res.status(404).json({ error: "Not found" }); return; }
  res.json(post);
});

blogRouter.post("/admin/blog/categories", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, slug } = req.body;
  if (!name || !slug) { res.status(400).json({ error: "name and slug required" }); return; }
  const [cat] = await db.insert(blogCategoriesTable).values({ name, slug }).returning();
  res.status(201).json(cat);
});
