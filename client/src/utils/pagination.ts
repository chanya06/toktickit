/**
 * Calculates a compact list of page numbers and ellipsis ("...") for pagination bars.
 * When totalPages is large (e.g. > 7), it truncates distant pages with "..."
 * so the pagination bar doesn't overflow horizontally.
 */
export function getPaginationItems(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: Math.max(0, totalPages) }, (_, i) => i + 1);
  }

  const items: (number | string)[] = [];

  // When near the start (e.g. currentPage <= 4)
  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) {
      items.push(i);
    }
    items.push("...");
    items.push(totalPages);
  }
  // When near the end (e.g. currentPage >= totalPages - 3)
  else if (currentPage >= totalPages - 3) {
    items.push(1);
    items.push("...");
    for (let i = totalPages - 4; i <= totalPages; i++) {
      items.push(i);
    }
  }
  // In the middle
  else {
    items.push(1);
    items.push("...");
    items.push(currentPage - 1);
    items.push(currentPage);
    items.push(currentPage + 1);
    items.push("...");
    items.push(totalPages);
  }

  return items;
}
