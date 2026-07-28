import axios from "axios";

// Used only inside Next.js Route Handlers (app/api/**/route.ts) — never
// imported into a client component. This talks to FastAPI directly.
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default serverApi;