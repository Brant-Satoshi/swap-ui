import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function buildUrl(req: NextRequest, path: string) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  return `https://api.0x.org${path}?${qs}`;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.ZEROX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing ZEROX_API_KEY" }, { status: 500 });
  }

  const upstream = buildUrl(req, "/swap/allowance-holder/quote");

  const r = await fetch(upstream, {
    method: "GET",
    headers: {
      "0x-api-key": apiKey,
      "0x-version": "v2",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") ?? "application/json" },
  });
}
