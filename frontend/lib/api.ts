/**
 * Thin axios instance pointed at the ParkConnect backend.
 *
 * Phase 0 scope: just wiring, no auth yet. Later phases (Phase 10+) will
 * attach the Authorization header here — either from an httpOnly cookie on
 * server-side Route Handler calls, or from in-memory state on the client,
 * depending on how session handling is finalized.
 */
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// TODO(Phase 2/10): attach the Authorization: Bearer <access_token> header
// here once auth exists. For server-side Route Handler calls this will read
// the token from an httpOnly cookie; for any client-side calls it will read
// from wherever the access token is held in memory. Nothing to do yet —
// Phase 0 has no authenticated endpoints.
//
// api.interceptors.request.use((config) => {
//   const token = getAccessToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
