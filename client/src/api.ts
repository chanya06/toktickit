const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
  description?: string | null;
}

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
  department?: string | null;
  isActive: boolean;
}

export interface CreateTicketPayload {
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  summary: string;
  description: string;
}

export interface TicketResponse {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: string;
  itPriority: string;
  status: string;
  summary: string;
  description: string;
  createdAt: string;
  requester?: { id: number; name: string; email: string };
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export async function fetchActiveRequesters(): Promise<DevelopmentRequester[]> {
  const res = await fetch(`${API_URL}/api/requesters`).catch(() => null);
  if (!res || !res.ok) {
    throw new Error("Failed to load active development requesters");
  }
  return res.json();
}

export async function fetchActiveCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`).catch(() => null);
  if (!res || !res.ok) {
    throw new Error("Failed to load request categories");
  }
  return res.json();
}

export async function fetchActiveSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`).catch(() => null);
  if (!res || !res.ok) {
    throw new Error("Failed to load related systems");
  }
  return res.json();
}

export async function createTicket(payload: CreateTicketPayload): Promise<TicketResponse> {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res) {
    throw new Error("Network error: Unable to connect to server");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create ticket");
  }

  return data;
}

export interface FetchTicketsParams {
  requesterId: number;
  search?: string;
  categoryId?: number | number[];
  relatedSystemId?: number | number[];
  requestedPriority?: string | string[];
  status?: string | string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedTicketsResponse {
  data: (TicketResponse & { attachmentCount?: number })[];
  pagination: PaginationMeta;
}

export async function fetchTickets(
  params: FetchTicketsParams,
  signal?: AbortSignal
): Promise<PaginatedTicketsResponse> {
  const query = new URLSearchParams();
  query.set("requesterId", String(params.requesterId));

  if (params.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }

  if (params.categoryId) {
    const cats = Array.isArray(params.categoryId) ? params.categoryId.join(",") : String(params.categoryId);
    if (cats) query.set("categoryId", cats);
  }

  if (params.relatedSystemId) {
    const sys = Array.isArray(params.relatedSystemId) ? params.relatedSystemId.join(",") : String(params.relatedSystemId);
    if (sys) query.set("relatedSystemId", sys);
  }

  if (params.requestedPriority) {
    const pri = Array.isArray(params.requestedPriority) ? params.requestedPriority.join(",") : String(params.requestedPriority);
    if (pri) query.set("requestedPriority", pri);
  }

  if (params.status) {
    const st = Array.isArray(params.status) ? params.status.join(",") : String(params.status);
    if (st) query.set("status", st);
  }

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    query.set("sortOrder", params.sortOrder);
  }

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    query.set("pageSize", String(params.pageSize));
  }

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, { signal }).catch((err) => {
    if (err?.name === "AbortError" || signal?.aborted) {
      throw err;
    }
    return null;
  });

  if (!res) {
    throw new Error("Network error: Unable to connect to server");
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch tickets");
  }

  return data;
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`).catch(() => null);
  if (!healthRes || !healthRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const healthData = await healthRes.json();
  if (healthData.status !== "ok") {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const catRes = await fetch(`${API_URL}/api/categories`).catch(() => null);
  if (!catRes || !catRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const categories: Category[] = await catRes.json();
  return { online: true, categories };
}
