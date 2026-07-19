import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable, careersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const contactRouter = Router();

// Public: submit contact form
contactRouter.post("/contact", async (req, res): Promise<void> => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "name, email, subject, message required" });
    return;
  }
  const [msg] = await db.insert(contactMessagesTable).values({ name, email, phone, subject, message }).returning();
  res.status(201).json(msg);
});

// Public: list active careers
contactRouter.get("/careers", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(careersTable).where(eq(careersTable.isActive, true)).orderBy(desc(careersTable.createdAt));
  res.json(jobs.map(j => ({
    ...j,
    requirements: j.requirements ? JSON.parse(j.requirements) : [],
    benefits: j.benefits ? JSON.parse(j.benefits) : [],
  })));
});

// Admin: list contact messages
contactRouter.get("/admin/contact", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { limit = "100" } = req.query;
  const messages = await db.select().from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt)).limit(Number(limit));
  res.json(messages);
});

// Admin: update contact message
contactRouter.patch("/admin/contact/:messageId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = {};
  if ("isRead" in req.body) updates.isRead = req.body.isRead;
  if (req.body.markReplied) updates.repliedAt = new Date();
  const [msg] = await db.update(contactMessagesTable).set(updates)
    .where(eq(contactMessagesTable.id, Number(req.params.messageId))).returning();
  if (!msg) { res.status(404).json({ error: "Not found" }); return; }
  res.json(msg);
});

// Admin: delete contact message
contactRouter.delete("/admin/contact/:messageId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [msg] = await db.delete(contactMessagesTable)
    .where(eq(contactMessagesTable.id, Number(req.params.messageId))).returning();
  if (!msg) { res.status(404).json({ error: "Not found" }); return; }
  res.json(msg);
});

// Admin: list all careers
contactRouter.get("/admin/careers", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const jobs = await db.select().from(careersTable).orderBy(desc(careersTable.createdAt));
  res.json(jobs.map(j => ({
    ...j,
    requirements: j.requirements ? JSON.parse(j.requirements) : [],
    benefits: j.benefits ? JSON.parse(j.benefits) : [],
  })));
});

// Admin: create career
contactRouter.post("/admin/careers", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { title, department = "Engineering", location = "Cairo, Egypt", type = "full-time",
    description, requirements = [], benefits = [], salary, isActive = true } = req.body;
  if (!title || !description) { res.status(400).json({ error: "title and description required" }); return; }
  const [job] = await db.insert(careersTable).values({
    title, department, location, type, description,
    requirements: JSON.stringify(requirements), benefits: JSON.stringify(benefits), salary, isActive,
  }).returning();
  res.status(201).json({ ...job, requirements, benefits });
});

// Admin: update career
contactRouter.patch("/admin/careers/:careerId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ["title", "department", "location", "type", "description", "salary", "isActive"];
  for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
  if (Array.isArray(req.body.requirements)) updates.requirements = JSON.stringify(req.body.requirements);
  if (Array.isArray(req.body.benefits)) updates.benefits = JSON.stringify(req.body.benefits);
  const [job] = await db.update(careersTable).set(updates)
    .where(eq(careersTable.id, Number(req.params.careerId))).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...job, requirements: JSON.parse(job.requirements || "[]"), benefits: JSON.parse(job.benefits || "[]") });
});

// Admin: delete career
contactRouter.delete("/admin/careers/:careerId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [job] = await db.delete(careersTable).where(eq(careersTable.id, Number(req.params.careerId))).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(job);
});
