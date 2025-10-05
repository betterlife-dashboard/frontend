"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

const navItems = [
  { label: "Todo 홈", href: "/", icon: "📋" },
  { label: "업무·학습", href: "/work-study", icon: "📘" },
  { label: "운동", href: "/workout", icon: "💪" },
  { label: "기록", href: "/records", icon: "🗂" },
  { label: "캘린더", href: "/calendar", icon: "🗓" },
  { label: "설정", href: "/settings", icon: "⚙️" },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const today = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    return formatter.format(new Date());
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FBF8F4] text-[#3A3A3A]">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#E5DED5] bg-[#F4ECE4] p-6 lg:flex">
        <div>
          <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">🌿</span>
            Better Life
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors" +
                    (active
                      ? " bg-[#FFFFFF] text-[#2F2A26] shadow-sm"
                      : " text-[#6F6F6F] hover:bg-[#FFFFFF]/60")
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-xl bg-white/80 p-4 text-sm text-[#6F6F6F] shadow-sm">
          <p className="font-semibold text-[#3A3A3A]">오늘의 한마디</p>
          <p className="mt-1 leading-relaxed">일상의 리듬을 차분히 쌓아볼까요?</p>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E5DED5] bg-[#FBF8F4]/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#9B8F86]">오늘</p>
              <p className="text-xl font-semibold text-[#3A3A3A]">{today}</p>
            </div>
            <div className="flex flex-1 items-center gap-3 sm:justify-end">
              <div className="hidden items-center gap-2 rounded-full border border-[#E5DED5] bg-white px-4 py-2 shadow-sm sm:flex">
                <span className="text-lg text-[#B0B0B0]">🔍</span>
                <input
                  aria-label="검색"
                  placeholder="Todo, 일정, 기록 검색"
                  className="w-48 border-none bg-transparent text-sm text-[#3A3A3A] outline-none"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#4A90E2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3C7CC5]">
                <span>＋</span> 새 Todo
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-[#E5DED5] bg-white px-4 py-2 text-xs text-[#6F6F6F] sm:flex">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#52B788]" aria-hidden />
                세션 유효
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
        <nav className="sticky bottom-0 z-20 border-t border-[#E5DED5] bg-[#FBF8F4] px-2 py-2 lg:hidden">
          <div className="grid grid-cols-6 gap-2 text-xs">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2" +
                    (active ? " bg-white text-[#3A3A3A]" : " text-[#6F6F6F]")
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
