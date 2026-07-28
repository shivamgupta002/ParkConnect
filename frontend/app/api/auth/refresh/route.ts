import { NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await serverApi.post("/auth/refresh", { refresh_token: refreshToken });
    const { access_token } = res.data;
    // Backend Phase 2 only returns a new access_token on refresh — keep the
    // existing refresh_token cookie as-is.
    await setAuthCookies(access_token, refreshToken);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    await clearAuthCookies();
    return NextResponse.json({ detail: "Session expired" }, { status: 401 });
  }
}