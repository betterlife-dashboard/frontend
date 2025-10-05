const scheduleTodos = [
  {
    id: "schedule-1",
    title: "오후 2시 팀 회의 참석",
    time: "14:00",
    type: "start" as const,
    notifications: ["1시간 전", "15분 전"],
    repeatDays: ["월", "수"],
  },
  {
    id: "schedule-2",
    title: "보고서 제출",
    time: "기한 18:00",
    type: "deadline" as const,
    notifications: ["하루 전"],
    repeatDays: ["금"],
  },
];

const todoGroups = [
  {
    id: "general",
    label: "일반 Todo",
    tone: "#B0B0B0",
    items: [
      {
        id: "general-1",
        title: "정리된 기록 업로드",
        repeatDays: [],
        due: "오늘",
        note: "기록 섹션 업데이트",
      },
    ],
  },
  {
    id: "work",
    label: "업무·학습",
    tone: "#4A90E2",
    items: [
      {
        id: "work-1",
        title: "영어 단어 암기",
        repeatDays: ["월", "수", "금"],
        due: "오늘까지",
        goal: "30분 집중",
      },
      {
        id: "work-2",
        title: "리서치 정리",
        repeatDays: [],
        due: "내일까지",
        goal: "분량 3섹션",
      },
    ],
  },
  {
    id: "workout",
    label: "운동",
    tone: "#E94E77",
    items: [
      {
        id: "workout-1",
        title: "상체 루틴",
        repeatDays: ["화", "목"],
        due: "오늘까지",
        goal: "45분 루틴",
      },
    ],
  },
];

const completedTodos = [
  {
    id: "done-1",
    title: "아침 스트레칭",
    type: "운동",
    completedAt: "오전 8:10",
  },
  {
    id: "done-2",
    title: "메일 확인",
    type: "일반",
    completedAt: "오전 9:30",
  },
];

const quickHighlights = [
  {
    id: "focus",
    title: "집중 타임라인",
    description: "오늘 집중 1시간 20분",
  },
  {
    id: "routine",
    title: "운동 루틴",
    description: "상체 루틴 예정 • 휴식 60초",
  },
  {
    id: "notes",
    title: "노트",
    description: "어제 작성한 3개 노트 계속 불러오기",
  },
];

const upcomingSchedule = [
  {
    id: "upcoming-1",
    title: "회사의 성과 발표",
    type: "시작형",
    time: "내일 10:00",
  },
  {
    id: "upcoming-2",
    title: "프로젝트 마감",
    type: "마감형",
    time: "이번 주 금요일 18:00",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5DED5] bg-white/90 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#3A3A3A]">오늘의 일정 Todo</h2>
              <button className="text-sm text-[#6F6F6F] underline-offset-4 hover:underline">캘린더 열기 →</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {scheduleTodos.map((todo) => (
                <article
                  key={todo.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${todo.type === "start" ? "border-[#F5A623]" : "border-[#9B51E0]"}`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#3A3A3A]">{todo.time}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${todo.type === "start" ? "bg-[#F5A623]/10 text-[#D07F14]" : "bg-[#9B51E0]/10 text-[#7140B3]"}`}
                    >
                      {todo.type === "start" ? "시작형" : "마감형"}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#3A3A3A]">{todo.title}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6F6F6F]">
                    {todo.notifications.map((alarm) => (
                      <span key={alarm} className="rounded-full bg-[#F4ECE4] px-3 py-1">
                        알림 {alarm}
                      </span>
                    ))}
                    {todo.repeatDays.length > 0 && (
                      <span className="rounded-full border border-[#E5DED5] px-3 py-1">
                        반복 {todo.repeatDays.join(", ")}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {todoGroups.map((group) => (
              <section key={group.id} className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: group.tone }} />
                    <div>
                      <h3 className="text-base font-semibold text-[#3A3A3A]">{group.label}</h3>
                      <p className="text-sm text-[#6F6F6F]">오늘의 흐름을 이어갈 준비가 끝났어요.</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-[#E5DED5] px-4 py-1.5 text-xs text-[#6F6F6F] hover:bg-white">
                    필터
                  </button>
                </header>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#E5DED5] bg-white p-4 shadow-sm transition hover:border-[#D3C6BA]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-[#3A3A3A]">{item.title}</h4>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#6F6F6F]">
                            {item.repeatDays.length > 0 && (
                              <span className="rounded-full bg-[#F4ECE4] px-3 py-1">{item.repeatDays.join(" · ")} 반복</span>
                            )}
                            {item.due && (
                              <span className="rounded-full border border-[#E5DED5] px-3 py-1">{item.due}</span>
                            )}
                            {"goal" in item && item.goal && (
                              <span className="rounded-full bg-[#F5F1EB] px-3 py-1">{item.goal}</span>
                            )}
                            {"note" in item && item.note && (
                              <span className="rounded-full bg-[#F5F1EB] px-3 py-1">{item.note}</span>
                            )}
                          </div>
                        </div>
                        <button className="rounded-full bg-[#4A90E2] px-4 py-2 text-xs font-semibold text-white shadow-sm">
                          시작하기
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#B0B0B0]">
                        <span>클릭 시 상세 모드로 이동</span>
                        <button className="text-[#6F6F6F] underline-offset-4 hover:underline">빠른 메모</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="rounded-3xl border border-[#E5DED5] bg-white/60 p-6 shadow-inner">
            <header className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#3A3A3A]">완료된 Todo</h3>
              <button className="text-xs text-[#6F6F6F] underline-offset-4 hover:underline">기록 섹션 열기</button>
            </header>
            <div className="flex flex-wrap gap-3 text-sm text-[#6F6F6F]">
              {completedTodos.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-2 rounded-full border border-[#E5DED5] bg-white px-4 py-2"
                >
                  <span className="text-xs text-[#B0B0B0]">◎</span>
                  <span className="font-medium text-[#3A3A3A]">{item.title}</span>
                  <span className="text-xs text-[#B0B0B0]">{item.completedAt}</span>
                  <span className="text-xs text-[#B0B0B0]">{item.type}</span>
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#3A3A3A]">오늘 기록 요약</h3>
              <button className="text-xs text-[#6F6F6F] underline-offset-4 hover:underline">자세히 보기</button>
            </header>
            <div className="mt-4 space-y-4">
              {quickHighlights.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#E5DED5] bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#3A3A3A]">{item.title}</p>
                  <p className="mt-1 text-xs text-[#6F6F6F]">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#3A3A3A]">다가오는 일정</h3>
              <button className="text-xs text-[#6F6F6F] underline-offset-4 hover:underline">전체 일정</button>
            </header>
            <div className="mt-4 space-y-4">
              {upcomingSchedule.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#E5DED5] bg-white p-4">
                  <p className="text-sm font-semibold text-[#3A3A3A]">{item.title}</p>
                  <p className="mt-1 text-xs text-[#6F6F6F]">{item.type} · {item.time}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#3A3A3A]">빠른 액션</h3>
            <div className="mt-4 grid gap-3">
              <button className="flex items-center justify-between rounded-2xl border border-dashed border-[#D5C9BD] bg-[#FBF3EA] px-4 py-3 text-sm text-[#6F6F6F] transition hover:border-[#C6B9AA]">
                반복 Todo 미리보기
                <span>→</span>
              </button>
              <button className="flex items-center justify-between rounded-2xl border border-dashed border-[#D5C9BD] bg-[#F2E9FF] px-4 py-3 text-sm text-[#6F6F6F] transition hover:border-[#C6B9AA]">
                일정 알림 관리
                <span>→</span>
              </button>
              <button className="flex items-center justify-between rounded-2xl border border-dashed border-[#D5C9BD] bg-[#FFEDEE] px-4 py-3 text-sm text-[#6F6F6F] transition hover:border-[#C6B9AA]">
                기록 내보내기 준비
                <span>→</span>
              </button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
