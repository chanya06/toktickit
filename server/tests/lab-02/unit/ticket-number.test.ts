import { describe, it, expect } from "vitest";
import { formatTicketNumber } from "../../../src/utils/ticketNumber.js";

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
});
