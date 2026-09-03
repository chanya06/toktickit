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
 * @param prismaClient Prisma instance or transaction handle
 */
export async function generateNextTicketNumber(prismaClient: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find highest existing ticket record to derive next sequence
  const lastTicket = await prismaClient.ticket.findFirst({
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

/**
 * Creates a ticket atomically inside a Prisma transaction with automatic retry
 * on unique constraint collision (P2002) to guarantee concurrency safety.
 */
export async function createTicketAtomically(prisma: any, ticketData: any, maxRetries = 5): Promise<any> {
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    try {
      return await prisma.$transaction(async (tx: any) => {
        const ticketNumber = await generateNextTicketNumber(tx);
        
        return await tx.ticket.create({
          data: {
            ...ticketData,
            ticketNumber,
          },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
            relatedSystem: { select: { id: true, name: true } },
          },
        });
      });
    } catch (error: any) {
      // Prisma P2002 is unique constraint violation (ticketNumber collision)
      if (error?.code === "P2002" && attempts < maxRetries) {
        continue; // Retry with next ticket number
      }
      throw error;
    }
  }
  throw new Error("Failed to generate a unique Ticket Number after max retries");
}
