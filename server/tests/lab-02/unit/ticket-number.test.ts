import { describe, it, expect } from "vitest";
import { formatTicketNumber, generateNextTicketNumber, createTicketAtomically } from "../../../src/utils/ticketNumber.js";

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

  it("handles race condition collision by retrying transaction when unique constraint P2002 is encountered", async () => {
    const currentYear = new Date().getFullYear();
    let attemptCount = 0;

    const mockPrisma = {
      $transaction: async (cb: any) => {
        attemptCount++;
        const mockTx = {
          ticket: {
            findFirst: async () => {
              if (attemptCount === 1) {
                // First attempt sees ticket 10, generates TKT-YYYY-000011
                return { id: 10, ticketNumber: `TKT-${currentYear}-000010` };
              }
              // Retry attempt sees ticket 11 created concurrently, generates TKT-YYYY-000012
              return { id: 11, ticketNumber: `TKT-${currentYear}-000011` };
            },
            create: async (args: any) => {
              if (attemptCount === 1) {
                // Simulate P2002 unique constraint violation on first attempt due to race condition
                const error: any = new Error("Unique constraint failed on ticketNumber");
                error.code = "P2002";
                throw error;
              }
              return { id: 12, ticketNumber: args.data.ticketNumber };
            },
          },
        };
        return cb(mockTx);
      },
    };

    const result = await createTicketAtomically(mockPrisma, { summary: "Concurrent test" });

    expect(attemptCount).toBe(2);
    expect(result.ticketNumber).toBe(`TKT-${currentYear}-000012`);
  });
});
