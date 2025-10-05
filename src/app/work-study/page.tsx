const activeSession = {
  title: "영어 단어 암기",
  goal: "시간 30분",
  due: "오늘까지",
  repeat: ["월", "수", "금"],
  memo: "Unit 12까지 집중",
};

const noteHistory = [
  { id: "note-1", title: "어제 정리", updatedAt: "어제 21:10" },
  { id: "note-2", title: "지난주 핵심", updatedAt: "5일 전" },
];

const sessionTimeline = [
  { id: "log-1", time: "10:00", label: "세션 시작" },
  { id: "log-2", time: "10:15", label: "메모 추가 – 예문 정리" },
  { id: "log-3", time: "10:45", label: "일시 정지" },
];

export default function WorkStudyPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#E5DED5] bg-[#EDF3FA] p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">집중 모드</h1>
            <p className="text-sm text-[#4A90E2]">Todo 클릭으로 자동 진입한 업무·학습 공간</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button className="rounded-full border border-white/60 bg-white px-4 py-2 font-medium text-[#4A90E2] shadow-sm transition hover:border-[#4A90E2]/30">
              일시 정지
            </button>
            <button className="rounded-full bg-[#4A90E2] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#3C7CC5]">
              세션 종료
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#C6D9F1] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-[#6F6F6F]">활성 Todo</p>
              <p className="mt-2 text-lg font-semibold text-[#2F2A26]">{activeSession.title}</p>
              <div className="mt-3 space-y-2 text-sm text-[#4F4A45]">
                <div className="flex gap-2">
                  <span className="min-w-[64px] text-[#6F6F6F]">목표</span>
                  <span>{activeSession.goal}</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-[64px] text-[#6F6F6F]">마감</span>
                  <span>{activeSession.due}</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-[64px] text-[#6F6F6F]">반복</span>
                  <span>{activeSession.repeat.join(" · ")}</span>
                </div>
                <div className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-xs text-[#4A90E2]">
                  메모: {activeSession.memo}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#C6D9F1] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">세션 타임라인</p>
              <ul className="mt-3 space-y-2 text-xs text-[#4F4A45]">
                {sessionTimeline.map((log) => (
                  <li key={log.id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#4A90E2]" aria-hidden />
                    <span className="font-semibold text-[#2F2A26]">{log.time}</span>
                    <span>{log.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#C6D9F1] bg-white/90 p-6 text-center shadow-lg">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[18px] border-[#D7E6F7]" />
              <div className="absolute inset-2 rounded-full border-[18px] border-[#4A90E2] opacity-80" />
              <div className="relative flex flex-col items-center justify-center rounded-full bg-white px-8 py-10 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[#6F6F6F]">남은 시간</p>
                <p className="mt-2 text-3xl font-semibold text-[#2F2A26]">24:15</p>
                <p className="mt-1 text-xs text-[#6F6F6F]">목표 30분</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[#4F4A45]">
              <button className="rounded-full border border-[#4A90E2]/30 bg-[#F6FAFF] px-5 py-2 font-medium text-[#4A90E2] hover:bg-[#E9F3FF]">
                +5분 연장
              </button>
              <button className="rounded-full border border-[#E5DED5] px-5 py-2 font-medium text-[#4F4A45] hover:bg-[#F4ECE4]">
                메모 추가
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#C6D9F1] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#2F2A26]">노트</h2>
                <button className="text-xs text-[#4A90E2] underline-offset-4 hover:underline">새 노트</button>
              </div>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-dashed border-[#C6D9F1] bg-[#F6FAFF] px-3 py-4 text-xs text-[#4F4A45]">
                  오늘 노트를 자유롭게 작성하세요. 자동 저장됩니다.
                </div>
                <div className="space-y-2">
                  {noteHistory.map((note) => (
                    <button
                      key={note.id}
                      className="flex w-full flex-col items-start rounded-xl border border-[#E5DED5] bg-white px-3 py-2 text-left text-xs text-[#4F4A45] transition hover:border-[#4A90E2]/40"
                    >
                      <span className="font-semibold text-[#2F2A26]">{note.title}</span>
                      <span className="mt-1 text-[#6F6F6F]">{note.updatedAt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#C6D9F1] bg-white p-4 shadow-sm text-sm text-[#4F4A45]">
              <p className="text-[#6F6F6F]">Tip</p>
              <p className="mt-1 leading-relaxed">
                오늘 학습이 끝나면 Todo가 자동으로 완료되고 기록 섹션에 집중 시간이 저장됩니다.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#2F2A26]">자료 & 연동</h2>
            <p className="text-xs text-[#6F6F6F]">집중 모드와 함께 사용할 보조 기능</p>
          </div>
          <button className="rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] hover:bg-[#F4ECE4]">
            자료 추가
          </button>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <h3 className="text-sm font-semibold text-[#2F2A26]">참고 링크</h3>
            <p className="mt-2 text-xs text-[#6F6F6F]">단어장 PDF, 예문 시트 등 학습 자료 연결</p>
          </article>
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <h3 className="text-sm font-semibold text-[#2F2A26]">집중 모드 설정</h3>
            <p className="mt-2 text-xs text-[#6F6F6F]">알림음, 배경음악, 타이머 자동 종료 조건 설정</p>
          </article>
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <h3 className="text-sm font-semibold text-[#2F2A26]">학습 기록</h3>
            <p className="mt-2 text-xs text-[#6F6F6F]">주간 집중 시간 그래프와 노트 열람</p>
          </article>
        </div>
      </section>
    </div>
  );
}
