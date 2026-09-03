const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
  department?: string | null;
  isActive: boolean;
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

// Issue 2 + Issue 4 — call the backend.
// Steps: fetch `${API_URL}/api/health`; if not ok, throw.
//        then fetch `${API_URL}/api/categories`; if not ok, throw.
//        return { online: true, categories }.
// Throwing on failure lets the UI show a single Offline/error state.
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
