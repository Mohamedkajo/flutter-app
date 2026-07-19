import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";
import { productsTable } from "./products";

export const couponTypeEnum = pgEnum("coupon_type", ["percentage", "fixed"]);

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  discount: real("discount").notNull(),
  type: couponTypeEnum("type").notNull().default("percentage"),
  minOrder: real("min_order"),
  maxDiscount: real("max_discount"),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Coupon = typeof couponsTable.$inferSelect;

export const flashSalesTable = pgTable("flash_sales", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  bannerImage: text("banner_image"),
  endsAt: timestamp("ends_at").notNull(),
  discountPercent: integer("discount_percent").notNull().default(20),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashSaleProductsTable = pgTable("flash_sale_products", {
  id: serial("id").primaryKey(),
  flashSaleId: integer("flash_sale_id").notNull().references(() => flashSalesTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
});

export type FlashSale = typeof flashSalesTable.$inferSelect;

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  storeId: integer("store_id").references(() => storesTable.id),
  productId: integer("product_id").references(() => productsTable.id),
  orderId: integer("order_id"),
  rating: real("rating").notNull(),
  comment: text("comment"),
  images: text("images"), // JSON array
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Review = typeof reviewsTable.$inferSelect;

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // store | product
  refId: integer("ref_id").notNull(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  category: text("category"),
  rating: real("rating"),
  price: real("price"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Favorite = typeof favoritesTable.$inferSelect;

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("system"), // order|promo|system|driver|chat
  isRead: boolean("is_read").notNull().default(false),
  orderId: integer("order_id"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
