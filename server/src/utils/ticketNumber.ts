/**
 * Formats ticket sequence into official Ticket Number string: TKT-YYYY-XXXXXX
 * @param year 4-digit year (e.g. 2026)
 * @param sequence 1-indexed sequential integer (e.g. 1 -> "000001")
 */
export function formatTicketNumber(year: number, sequence: number): string {
  const paddedSeq = String(sequence).padStart(6, "0");
  return `TKT-${year}-${paddedSeq}`;
}

/**
 * Generates next unique Ticket Number string based on highest ticket sequence in database
 * Prevents collisions even if records are deleted or created sequentially.
 * @param prisma Prisma instance or transaction handle
 */
export async function generateNextTicketNumber(prisma: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find highest existing ticket record to derive next sequence
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { id: "desc" },
    select: { id: true, ticketNumber: true },
  });

  let nextSeq = 1;
  if (lastTicket) {
    if (lastTicket.ticketNumber) {
      const match = lastTicket.ticketNumber.match(/TKT-(\d{4})-(\d{6})/);
      if (match && Number(match[1]) === currentYear) {
        nextSeq = Number(match[2]) + 1;
      } else {
        nextSeq = (lastTicket.id || 0) + 1;
      }
    } else {
      nextSeq = (lastTicket.id || 0) + 1;
    }
  }
  
  return formatTicketNumber(currentYear, nextSeq);
}
