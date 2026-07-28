import { NextRequest, NextResponse } from "next/server";
import { authFetch } from "@/lib/authFetch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const res = await authFetch("GET", "/calls", undefined, {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    return NextResponse.json(
      { detail: err.response?.data?.detail ?? "Could not load call history." },
      { status }
    );
  }
}