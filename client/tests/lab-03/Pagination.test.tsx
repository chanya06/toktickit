import { describe, it, expect } from "vitest";
import { getPaginationItems } from "../../src/utils/pagination.js";

describe("getPaginationItems Utility", () => {
  it("returns all page numbers when totalPages <= 7", () => {
    expect(getPaginationItems(1, 0)).toEqual([]);
    expect(getPaginationItems(1, 1)).toEqual([1]);
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("truncates with trailing ellipsis when currentPage is near start", () => {
    // 65 total pages, page 1
    expect(getPaginationItems(1, 65)).toEqual([1, 2, 3, 4, 5, "...", 65]);
    // 65 total pages, page 4
    expect(getPaginationItems(4, 65)).toEqual([1, 2, 3, 4, 5, "...", 65]);
  });

  it("truncates with leading and trailing ellipsis when currentPage is in middle", () => {
    // 65 total pages, page 5
    expect(getPaginationItems(5, 65)).toEqual([1, "...", 4, 5, 6, "...", 65]);
    // 65 total pages, page 31
    expect(getPaginationItems(31, 65)).toEqual([1, "...", 30, 31, 32, "...", 65]);
  });

  it("truncates with leading ellipsis when currentPage is near end", () => {
    // 65 total pages, page 62 (totalPages - 3)
    expect(getPaginationItems(62, 65)).toEqual([1, "...", 61, 62, 63, 64, 65]);
    // 65 total pages, page 65
    expect(getPaginationItems(65, 65)).toEqual([1, "...", 61, 62, 63, 64, 65]);
  });
});
