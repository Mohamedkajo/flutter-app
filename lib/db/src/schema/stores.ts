import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  image: text("image"),
  storeCount: integer("store_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof categoriesTable.$inferSelect;

export const storesTable = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  image: text("image").notNull(),
  bannerImage: text("banner_image"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  categoryName: text("category_name").notNull(),
  categoryIcon: text("category_icon"),
  address: text("address"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  openingHours: text("opening_hours"),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  deliveryTime: text("delivery_time").notNull().default("20-30 Min"),
  deliveryFee: real("delivery_fee").notNull().default(10),
  minOrder: real("min_order").notNull().default(50),
  isOpen: boolean("is_open").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isOnline: boolean("is_online").notNull().default(false),
  productCategories: text("product_categories"), // JSON array stored as text
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof storesTable.$inferSelect;
