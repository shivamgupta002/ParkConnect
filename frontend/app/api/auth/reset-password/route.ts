// frontend/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await serverApi.post("/auth/reset-password", body);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Could not reset password.";
    return NextResponse.json({ detail }, { status });
  }
}