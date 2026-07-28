import { NextRequest, NextResponse } from "next/server";
import { authFetch } from "@/lib/authFetch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const res = await authFetch("GET", "/vehicles", undefined, {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    return NextResponse.json(
      { detail: err.response?.data?.detail ?? "Could not load vehicles." },
      { status }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await authFetch("POST", "/vehicles", body);
    return NextResponse.json(res.data, { status: 201 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Could not add vehicle.";
    return NextResponse.json({ detail }, { status });
  }
}