import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Placeholder for auth headers — Phase 10 wires this up properly using
// httpOnly cookies read server-side in Next.js route handlers. Client
// components should never read raw JWTs from JS-accessible storage.
// api.interceptors.request.use((config) => { ... });

export default api;