export function parsePaymentAmount(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export function paymentAmountsMatchWithinTolerance(a: number, b: number, tolerance = 0.01): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}
