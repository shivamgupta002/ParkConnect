// This is what should be inside it — confirm, then move the file
import { NextRequest, NextResponse } from "next/server";
import { authFetch } from "@/lib/authFetch";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await authFetch("GET", `/vehicles/${id}`);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    return NextResponse.json(
      { detail: err.response?.data?.detail ?? "Vehicle not found." },
      { status }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  try {
    const res = await authFetch("PUT", `/vehicles/${id}`, body);
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Could not update vehicle.";
    return NextResponse.json({ detail }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await authFetch("DELETE", `/vehicles/${id}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    const status = err.status ?? err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Could not delete vehicle.";
    return NextResponse.json({ detail }, { status });
  }
}