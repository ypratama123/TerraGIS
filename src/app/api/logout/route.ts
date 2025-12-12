import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));

  // Hapus cookie admin_auth
  res.cookies.set("admin_auth", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}


