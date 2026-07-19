import type { Request, Response, NextFunction } from "express";
import { parseToken } from "../lib/auth";

/**
 * Requires a valid Bearer token. Responds 401 otherwise.
 * On success, sets `res.locals.userId` (number).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = parseToken(authHeader.slice(7));
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  res.locals.userId = userId as number;
  next();
}

/**
 * Optionally reads a Bearer token. Sets `res.locals.userId` when valid
 * but always calls next().
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const userId = parseToken(authHeader.slice(7));
    if (userId) res.locals.userId = userId as number;
  }
  next();
}
