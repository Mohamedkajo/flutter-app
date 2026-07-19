import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  type: text("type").notNull().default("text"), // text, number, boolean, json, image
  group: text("group").notNull().default("general"),
  label: text("label").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userEmail: text("user_email"),
  userName: text("user_name"),
  action: text("action").notNull(), // create, update, delete, login, logout, settings_change
  entity: text("entity").notNull(), // user, store, product, order, coupon, banner, etc.
  entityId: text("entity_id"),
  details: text("details"), // JSON string of changed fields
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;
