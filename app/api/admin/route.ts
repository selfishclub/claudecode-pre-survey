import { NextResponse } from "next/server";
import { SCRIPT_URL } from "@/lib/config";

// 고객의눈 어드민 데이터 조회 (인증 없음)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(SCRIPT_URL, { cache: "no-store" });
    const text = await res.text();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { result: "error", message: "백엔드(Apps Script) 응답을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
