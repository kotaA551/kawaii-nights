import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // すでに /en|zh|ko 配下なら何もしない
  if (/^\/(en|zh|ko)(\/|$)/.test(pathname)) return NextResponse.next();

  // ルートやその他を /en に寄せる
  if (pathname === "/" || !/^\/api(\/|$)/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
