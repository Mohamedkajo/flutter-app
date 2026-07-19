import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, flashSalesTable, flashSaleProductsTable, productsTable } from "@workspace/db";
import { ListFlashSalesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/flash-sales", async (_req, res): Promise<void> => {
  const sales = await db.select().from(flashSalesTable).where(eq(flashSalesTable.isActive, true));

  const salesWithProducts = await Promise.all(sales.map(async (sale) => {
    const links = await db.select().from(flashSaleProductsTable).where(eq(flashSaleProductsTable.flashSaleId, sale.id));
    const productIds = links.map(l => l.productId);
    const products = productIds.length > 0
      ? await db.select().from(productsTable).where(eq(productsTable.id, productIds[0])).limit(6)
      : await db.select().from(productsTable).limit(6);

    return {
      ...sale,
      description: sale.description ?? null,
      bannerImage: sale.bannerImage ?? null,
      endsAt: sale.endsAt.toISOString(),
      products: products.map(p => ({ ...p, tags: p.tags ? JSON.parse(p.tags) as string[] : [] })),
    };
  }));

  res.json(ListFlashSalesResponse.parse(salesWithProducts));
});

export default router;
