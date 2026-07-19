import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";

export const blogCategoriesTable = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image"),
  authorId: integer("author_id"),
  authorName: text("author_name").notNull().default("Cargo Team"),
  categoryId: integer("category_id"),
  categoryName: text("category_name"),
  isPublished: boolean("is_published").notNull().default(false),
  tags: text("tags"), // JSON array
  viewCount: integer("view_count").notNull().default(0),
  readTime: integer("read_time").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export type BlogCategory = typeof blogCategoriesTable.$inferSelect;
export type BlogPost = typeof blogPostsTable.$inferSelect;
