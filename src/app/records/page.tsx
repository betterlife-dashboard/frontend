const weeklySummary = [
  { id: "summary-1", label: "완료한 Todo", value: "12건", detail: "업무·학습 6 · 운동 3 · 일정 3" },
  { id: "summary-2", label: "집중 시간", value: "4시간 20분", detail: "목표 대비 86%" },
  { id: "summary-3", label: "운동 세션", value: "3회", detail: "평균 42분" },
];

const timeline = [
  {
    id: "log-1",
    date: "3월 2일",
    items: [
      { type: "업무·학습", title: "영어 단어 암기", detail: "30분 집중 + 노트 1", tone: "#4A90E2" },
      { type: "운동", title: "상체 루틴", detail: "45분 · 루틴 Upper Body", tone: "#E94E77" },
    ],
  },
  {
    id: "log-2",
    date: "3월 1일",
    items: [
      { type: "일정", title: "보고서 제출", detail: "기한 18:00 내 완료", tone: "#9B51E0" },
    ],
  },
];

export default function RecordsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">기록</h1>
            <p className="text-sm text-[#6F6F6F]">완료된 Todo와 집중/운동 지표를 한눈에 확인하세요.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[#6F6F6F]">
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">주간</button>
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">월간</button>
            <button className="rounded-full border border-[#E5DED5] px-4 py-2 hover:bg-[#F4ECE4]">CSV 내보내기</button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {weeklySummary.map((card) => (
            <article key={card.id} className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-[#9B8F86]">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-[#2F2A26]">{card.value}</p>
              <p className="mt-1 text-sm text-[#6F6F6F]">{card.detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#2F2A26]">주간 집중 그래프</h2>
              <span className="rounded-full border border-[#E5DED5] px-3 py-1 text-xs text-[#6F6F6F]">
                데이터 샘플
              </span>
            </header>
            <div className="mt-4 grid grid-cols-7 gap-3 text-xs text-[#6F6F6F]">
              {["월", "화", "수", "목", "금", "토", "일"].map((day, index) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className="flex h-32 w-10 items-end justify-center rounded-full bg-[#F4ECE4]">
                    <div
                      className="w-10 rounded-full bg-[#4A90E2]"
                      style={{ height: `${30 + index * 8}px`, opacity: 0.85 }}
                    />
                  </div>
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#2F2A26]">운동 빈도 그래프</h2>
              <span className="rounded-full border border-[#E5DED5] px-3 py-1 text-xs text-[#6F6F6F]">
                주간 목표 4회
              </span>
            </header>
            <div className="mt-4 flex items-end gap-3">
              {[2, 3, 1, 4].map((value, index) => (
                <div key={index} className="flex h-28 w-full items-end justify-center rounded-full bg-[#FFECEE]">
                  <div
                    className="w-full max-w-[36px] rounded-full bg-[#E94E77]"
                    style={{ height: `${value * 18}px`, opacity: 0.85 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2F2A26]">타임라인</h2>
          <button className="rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] hover:bg-[#F4ECE4]">
            필터 설정
          </button>
        </header>
        <div className="space-y-4">
          {timeline.map((day) => (
            <article key={day.id} className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#2F2A26]">{day.date}</h3>
              <div className="mt-3 space-y-2">
                {day.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border border-[#E5DED5] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2F2A26]">{item.title}</p>
                      <p className="text-xs text-[#6F6F6F]">{item.detail}</p>
                    </div>
                    <span
                      className="h-8 w-1.5 rounded-full"
                      style={{ backgroundColor: item.tone }}
                    />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
