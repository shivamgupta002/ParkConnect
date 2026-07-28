import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await serverApi.post("/auth/forgot-password", body);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    // Backend already returns a generic message regardless of match —
    // still handle network/5xx errors gracefully here.
    return NextResponse.json(
      { detail: "Something went wrong. Please try again." },
      { status: err.response?.status ?? 500 }
    );
  }
}