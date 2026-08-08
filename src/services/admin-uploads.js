// Two-stage upload contract (`app/presentation/schemas/admin_meta.py`):
// stage (multipart) → token; commit(token, target_directory) on form save;
// DELETE revert on cancel. Commit only after parent form succeeds.
import { apiFetch } from "@/services/api-base";
export function stageUpload(file) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch("/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: form
  });
}
export function revertUpload(token) {
  return apiFetch("/admin/uploads", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      token
    })
  });
}
export function commitUpload(token, targetDirectory = "uploads") {
  return apiFetch("/admin/uploads/commit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      token,
      target_directory: targetDirectory
    })
  });
}

/** Commits a freshly staged Uploader value, or passes an already-committed url through unchanged. */
export async function resolveImageField(value, targetDirectory) {
  if (!value) return null;
  if (!value.token) return value.previewUrl;
  const {
    path
  } = await commitUpload(value.token, targetDirectory);
  return path;
}