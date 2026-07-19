import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";

export const contactMessagesTable = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const careersTable = pgTable("careers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull().default("Engineering"),
  location: text("location").notNull().default("Cairo, Egypt"),
  type: text("type").notNull().default("full-time"), // full-time, part-time, contract, remote
  description: text("description").notNull(),
  requirements: text("requirements").notNull().default("[]"), // JSON array
  benefits: text("benefits"), // JSON array
  salary: text("salary"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ContactMessage = typeof contactMessagesTable.$inferSelect;
export type Career = typeof careersTable.$inferSelect;
