import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { getAccessToken } from "@/lib/auth";

interface AccessTokenPayload {
  sub?: string;
  email?: string;
  is_admin?: boolean;
  exp: number;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ email: null }, { status: 401 });
  }
  try {
    const decoded = jwtDecode<AccessTokenPayload>(token);
    return NextResponse.json({ email: decoded.email ?? decoded.sub ?? null });
  } catch {
    return NextResponse.json({ email: null }, { status: 401 });
  }
}