import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { storesTable } from "./stores";

export const orderStatusEnum = pgEnum("order_status", [
  "pending", "accepted", "preparing", "packed",
  "driver_assigned", "picked_up", "delivering",
  "delivered", "completed", "cancelled", "refunded", "returned"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "wallet", "card", "cash", "apple_pay", "google_pay"
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  storeId: integer("store_id").notNull().references(() => storesTable.id),
  storeName: text("store_name").notNull(),
  storeImage: text("store_image"),
  driverId: integer("driver_id"),
  driverName: text("driver_name"),
  status: orderStatusEnum("status").notNull().default("pending"),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(10),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  deliveryAddress: text("delivery_address").notNull(),
  estimatedDelivery: text("estimated_delivery"),
  specialInstructions: text("special_instructions"),
  couponCode: text("coupon_code"),
  itemCount: integer("item_count").notNull().default(1),
  invoice: text("invoice"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  variant: text("variant"),
  addons: text("addons"), // JSON array
  specialInstructions: text("special_instructions"),
});

export type OrderItem = typeof orderItemsTable.$inferSelect;

export const cartTable = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  storeId: integer("store_id"),
  storeName: text("store_name"),
  deliveryFee: real("delivery_fee").notNull().default(10),
  discount: real("discount").notNull().default(0),
  couponCode: text("coupon_code"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => cartTable.id),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  variant: text("variant"),
  addons: text("addons"),
  specialInstructions: text("special_instructions"),
});

export type Cart = typeof cartTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
