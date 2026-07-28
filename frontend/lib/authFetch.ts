import serverApi from "@/lib/serverApi";
import { getAccessToken } from "@/lib/auth";

// Server-side helper: attaches the Authorization header from the
// httpOnly cookie before calling FastAPI. Only import this inside
// Route Handlers (app/api/**/route.ts), never in client components.
export async function authFetch(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>
) {
  const token = await getAccessToken();
  if (!token) {
    const err: any = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }

  return serverApi.request({
    method,
    url: path,
    data: body,
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
}