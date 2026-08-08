/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} name
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string} role
 */

/**
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterInput
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} [phone]
 */

/**
 * @typedef {Object} RegisterPending
 * @property {string} email
 * @property {boolean} verification_required
 * @property {string} message
 */

/**
 * @typedef {Object} VerifyEmailInput
 * @property {string} email
 * @property {string} code
 */

/**
 * @typedef {Object} ForgotPasswordInput
 * @property {string} email
 */

/**
 * @typedef {Object} ResetPasswordInput
 * @property {string} email
 * @property {string} token
 * @property {string} password
 */

import { apiFetch } from "@/services/api-base";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

/** Dispatched after login / verify / logout so the sticky NavBar can refresh. */
export const AUTH_CHANGED_EVENT = "ksb:auth-changed";

export function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/** @param {LoginInput} input @returns {Promise<AuthUser>} */
export function login(input) {
  return apiFetch("/auth/login", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  }).then((user) => {
    notifyAuthChanged();
    return user;
  });
}

/** @param {RegisterInput} input @returns {Promise<RegisterPending>} */
export function register(input) {
  return apiFetch("/auth/register", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  });
}

/** @param {VerifyEmailInput} input @returns {Promise<AuthUser>} */
export function verifyEmail(input) {
  return apiFetch("/auth/verify-email", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  }).then((user) => {
    notifyAuthChanged();
    return user;
  });
}

/** @param {{ email: string }} input @returns {Promise<{message: string}>} */
export function resendVerification(input) {
  return apiFetch("/auth/resend-verification", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  });
}

/** @returns {Promise<{message: string}>} */
export function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    notifyAuthChanged();
  });
}

/** @returns {Promise<AuthUser|null>} null when anonymous (200) */
export function getMe() {
  return apiFetch("/auth/me", {
    credentials: "include",
  });
}

/** @param {ForgotPasswordInput} input @returns {Promise<{message: string}>} */
export function forgotPassword(input) {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  });
}

/** @param {ResetPasswordInput} input @returns {Promise<{message: string}>} */
export function resetPassword(input) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(input),
  });
}

/**
 * Only relative,
 * same-origin paths are honored — anything else falls back to the caller's default.
 * @param {string|null|undefined} path
 * @returns {path is string}
 */
export function isSafeRedirectPath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}
