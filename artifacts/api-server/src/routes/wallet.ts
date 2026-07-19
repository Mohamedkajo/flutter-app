import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, walletsTable, walletTransactionsTable } from "@workspace/db";
import {
  TopUpWalletBody,
  GetWalletResponse,
  ListWalletTransactionsResponse,
  TopUpWalletResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

async function getOrCreateWallet(userId: number) {
  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).limit(1);
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId, balance: 0, loyaltyPoints: 0 }).returning();
  }
  return wallet;
}

const router: IRouter = Router();

router.get("/wallet", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const wallet = await getOrCreateWallet(res.locals.userId);
    res.json(GetWalletResponse.parse({ ...wallet, currency: "AED" }));
  } catch (err) { next(err); }
});

router.get("/wallet/transactions", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const wallet = await getOrCreateWallet(res.locals.userId);
    const transactions = await db.select().from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.walletId, wallet.id))
      .orderBy(desc(walletTransactionsTable.createdAt)).limit(20);
    res.json(ListWalletTransactionsResponse.parse(transactions.map(t => ({
      ...t,
      type: t.type as string,
      orderId: t.orderId ?? null,
      createdAt: t.createdAt.toISOString(),
    }))));
  } catch (err) { next(err); }
});

router.post("/wallet/topup", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = TopUpWalletBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const wallet = await getOrCreateWallet(res.locals.userId);
    const [updated] = await db.update(walletsTable)
      .set({ balance: wallet.balance + parsed.data.amount, updatedAt: new Date() })
      .where(eq(walletsTable.id, wallet.id))
      .returning();
    await db.insert(walletTransactionsTable).values({
      walletId: wallet.id,
      type: "credit",
      amount: parsed.data.amount,
      description: `Top up via ${parsed.data.paymentMethod}`,
    });
    res.json(TopUpWalletResponse.parse({ ...updated, currency: "AED" }));
  } catch (err) { next(err); }
});

export default router;
