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
