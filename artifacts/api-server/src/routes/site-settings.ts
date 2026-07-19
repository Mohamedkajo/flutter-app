import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";

export const siteSettingsRouter = Router();

const DEFAULT_SETTINGS = [
  { key: "site_name", value: "Cargo", type: "text", group: "general", label: "Site Name" },
  { key: "site_tagline", value: "Orchestrate Delivery at Scale", type: "text", group: "general", label: "Tagline" },
  { key: "site_description", value: "Cargo is the #1 marketplace connecting customers with top local stores for fast delivery.", type: "text", group: "general", label: "Site Description" },
  { key: "site_email", value: "hello@cargo.app", type: "text", group: "general", label: "Contact Email" },
  { key: "site_phone", value: "+20 100 000 0000", type: "text", group: "general", label: "Contact Phone" },
  { key: "site_address", value: "Cairo, Egypt", type: "text", group: "general", label: "Address" },
  { key: "hero_title", value: "Everything Delivered Fast", type: "text", group: "homepage", label: "Hero Title" },
  { key: "hero_subtitle", value: "Order from top local stores and get it delivered to your door in minutes.", type: "text", group: "homepage", label: "Hero Subtitle" },
  { key: "hero_cta_text", value: "Download the App", type: "text", group: "homepage", label: "Hero CTA" },
  { key: "android_link", value: "https://play.google.com/store", type: "text", group: "app", label: "Android Link" },
  { key: "ios_link", value: "https://apps.apple.com", type: "text", group: "app", label: "iOS Link" },
  { key: "facebook_url", value: "https://facebook.com", type: "text", group: "social", label: "Facebook" },
  { key: "instagram_url", value: "https://instagram.com", type: "text", group: "social", label: "Instagram" },
  { key: "twitter_url", value: "https://twitter.com", type: "text", group: "social", label: "Twitter/X" },
  { key: "linkedin_url", value: "https://linkedin.com", type: "text", group: "social", label: "LinkedIn" },
  { key: "footer_text", value: "© 2025 Cargo. All rights reserved.", type: "text", group: "footer", label: "Footer Text" },
  { key: "about_title", value: "Delivering Joy, One Order at a Time", type: "text", group: "about", label: "About Title" },
  { key: "about_description", value: "Cargo was founded with a simple mission: connect people with the best local stores and deliver their favourite products as fast as possible.", type: "text", group: "about", label: "About Description" },
];

async function ensureDefaults() {
  const existing = await db.select().from(siteSettingsTable);
  if (existing.length === 0) {
    await db.insert(siteSettingsTable).values(DEFAULT_SETTINGS);
  }
}

// Public: get site settings as key-value map
siteSettingsRouter.get("/site-settings", async (_req, res): Promise<void> => {
  await ensureDefaults();
  const settings = await db.select().from(siteSettingsTable);
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

// Admin: list all settings
siteSettingsRouter.get("/admin/site-settings", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  await ensureDefaults();
  res.json(await db.select().from(siteSettingsTable));
});

// Admin: bulk update
siteSettingsRouter.patch("/admin/site-settings", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) { res.status(400).json({ error: "settings must be an array" }); return; }
  const results = [];
  for (const { key, value } of settings) {
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (existing.length > 0) {
      const [u] = await db.update(siteSettingsTable).set({ value, updatedAt: new Date() }).where(eq(siteSettingsTable.key, key)).returning();
      results.push(u);
    } else {
      const [i] = await db.insert(siteSettingsTable).values({ key, value, type: "text", group: "general", label: key }).returning();
      results.push(i);
    }
  }
  res.json(results);
});

// Admin: list audit logs
siteSettingsRouter.get("/admin/audit-logs", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { limit = "100", offset = "0" } = req.query;
  const logs = await db.select().from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));
  res.json(logs);
});
