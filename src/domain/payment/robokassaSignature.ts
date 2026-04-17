/** Robokassa MD5 input: MerchantLogin:OutSum:InvId:Password1 */
export function paySignatureSource(login: string, outSum: string, invId: string, pass1: string): string {
  return `${login}:${outSum}:${invId}:${pass1}`;
}

/** Robokassa MD5 input for Result URL: OutSum:InvId:Password2 */
export function resultSignatureSource(outSum: string, invId: string, pass2: string): string {
  return `${outSum}:${invId}:${pass2}`;
}

export function normalizeRobokassaSignatureHex(value: string): string {
  return value.trim().toUpperCase();
}
