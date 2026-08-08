// Generic helpers matching FastAPI admin list/write contract
// (app/presentation/schemas/admin_common.py): Paginated{items,total,page,page_size},
// ReorderRequest{ids}, MessageOut{message}. Server owns sort/search columns;
// client only sends page/page_size/q (+ module-specific extra filters).
// Bulk delete is per-id DELETE (no BE bulk-delete route).
import { apiFetch, ApiError } from "@/services/api-base";

/**
 * @template T
 * @typedef {Object} Paginated
 * @property {T[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} page_size
 */

/**
 * @typedef {Object} MessageOut
 * @property {string} message
 */

const JSON_HEADERS = {
  "Content-Type": "application/json",
};
export function fetchPaginated(path, params) {
  const search = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.page_size)
  });
  if (params.q) search.set("q", params.q);
  for (const [key, value] of Object.entries(params.extra ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return apiFetch(`${path}?${search.toString()}`, {
    credentials: "include"
  });
}

/**
 * FastAPI error bodies: `{detail: string}` or delete-guard
 * `{detail: {message, booking_count}}` (see `app/application/catalog/delete_guards.py`).
 */
export function getErrorMessage(err, fallback) {
  if (err instanceof ApiError) {
    const body = err.body;
    if (typeof body?.detail === "string") return body.detail;
    if (body?.detail && typeof body.detail === "object" && body.detail.message) {
      return body.detail.message;
    }
  }
  return fallback;
}
export function adminGet(path) {
  return apiFetch(path, {
    credentials: "include"
  });
}
export function adminCreate(path, body) {
  return apiFetch(path, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(body)
  });
}
export function adminUpdate(path, body) {
  return apiFetch(path, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(body)
  });
}
export function adminDelete(path) {
  return apiFetch(path, {
    method: "DELETE",
    credentials: "include"
  });
}
export function adminReorder(path, ids) {
  return apiFetch(path, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      ids
    })
  });
}