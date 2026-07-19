import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { storesTable } from "./stores";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => storesTable.id),
  storeName: text("store_name").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  image: text("image").notNull(),
  categoryName: text("category_name").notNull(),
  rating: real("rating").notNull().default(4.3),
  reviewCount: integer("review_count").notNull().default(0),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  discountPercent: integer("discount_percent"),
  tags: text("tags"), // JSON array
  preparationTime: text("preparation_time"),
  nutritionInfo: text("nutrition_info"),
  stockQuantity: integer("stock_quantity").notNull().default(999),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productVariantsTable = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  name: text("name").notNull(),
  price: real("price").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const productAddonsTable = pgTable("product_addons", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  name: text("name").notNull(),
  price: real("price").notNull(),
});

export type ProductVariant = typeof productVariantsTable.$inferSelect;
export type ProductAddon = typeof productAddonsTable.$inferSelect;
