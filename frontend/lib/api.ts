export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: { code: string; message: string } | Record<string, string> };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("nexora.accessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok || (body && body.success === false)) {
    const err = (body as ApiError).error;
    const message =
      typeof err === "object" && "message" in err
        ? err.message
        : typeof err === "object" && err !== null
        ? Object.values(err).join("; ")
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return (body as ApiSuccess<T>).data;
}

export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: form,
    headers: { ...getAuthHeaders() },
  });
  const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok || (body && body.success === false)) {
    const err = (body as ApiError).error;
    throw new Error(typeof err === "object" && "message" in err ? err.message : `Upload failed (${res.status})`);
  }
  return (body as ApiSuccess<T>).data;
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}