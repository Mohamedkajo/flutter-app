import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const faqCategoriesTable = pgTable("faq_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faqItemsTable = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  categoryId: integer("category_id"),
  categoryName: text("category_name"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type FaqCategory = typeof faqCategoriesTable.$inferSelect;
export type FaqItem = typeof faqItemsTable.$inferSelect;
