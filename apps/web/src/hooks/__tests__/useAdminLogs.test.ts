import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchAdminLogs } from "../useAdminLogs";

describe("fetchAdminLogs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed logs array when API ok", async () => {
    const sample = [
      { id: "1", eventKey: "login", organizationId: "org1", created_at: "2024-01-01T00:00:00Z" },
    ];
    (global as any).fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => sample }));

    const res = await fetchAdminLogs("fake-token");
    expect(res).toEqual(sample);
  });

  it("throws when response not ok", async () => {
    (global as any).fetch = vi.fn(() => Promise.resolve({ ok: false, text: async () => "unauthorized" }));
    await expect(fetchAdminLogs("fake-token")).rejects.toThrow("unauthorized");
  });
});
