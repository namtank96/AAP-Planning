import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "내부통제 운영 워크스페이스 · KT DS",
  description: "Agentic AI Platform 프로토타입 · K-SOX 통제 운영평가",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
          <div className="container flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-black text-sm shadow-soft">
                AAP
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">내부통제 운영 워크스페이스</div>
                <div className="text-xxs text-muted-foreground">
                  KT DS · Agentic AI Platform · Prototype v0.1
                </div>
              </div>
            </Link>
            <nav className="flex items-center gap-2 text-xs">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                대시보드
              </Link>
              <span className="rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground">
                2026 Q1 평가
              </span>
              <span className="rounded-md border border-border bg-secondary px-3 py-1.5">
                감사 팀장 <strong className="ml-1 text-foreground">김OO</strong>
              </span>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t border-border bg-card mt-12">
          <div className="container py-4 flex items-center justify-between text-xxs text-muted-foreground">
            <span>AAP Prototype · v0.1 · 2026-05-28</span>
            <span>K-SOX 통제 운영평가 시나리오 · 데모 데이터</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
