// Shared by server (RSC) and browser (client component) fetches.
// Browser: NEXT_PUBLIC_API_URL (baked at build — must be reachable from the user's browser).
// Server/SSR: API_INTERNAL_URL when set (e.g. http://api:8000 on the compose network).
function resolveApiBase() {
  if (typeof window === "undefined") {
    return (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}
export const API_BASE = resolveApiBase();
export class ApiError extends Error {
  status;
  body;
  constructor(status, body) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}
export async function apiFetch(path, init) {
  const {
    revalidate,
    ...rest
  } = init ?? {};
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...rest,
    ...(revalidate !== undefined ? {
      next: {
        revalidate
      }
    } : {})
  });
  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined;
  return await res.json();
}