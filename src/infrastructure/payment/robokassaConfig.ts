export function isRobokassaTestMode(): boolean {
  return process.env["ROBOKASSA_TEST"] === "1" || process.env["ROBOKASSA_TEST"] === "true";
}

export function getRobokassaPaymentPass1(): string | undefined {
  if (isRobokassaTestMode()) {
    return process.env["ROBOKASSA_TESTPASS1"] || process.env["ROBOKASSA_PASS1"];
  }
  return process.env["ROBOKASSA_PASS1"];
}

export function getRobokassaResultPass2(): string | undefined {
  if (isRobokassaTestMode()) {
    return process.env["ROBOKASSA_TESTPASS2"] || process.env["ROBOKASSA_PASS2"];
  }
  return process.env["ROBOKASSA_PASS2"];
}
