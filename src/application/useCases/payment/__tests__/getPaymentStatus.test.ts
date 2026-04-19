import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/auth/supabaseSession", () => ({
  getAuthenticatedUserIdentity: vi.fn(),
  getAuthenticatedUserEmail: vi.fn(),
  signOutServerSession: vi.fn(),
  exchangeAuthCodeForSession: vi.fn(),
}));

vi.mock("@/infrastructure/payment/persistence", () => ({
  getPaymentByInvId: vi.fn(),
  createPendingPayment: vi.fn(),
  getOpenPendingPayment: vi.fn(),
  hasPurchaseForEmailAndProduct: vi.fn(),
  isUniqueViolationError: vi.fn(),
  markPendingPaymentExpired: vi.fn(),
  finalizeRobokassaResult: vi.fn(),
  recordPaymentCallback: vi.fn(),
  getPaymentCallbacksByInvId: vi.fn(),
  getPurchasesByEmail: vi.fn(),
  getPaymentOpsSummary: vi.fn(),
  isPendingInvoiceReusable: vi.fn(),
}));

import { getOwnPaymentStatus } from "@/application/useCases/payment/getPaymentStatus";
import * as session from "@/infrastructure/auth/supabaseSession";
import * as persistence from "@/infrastructure/payment/persistence";

const mockedSession = vi.mocked(session);
const mockedPersistence = vi.mocked(persistence);

describe("getOwnPaymentStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return bad_request when invId is missing", async () => {
    await expect(getOwnPaymentStatus(null)).resolves.toEqual({ status: "bad_request" });
    expect(mockedSession.getAuthenticatedUserIdentity).not.toHaveBeenCalled();
  });

  it("should return unauthorized when user is not authenticated", async () => {
    mockedSession.getAuthenticatedUserIdentity.mockResolvedValueOnce(null);

    await expect(getOwnPaymentStatus("42")).resolves.toEqual({ status: "unauthorized" });
    expect(mockedPersistence.getPaymentByInvId).not.toHaveBeenCalled();
  });

  it("should return not_found when invoice does not exist", async () => {
    mockedSession.getAuthenticatedUserIdentity.mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
    });
    mockedPersistence.getPaymentByInvId.mockResolvedValueOnce(null);

    await expect(getOwnPaymentStatus("42")).resolves.toEqual({ status: "not_found" });
  });

  it("should allow access by matching user_id", async () => {
    mockedSession.getAuthenticatedUserIdentity.mockResolvedValueOnce({
      id: "user-1",
      email: "other@example.com",
    });
    mockedPersistence.getPaymentByInvId.mockResolvedValueOnce({
      inv_id: "42",
      email: "user@example.com",
      user_id: "user-1",
      product_id: "1",
      out_sum: 1990,
      status: "completed",
      completed_at: "2026-04-19T12:00:00.000Z",
      created_at: "2026-04-19T11:00:00.000Z",
      last_callback_at: "2026-04-19T12:00:00.000Z",
      callback_count: 2,
      paid_out_sum: 1990,
      last_error_code: null,
      last_error_message: null,
      result_last_signature: "ABC",
    });

    await expect(getOwnPaymentStatus("42")).resolves.toEqual({
      status: "ok",
      paymentStatus: "completed",
      invId: "42",
      productId: "1",
      callbackCount: 2,
      completedAt: "2026-04-19T12:00:00.000Z",
      lastErrorCode: null,
      lastErrorMessage: null,
      paidOutSum: 1990,
    });
  });

  it("should allow legacy invoices by matching normalized email when user_id is null", async () => {
    mockedSession.getAuthenticatedUserIdentity.mockResolvedValueOnce({
      id: "user-2",
      email: "USER@example.com",
    });
    mockedPersistence.getPaymentByInvId.mockResolvedValueOnce({
      inv_id: "77",
      email: "user@example.com",
      user_id: null,
      product_id: "1",
      out_sum: 1990,
      status: "pending",
      completed_at: null,
      created_at: "2026-04-19T11:00:00.000Z",
      last_callback_at: null,
      callback_count: 0,
      paid_out_sum: null,
      last_error_code: null,
      last_error_message: null,
      result_last_signature: null,
    });

    await expect(getOwnPaymentStatus("77")).resolves.toEqual({
      status: "ok",
      paymentStatus: "pending",
      invId: "77",
      productId: "1",
      callbackCount: 0,
      completedAt: null,
      lastErrorCode: null,
      lastErrorMessage: null,
      paidOutSum: null,
    });
  });

  it("should hide invoices belonging to another user", async () => {
    mockedSession.getAuthenticatedUserIdentity.mockResolvedValueOnce({
      id: "user-2",
      email: "viewer@example.com",
    });
    mockedPersistence.getPaymentByInvId.mockResolvedValueOnce({
      inv_id: "91",
      email: "owner@example.com",
      user_id: "user-1",
      product_id: "1",
      out_sum: 1990,
      status: "pending",
      completed_at: null,
      created_at: "2026-04-19T11:00:00.000Z",
      last_callback_at: null,
      callback_count: 0,
      paid_out_sum: null,
      last_error_code: null,
      last_error_message: null,
      result_last_signature: null,
    });

    await expect(getOwnPaymentStatus("91")).resolves.toEqual({ status: "not_found" });
  });
});
