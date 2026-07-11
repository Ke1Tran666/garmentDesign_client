// Backend URL
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// API Base URL
export const BASE_URL_API = `${BACKEND_URL}/api`;

// Auth API
export const AUTH_API = `${BASE_URL_API}/auth`;

// User API
export const USER_API = `${BASE_URL_API}/users`;

// Role API
export const ROLE_API = `${BASE_URL_API}/roles`;

// User Address API
export const USER_ADDRESS_API = `${BASE_URL_API}/user-addresses`;

// User Auth Provider API
export const USER_AUTH_PROVIDER_API = `${BASE_URL_API}/userAuthProviders`;

// Newsletter API
export const NEWSLETTER_API = `${BASE_URL_API}/newsletter`;

// Service API
export const SERVICE_API = `${BASE_URL_API}/services`;

// Contact API
export const CONTACT_API = `${BASE_URL_API}/mail/contact`;