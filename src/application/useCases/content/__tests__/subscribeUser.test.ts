import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/infrastructure/email/subscribeNotifications", () => ({
  sendSubscribeNotificationEmails: vi.fn(),
}));

import { subscribeUser } from "@/application/useCases/content/subscribeUser";
import * as emailModule from "@/infrastructure/email/subscribeNotifications";

const mocked = vi.mocked(emailModule);

const originalEnv = { ...process.env };

describe("subscribeUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["EMAIL_USER"] = "bot@example.com";
    process.env["EMAIL_PASS"] = "pass";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should return 503 when email env is missing", async () => {
    delete process.env["EMAIL_USER"];
    const result = await subscribeUser("user@example.com");
    expect(result).toMatchObject({ ok: false, httpStatus: 503 });
    expect(mocked.sendSubscribeNotificationEmails).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid email", async () => {
    const result = await subscribeUser("bad");
    expect(result).toMatchObject({ ok: false, httpStatus: 400 });
    expect(mocked.sendSubscribeNotificationEmails).not.toHaveBeenCalled();
  });

  it("should send notification emails with normalized address", async () => {
    mocked.sendSubscribeNotificationEmails.mockResolvedValueOnce(undefined);
    const result = await subscribeUser("  USER@Example.com  ");
    expect(result).toEqual({ ok: true });
    expect(mocked.sendSubscribeNotificationEmails).toHaveBeenCalledWith("user@example.com");
  });
});
