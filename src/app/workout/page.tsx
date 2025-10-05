const todaysWorkout = {
  title: "상체 루틴",
  due: "오늘까지",
  routine: "Upper Body Power",
  estDuration: "45분 예정",
  notes: "벤치, 로우, 숄더 순서",
};

const savedRoutines = [
  { id: "routine-1", name: "Upper Body Power", last: "3일 전", duration: "42분" },
  { id: "routine-2", name: "런데이", last: "지난주", duration: "38분" },
];

const builderExercises = [
  {
    id: "ex-1",
    name: "벤치 프레스",
    weight: "40kg",
    metric: "8회 × 3세트",
  },
  {
    id: "ex-2",
    name: "바벨 로우",
    weight: "35kg",
    metric: "10회 × 3세트",
  },
  {
    id: "ex-3",
    name: "숄더 프레스",
    weight: "18kg",
    metric: "12회 × 3세트",
  },
];

const activeRoutine = [
  { id: "step-1", name: "벤치 프레스", sets: 3, rest: "60초" },
  { id: "step-2", name: "바벨 로우", sets: 3, rest: "60초" },
  { id: "step-3", name: "플랭크", sets: 2, rest: "45초" },
];

const quickTips = [
  "각 세트 완료 시 자동으로 휴식 타이머가 실행됩니다.",
  "루틴을 완료하면 Todo가 자동으로 기록에 반영됩니다.",
];

export default function WorkoutPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#E5DED5] bg-[#FFECEE] p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">운동 모드</h1>
            <p className="text-sm text-[#E94E77]">Todo 클릭으로 자동 진입한 운동 흐름 공간</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="rounded-full border border-white/60 bg-white px-4 py-2 font-medium text-[#E94E77] shadow-sm transition hover:border-[#E94E77]/30">
              준비 운동 시작
            </button>
            <button className="rounded-full bg-[#E94E77] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#d54269]">
              오늘 루틴 시작
            </button>
          </div>
        </header>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F8C8D3] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-[#E94E77]">오늘의 Todo</p>
                  <h2 className="text-lg font-semibold text-[#2F2A26]">{todaysWorkout.title}</h2>
                  <p className="text-sm text-[#6F6F6F]">{todaysWorkout.notes}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#6F6F6F]">
                  <span className="rounded-full border border-[#F8C8D3] px-3 py-1">{todaysWorkout.due}</span>
                  <span className="rounded-full border border-[#F8C8D3] px-3 py-1">{todaysWorkout.estDuration}</span>
                  <span className="rounded-full border border-[#F8C8D3] px-3 py-1">루틴 {todaysWorkout.routine}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#F8C8D3] bg-white/90 p-6 shadow-sm">
              <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#2F2A26]">루틴 빌더</h3>
                  <p className="text-xs text-[#6F6F6F]">핵심 운동을 순서대로 정리하세요.</p>
                </div>
                <button className="rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] hover:bg-[#F4ECE4]">
                  새 루틴 저장
                </button>
              </header>
              <div className="mt-4 space-y-3">
                {builderExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#F8C8D3] bg-white px-4 py-3 text-sm text-[#4F4A45] shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2F2A26]">{exercise.name}</p>
                      <p className="text-xs text-[#6F6F6F]">{exercise.metric}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-[#F8C8D3] px-3 py-1">중량 {exercise.weight}</span>
                      <button className="rounded-full border border-[#E5DED5] px-3 py-1 hover:bg-[#FFF5F6]">편집</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6F6F6F]">
                <span className="rounded-full border border-dashed border-[#F8C8D3] px-3 py-1">휴식 60초</span>
                <span className="rounded-full border border-dashed border-[#F8C8D3] px-3 py-1">세트 3회 기본</span>
                <button className="rounded-full border border-[#E5DED5] px-3 py-1 hover:bg-[#FFF5F6]">운동 추가</button>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#F8C8D3] bg-white p-6 shadow-md">
              <header className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#2F2A26]">실행 중 루틴</h3>
                <span className="rounded-full bg-[#E94E77] px-3 py-1 text-xs font-semibold text-white">진행 중</span>
              </header>
              <ol className="space-y-3 text-sm text-[#4F4A45]">
                {activeRoutine.map((step, index) => (
                  <li
                    key={step.id}
                    className="flex flex-col gap-2 rounded-2xl border border-[#F8C8D3] bg-[#FFF5F6] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-[#E94E77]">STEP {index + 1}</span>
                      <span className="text-xs text-[#6F6F6F]">휴식 {step.rest}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#2F2A26]">{step.name}</p>
                    <p className="text-xs text-[#6F6F6F]">세트 {step.sets}회</p>
                    <button className="self-end rounded-full bg-white px-3 py-1 text-xs text-[#E94E77] shadow-sm hover:bg-[#FFE1E7]">
                      세트 완료
                    </button>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center justify-between text-xs text-[#6F6F6F]">
                <span>총 예상 45분</span>
                <button className="text-xs text-[#E94E77] underline-offset-4 hover:underline">휴식 타이머 보기</button>
              </div>
            </div>

            <div className="rounded-3xl border border-[#F8C8D3] bg-white p-6 text-sm text-[#4F4A45] shadow-sm">
              <h3 className="text-base font-semibold text-[#2F2A26]">저장된 루틴</h3>
              <div className="mt-4 space-y-2">
                {savedRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    className="flex w-full flex-col items-start rounded-2xl border border-[#E5DED5] bg-white px-4 py-3 text-left transition hover:border-[#E94E77]/40"
                  >
                    <span className="text-sm font-semibold text-[#2F2A26]">{routine.name}</span>
                    <span className="mt-1 text-xs text-[#6F6F6F]">최근 {routine.last} · 평균 {routine.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-[#F8C8D3] bg-[#FFF5F6] p-6 text-sm text-[#4F4A45]">
              <h3 className="text-sm font-semibold text-[#2F2A26]">운동 팁</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#6F6F6F]">
                {quickTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#2F2A26]">운동 기록 미리보기</h2>
            <p className="text-xs text-[#6F6F6F]">루틴 완료 후 자동으로 기록 섹션에 반영됩니다.</p>
          </div>
          <button className="rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] hover:bg-[#F4ECE4]">
            기록 바로가기
          </button>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#E94E77]">최근 루틴</p>
            <p className="mt-2 text-sm font-semibold text-[#2F2A26]">하체 루틴 • 38분</p>
          </article>
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#E94E77]">주간 목표</p>
            <p className="mt-2 text-sm font-semibold text-[#2F2A26]">3/4회 완료</p>
          </article>
          <article className="rounded-2xl border border-[#E5DED5] bg-white p-4 text-sm text-[#4F4A45] shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[#E94E77]">루틴 메모</p>
            <p className="mt-2 text-sm text-[#6F6F6F]">스트레칭 마무리 후 쿨다운 5분</p>
          </article>
        </div>
      </section>
    </div>
  );
}
