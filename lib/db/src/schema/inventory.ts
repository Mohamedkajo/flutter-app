import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const stockHistoryTable = pgTable("stock_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  adjustment: integer("adjustment").notNull(), // positive = restock, negative = sale/manual deduction
  reason: text("reason").notNull().default("manual_adjustment"), // manual_adjustment, sale, return, correction
  adminId: integer("admin_id"),
  adminEmail: text("admin_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type StockHistory = typeof stockHistoryTable.$inferSelect;
