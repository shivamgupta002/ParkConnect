import { NextRequest, NextResponse } from "next/server";
import { authFetch } from "@/lib/authFetch";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await authFetch("POST", `/vehicles/${id}/qr`);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Could not generate QR code.";
    return NextResponse.json({ detail }, { status });
  }
}