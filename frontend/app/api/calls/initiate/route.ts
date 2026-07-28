// frontend/app/api/calls/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await serverApi.post("/calls/initiate", body);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.response?.status ?? 500;

    if (status === 429) {
      return NextResponse.json(
        { detail: err.response?.data?.detail ?? "Too many call attempts, please wait." },
        { status: 429 }
      );
    }

    if (status === 404) {
      // Same generic message as the vehicle-lookup endpoint — don't
      // distinguish missing/inactive tokens here either.
      return NextResponse.json(
        { detail: "This QR code is no longer active." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { detail: err.response?.data?.detail ?? "Could not place the call." },
      { status }
    );
  }
}