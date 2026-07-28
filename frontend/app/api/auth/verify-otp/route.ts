
import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";
import { setAuthCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await serverApi.post("/auth/verify-otp", body);
    const { access_token, refresh_token } = res.data;

    await setAuthCookies(access_token, refresh_token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Invalid or expired code.";
    return NextResponse.json({ detail }, { status });
  }
}