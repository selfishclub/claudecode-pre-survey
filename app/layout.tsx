import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고객의눈 · 사전 서베이",
  description:
    "고객의눈 사전 서베이 — 원활한 운영을 위한 사전 정보를 수집합니다.",
};

// 다크 테마 고정
export const viewport = {
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* Pretendard Variable — CDN 로드, 실패 시 시스템 폰트로 폴백 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
