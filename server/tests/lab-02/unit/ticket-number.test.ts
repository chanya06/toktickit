import { describe, it, expect } from "vitest";
import { formatTicketNumber, generateNextTicketNumber } from "../../../src/utils/ticketNumber.js";

describe("Ticket Number Generator Unit Tests (UNIT-01)", () => {
  it("formats ticket numbers with 4-digit year and 6-digit zero-padded sequence", () => {
    expect(formatTicketNumber(2026, 1)).toBe("TKT-2026-000001");
    expect(formatTicketNumber(2026, 12)).toBe("TKT-2026-000012");
    expect(formatTicketNumber(2026, 999999)).toBe("TKT-2026-999999");
  });

  it("matches the official Ticket Number regex pattern TKT-\\d{4}-\\d{6}", () => {
    const ticketNo = formatTicketNumber(2026, 42);
    expect(ticketNo).toMatch(/^TKT-\d{4}-\d{6}$/);
  });

  it("generates next sequential ticket number from max existing ticket record to prevent collisions on deletion", async () => {
    const currentYear = new Date().getFullYear();
    const mockPrisma = {
      ticket: {
        findFirst: async () => ({ id: 10, ticketNumber: `TKT-${currentYear}-000010` }),
      },
    };

    const nextNumber = await generateNextTicketNumber(mockPrisma);
    expect(nextNumber).toBe(`TKT-${currentYear}-000011`);
  });

  it("handles initial database state with zero tickets safely", async () => {
    const currentYear = new Date().getFullYear();
    const mockPrisma = {
      ticket: {
        findFirst: async () => null,
      },
    };

    const nextNumber = await generateNextTicketNumber(mockPrisma);
    expect(nextNumber).toBe(`TKT-${currentYear}-000001`);
  });
});
