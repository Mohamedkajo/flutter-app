import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody, RegisterResponse, LoginResponse, GetMeResponse } from "@workspace/api-zod";
import { makeToken, parseToken, hashPassword, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

// Expose parseToken for legacy use (auth middleware imports from lib/auth directly)
export { parseToken };

router.post("/auth/register", async (req, res, next): Promise<void> => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { name, email, password, phone } = parsed.data;

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashPassword(password),
      phone: phone ?? null,
      role: "customer",
    }).returning();

    const token = makeToken(user.id);
    res.status(201).json(RegisterResponse.parse({
      token,
      user: {
        ...user,
        loyaltyPoints: user.loyaltyPoints,
        createdAt: user.createdAt.toISOString(),
      }
    }));
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next): Promise<void> => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, password } = parsed.data;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user || !verifyPassword(password, user.password)) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = makeToken(user.id);
    res.json(LoginResponse.parse({
      token,
      user: {
        ...user,
        loyaltyPoints: user.loyaltyPoints,
        createdAt: user.createdAt.toISOString(),
      }
    }));
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", async (req, res, next): Promise<void> => {
  try {
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

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(GetMeResponse.parse({
      ...user,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt.toISOString(),
    }));
  } catch (err) {
    next(err);
  }
});

export default router;
