import { pgTable, text, serial, integer, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const vehicleTypeEnum = pgEnum("vehicle_type", ["scooter", "bicycle", "car", "van", "truck"]);
export const driverStatusEnum = pgEnum("driver_status", ["online", "offline", "busy"]);

export const driversTable = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  avatar: text("avatar"),
  vehicleType: vehicleTypeEnum("vehicle_type").notNull().default("scooter"),
  vehiclePlate: text("vehicle_plate"),
  status: driverStatusEnum("status").notNull().default("offline"),
  rating: real("rating").notNull().default(4.8),
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  wallet: real("wallet").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Driver = typeof driversTable.$inferSelect;
