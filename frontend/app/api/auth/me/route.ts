// frontend/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { authFetch } from "@/lib/authFetch";

export async function GET() {
  try {
    const res = await authFetch("GET", "/auth/me");
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    return NextResponse.json({ detail: "Not authenticated" }, { status });
  }
}