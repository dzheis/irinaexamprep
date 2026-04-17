import { describe, it, expect } from "vitest";
import { validateApplyFormSubmission } from "@/domain/content/applyFormSubmissionPolicy";

describe("validateApplyFormSubmission", () => {
  it("should reject non-object body", () => {
    expect(validateApplyFormSubmission(null).ok).toBe(false);
    expect(validateApplyFormSubmission([] as unknown).ok).toBe(false);
    expect(validateApplyFormSubmission("x").ok).toBe(false);
  });

  it("should reject missing first or last name", () => {
    const r = validateApplyFormSubmission({ email: "u@e.com", firstName: "Ivan" });
    expect(r.ok).toBe(false);
  });

  it("should reject names containing digits or special characters", () => {
    const r = validateApplyFormSubmission({
      firstName: "Ivan1",
      lastName: "Ivanov",
      email: "u@e.com",
    });
    expect(r.ok).toBe(false);
  });

  it("should reject invalid email format", () => {
    const r = validateApplyFormSubmission({
      firstName: "Ivan",
      lastName: "Ivanov",
      email: "bad",
    });
    expect(r.ok).toBe(false);
  });

  it("should accept valid input and normalize payload", () => {
    const r = validateApplyFormSubmission({
      firstName: "  Ivan ",
      lastName: "Ivanov",
      middleName: "  ",
      email: "  USER@Example.com  ",
      telegram: "@ivan",
      courseId: "7",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.payload.firstName).toBe("Ivan");
      expect(r.payload.email).toBe("user@example.com");
      expect(r.payload.courseId).toBe(7);
      expect(r.payload.telegram).toBe("@ivan");
      expect(r.payload).not.toHaveProperty("middleName");
    }
  });
});
