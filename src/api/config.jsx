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
export const USER_ADDRESS_API = `${BASE_URL_API}/userAddresses`;

// User Auth Provider API
export const USER_AUTH_PROVIDER_API = `${BASE_URL_API}/userAuthProviders`;