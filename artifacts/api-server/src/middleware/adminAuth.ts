import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * requireAdmin — must be used AFTER requireAuth.
 * Checks that the authenticated user has role === 'admin'.
 */
export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId: number | undefined = res.locals.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [user] = await db
      .select({ role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Forbidden: admin only" });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
