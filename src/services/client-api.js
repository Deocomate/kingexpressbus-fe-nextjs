import "server-only";

/**
 * @typedef {Object} WebProfile
 * @property {number} id
 * @property {string} profile_name
 * @property {string|null} title
 * @property {string|null} description
 * @property {string|null} logo_url
 * @property {string|null} favicon_url
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} hotline
 * @property {string|null} whatsapp
 * @property {string|null} address
 * @property {string|null} facebook_url
 * @property {string|null} zalo_url
 * @property {string|null} map_embedded
 * @property {string|null} policy_content
 * @property {string|null} introduction_content
 */

/**
 * @typedef {Object} MenuNode
 * @property {number} id
 * @property {string} name
 * @property {string|null} url
 * @property {number|null} parent_id
 * @property {number} priority
 * @property {string} type
 * @property {number|null} related_id
 * @property {MenuNode[]} children
 */

const API_BASE =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

// Short cache: header/footer chrome data changes rarely but should not
// require a redeploy to pick up admin edits (website config, menu reorder).
const REVALIDATE_SECONDS = 60;
async function apiGet(path) {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    next: {
      revalidate: REVALIDATE_SECONDS
    }
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return await res.json();
}
export function getWebProfile() {
  return apiGet("/public/web-profile");
}
export function getMenus() {
  return apiGet("/public/menus");
}

/**
 * Resolve CMS page body for `/trang/{slug}` from WebProfile fields.
 * Only `gioi-thieu` (introduction_content) and `chinh-sach`
 * (policy_content) are supported; other slugs have no content source.
 */
export const CMS_PAGE_SLUGS = ["gioi-thieu", "chinh-sach"];
export function resolveCmsPageContent(webProfile, slug) {
  if (slug === "gioi-thieu") return webProfile.introduction_content;
  if (slug === "chinh-sach") return webProfile.policy_content;
  return null;
}