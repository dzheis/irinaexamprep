/** Rub prices for methodology digital products (must match what Robokassa expects). */
export const METHODOLOGY_PRODUCT_PRICE_RUB: Readonly<Record<string, number>> = {
  "1": 1990,
};

export function getMethodologyProductPriceRub(productId: string): number | undefined {
  const id = productId.trim();
  const price = METHODOLOGY_PRODUCT_PRICE_RUB[id];
  if (price === undefined || !Number.isFinite(price) || price <= 0) return undefined;
  return price;
}
