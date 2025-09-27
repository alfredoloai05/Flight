
function normalizeApiBase(raw?: string) {
  const def = "http://localhost:8000"; 
  let base = (raw || def).trim();
  base = base.replace(/\/+$/g, "");
  if (/\/api$/i.test(base)) {
    return base; 
  }
  if (/\/api\/$/i.test(base + "/")) {
    return base.replace(/\/+$/g, "");
  }
  return base + "/api";
}

const API = normalizeApiBase(import.meta.env.VITE_API_URL);

let accessToken: string | null = localStorage.getItem("accessToken");

export function setAccessToken(t: string | null) {
  accessToken = t;
  if (t) localStorage.setItem("accessToken", t);
  else localStorage.removeItem("accessToken");
}

function sanitizePath(p: string) {
  // asegurar que el path inicie con "/"
  let path = p.startsWith("/") ? p : `/${p}`;
  // si por error viene con "/api/...", quitar el prefijo duplicado
  if (path.startsWith("/api/")) path = path.slice(4); 
  return path;
}

async function request(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");
  if (!(opts.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const finalPath = sanitizePath(path);
  const res = await fetch(`${API}${finalPath}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      // Formato de errores de DRF puede ser {field: ["msg"]}
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        if (j.detail) throw new Error(String(j.detail));
        const parts: string[] = [];
        for (const k of Object.keys(j)) {
          const v = Array.isArray(j[k]) ? j[k].join(', ') : String(j[k]);
          parts.push(`${k}: ${v}`);
        }
        throw new Error(parts.join(' | '));
      }
      throw new Error(JSON.stringify(j));
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
  put: (p: string, body?: any) => request(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (p: string) => request(p, { method: "DELETE" }),
};

export { API };
