import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/infrastructure/email/applyNotifications", () => ({
  sendApplyFormEmails: vi.fn(),
}));

import { submitApplyForm } from "@/application/useCases/content/submitApplyForm";
import * as emailModule from "@/infrastructure/email/applyNotifications";

const mocked = vi.mocked(emailModule);

const originalEnv = { ...process.env };
const VALID_BODY = {
  firstName: "Ivan",
  lastName: "Ivanov",
  email: "user@example.com",
  courseId: 1,
};

describe("submitApplyForm", () => {
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
    const result = await submitApplyForm(VALID_BODY);
    expect(result).toMatchObject({ ok: false, httpStatus: 503 });
    expect(mocked.sendApplyFormEmails).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid payload", async () => {
    const result = await submitApplyForm({ firstName: "", lastName: "", email: "bad" });
    expect(result).toMatchObject({ ok: false, httpStatus: 400 });
    expect(mocked.sendApplyFormEmails).not.toHaveBeenCalled();
  });

  it("should dispatch emails for valid payload", async () => {
    mocked.sendApplyFormEmails.mockResolvedValueOnce(undefined);
    const result = await submitApplyForm(VALID_BODY);
    expect(result).toEqual({ ok: true });
    expect(mocked.sendApplyFormEmails).toHaveBeenCalledOnce();
  });
});
