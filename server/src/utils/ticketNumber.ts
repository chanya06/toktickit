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
 * Generates next unique Ticket Number string based on current database ticket count/max ID
 * @param prismaLazy Lazy prisma instance getter or transaction handle
 */
export async function generateNextTicketNumber(prisma: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find highest existing ticket ID or count to derive next sequence
  const count = await prisma.ticket.count();
  const nextSeq = count + 1;
  
  return formatTicketNumber(currentYear, nextSeq);
}
