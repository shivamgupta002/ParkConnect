import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/lib/serverApi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const res = await serverApi.get(`/vehicle/${token}`);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    // Backend already returns a generic message for missing/inactive/expired —
    // just pass it through as-is, no extra detail added here.
    return NextResponse.json(
      { detail: err.response?.data?.detail ?? "This QR code is no longer active." },
      { status }
    );
  }
}