const monthDays = [
  { day: 1, cards: [] },
  { day: 2, cards: [] },
  { day: 3, cards: [{ id: "d3-1", label: "회의", type: "start" }, { id: "d3-2", label: "+2", type: "more" }] },
  { day: 4, cards: [] },
  { day: 5, cards: [{ id: "d5-1", label: "보고서", type: "deadline" }] },
  { day: 6, cards: [] },
  { day: 7, cards: [] },
  { day: 8, cards: [{ id: "d8-1", label: "PT", type: "start" }] },
  { day: 9, cards: [] },
  { day: 10, cards: [] },
  { day: 11, cards: [] },
  { day: 12, cards: [] },
  { day: 13, cards: [] },
  { day: 14, cards: [{ id: "d14-1", label: "추가", type: "more" }] },
  { day: 15, cards: [] },
  { day: 16, cards: [] },
  { day: 17, cards: [] },
  { day: 18, cards: [] },
  { day: 19, cards: [] },
  { day: 20, cards: [] },
  { day: 21, cards: [] },
  { day: 22, cards: [] },
  { day: 23, cards: [{ id: "d23-1", label: "워크샵", type: "start" }] },
  { day: 24, cards: [] },
  { day: 25, cards: [] },
  { day: 26, cards: [] },
  { day: 27, cards: [] },
  { day: 28, cards: [{ id: "d28-1", label: "+1", type: "more" }] },
  { day: 29, cards: [] },
  { day: 30, cards: [] },
  { day: 31, cards: [] },
];

const selectedDay = {
  date: "3월 3일 화요일",
  cards: [
    {
      id: "card-1",
      title: "오후 2시 팀 회의",
      type: "start" as const,
      time: "14:00",
      notifications: ["1시간 전", "15분 전"],
      repeat: ["월", "수"],
    },
    {
      id: "card-2",
      title: "보고서 제출",
      type: "deadline" as const,
      time: "기한 18:00",
      notifications: ["하루 전"],
      overdue: true,
    },
  ],
};

export default function CalendarPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">캘린더</h1>
            <p className="text-sm text-[#6F6F6F]">일정 Todo만 따뜻한 카드 형태로 정리됩니다.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[#6F6F6F]">
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">시작형만</button>
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">마감형만</button>
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">이번 주</button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="rounded-3xl border border-[#E5DED5] bg-white p-4 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-[#2F2A26]">2025년 3월</p>
                <p className="text-xs text-[#6F6F6F]">반복 일정은 점선 테두리로 표시됩니다.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6F6F6F]">
                <button className="rounded-full border border-[#E5DED5] px-3 py-1">◀</button>
                <button className="rounded-full border border-[#E5DED5] px-3 py-1">▶</button>
              </div>
            </header>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {["월", "화", "수", "목", "금", "토", "일"].map((label) => (
                <div key={label} className="px-2 py-1 text-center text-[#B0B0B0]">
                  {label}
                </div>
              ))}
              {monthDays.map((day) => (
                <div
                  key={day.day}
                  className="min-h-[92px] rounded-xl border border-[#EFE7DE] bg-[#FFFBF7] p-2 text-[#4F4A45]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2F2A26]">{day.day}</span>
                    {day.cards.length > 3 && (
                      <span className="rounded-full bg-[#F4ECE4] px-2 py-0.5 text-[10px] text-[#6F6F6F]">
                        +{day.cards.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {day.cards.slice(0, 3).map((card) => (
                      <div
                        key={card.id}
                        className={
                          card.type === "start"
                            ? "rounded-md border border-[#F5A623] bg-[#FFF4E2] px-2 py-1 text-[10px]"
                            : card.type === "deadline"
                              ? "rounded-md border border-[#9B51E0] bg-[#F3E9FF] px-2 py-1 text-[10px]"
                              : "rounded-md border border-dashed border-[#D5C9BD] bg-[#FBF3EA] px-2 py-1 text-[10px]"
                        }
                      >
                        {card.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#E5DED5] bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2F2A26]">{selectedDay.date}</p>
                  <p className="text-xs text-[#6F6F6F]">Todo 리스트와 연동된 일정 카드</p>
                </div>
                <button className="text-xs text-[#6F6F6F] underline-offset-4 hover:underline">Todo 보기</button>
              </header>
              <div className="mt-4 space-y-3">
                {selectedDay.cards.map((card) => (
                  <article
                    key={card.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm ${card.type === "start" ? "border-[#F5A623]" : "border-[#9B51E0]"}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2F2A26]">{card.type === "start" ? card.time : card.time}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${card.type === "start" ? "bg-[#F5A623]/10 text-[#D07F14]" : "bg-[#9B51E0]/10 text-[#7140B3]"}`}
                      >
                        {card.type === "start" ? "시작형" : "마감형"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#2F2A26]">{card.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#6F6F6F]">
                      {card.notifications.map((alarm) => (
                        <span key={alarm} className="rounded-full bg-[#F4ECE4] px-3 py-1">
                          알림 {alarm}
                        </span>
                      ))}
                      {card.repeat && card.repeat.length > 0 && (
                        <span className="rounded-full border border-[#E5DED5] px-3 py-1">
                          반복 {card.repeat.join(" · ")}
                        </span>
                      )}
                      {card.overdue && (
                        <span className="rounded-full bg-[#FFE1E7] px-3 py-1 text-[#D54269]">기한 초과</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5DED5] bg-white p-6 shadow-sm text-sm text-[#4F4A45]">
              <h3 className="text-sm font-semibold text-[#2F2A26]">반복 일정 관리</h3>
              <p className="mt-2 text-xs text-[#6F6F6F]">
                점선 카드 클릭 시 반복 패턴을 조정하고 전체 시리즈에 적용 여부를 선택하세요.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
