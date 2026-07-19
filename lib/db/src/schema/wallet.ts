import { pgTable, text, serial, integer, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const walletTxTypeEnum = pgEnum("wallet_tx_type", ["credit", "debit", "refund", "reward"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("EGP"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Wallet = typeof walletsTable.$inferSelect;

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => walletsTable.id),
  type: walletTxTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  orderId: integer("order_id").references(() => ordersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
