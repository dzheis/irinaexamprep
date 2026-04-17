import crypto from "crypto";

/** Robokassa MD5 over UTF-8 string, uppercase hex (IO / crypto primitive). */
export function md5Utf8HexUppercase(utf8: string): string {
  return crypto.createHash("md5").update(utf8, "utf8").digest("hex").toUpperCase();
}

/** InvId range per Robokassa expectations. */
export function randomRobokassaInvId(): string {
  return String(crypto.randomInt(1, 2147483647));
}
