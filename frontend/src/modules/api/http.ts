// Cliente HTTP minimal con manejo de JWT y JSON (fetch)
const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

let accessToken: string | null = localStorage.getItem("accessToken");

export function setAccessToken(t: string | null) {
  accessToken = t;
  if (t) localStorage.setItem("accessToken", t);
  else localStorage.removeItem("accessToken");
}

async function request(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");
  if (!(opts.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.detail ?? JSON.stringify(j));
    } catch {
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
  }
  if (res.status === 204) return null;
  return res.json();
}

export const http = {
  get: (p: string) => request(p),
  post: (p: string, body?: any) => request(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: (p: string, body?: any) => request(p, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
};

export { API };
