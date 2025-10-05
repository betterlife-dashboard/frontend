const notificationChannels = [
  { id: "app", label: "앱 알림", description: "웹앱 내 토스트와 배너로 알려줍니다." },
  { id: "email", label: "이메일", description: "완료 기록과 알림 요약을 이메일로 받습니다." },
  { id: "push", label: "푸시", description: "모바일 푸시 알림(연동 시)" },
];

const sessionInfo = {
  status: "유효",
  expiresIn: "4시간 후",
  devices: ["MacBook Pro", "iPhone 15"],
};

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#E5DED5] bg-white/80 p-6 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#2F2A26]">설정</h1>
            <p className="text-sm text-[#6F6F6F]">계정, 알림, 데이터 관리를 한 곳에서 조정하세요.</p>
          </div>
          <button className="rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] hover:bg-[#F4ECE4]">
            변경 사항 저장
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <section className="space-y-6">
            <article className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#2F2A26]">계정 정보</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm text-[#4F4A45]">
                  이름
                  <input
                    defaultValue="Better Life User"
                    className="mt-1 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]"
                  />
                </label>
                <label className="text-sm text-[#4F4A45]">
                  이메일
                  <input
                    defaultValue="user@example.com"
                    className="mt-1 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]"
                  />
                </label>
                <label className="text-sm text-[#4F4A45]">
                  언어
                  <select className="mt-1 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]">
                    <option>한국어</option>
                    <option>English</option>
                  </select>
                </label>
                <label className="text-sm text-[#4F4A45]">
                  테마
                  <select className="mt-1 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]">
                    <option>따뜻한 라이트</option>
                    <option>고대비</option>
                  </select>
                </label>
              </div>
            </article>

            <article className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#2F2A26]">알림 설정</h2>
              <p className="mt-1 text-xs text-[#6F6F6F]">Todo 유형별 기본 알림을 선택하세요.</p>
              <div className="mt-4 space-y-3">
                {notificationChannels.map((channel) => (
                  <label
                    key={channel.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[#E5DED5] bg-[#FFFBF7] px-4 py-3 text-sm text-[#4F4A45]"
                  >
                    <div>
                      <p className="font-semibold text-[#2F2A26]">{channel.label}</p>
                      <p className="text-xs text-[#6F6F6F]">{channel.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-[#E5DED5] text-[#4A90E2]" />
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-3 text-xs text-[#6F6F6F] md:grid-cols-2">
                <label className="rounded-2xl border border-[#E5DED5] bg-white px-4 py-3">
                  일정 기본 알림
                  <select className="mt-2 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]">
                    <option>1시간 전 + 15분 전</option>
                    <option>하루 전 + 1시간 전</option>
                  </select>
                </label>
                <label className="rounded-2xl border border-[#E5DED5] bg-white px-4 py-3">
                  운동 휴식 알림
                  <select className="mt-2 w-full rounded-xl border border-[#E5DED5] bg-[#FFFBF7] px-3 py-2 text-sm text-[#2F2A26] outline-none focus:border-[#4A90E2]">
                    <option>60초</option>
                    <option>90초</option>
                  </select>
                </label>
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#2F2A26]">세션 관리</h2>
              <div className="mt-3 space-y-2 text-sm text-[#4F4A45]">
                <div className="flex items-center justify-between">
                  <span>상태</span>
                  <span className="rounded-full bg-[#52B788]/20 px-3 py-1 text-xs font-semibold text-[#3C7C62]">
                    {sessionInfo.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#6F6F6F]">
                  <span>만료까지</span>
                  <span>{sessionInfo.expiresIn}</span>
                </div>
                <div className="rounded-2xl border border-[#E5DED5] bg-[#FFFBF7] px-4 py-3 text-xs text-[#6F6F6F]">
                  연결된 기기: {sessionInfo.devices.join(", ")}
                </div>
                <button className="w-full rounded-full border border-[#E5DED5] px-4 py-2 text-xs text-[#4F4A45] transition hover:bg-[#F4ECE4]">
                  모든 기기 로그아웃
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-[#E5DED5] bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-[#2F2A26]">데이터 관리</h2>
              <div className="mt-3 space-y-3 text-xs text-[#6F6F6F]">
                <button className="flex w-full items-center justify-between rounded-2xl border border-[#E5DED5] bg-[#FFFBF7] px-4 py-3 text-left text-sm text-[#4F4A45] transition hover:border-[#4A90E2]/40">
                  기록 내보내기
                  <span>→</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-2xl border border-[#E5DED5] bg-[#FFFBF7] px-4 py-3 text-left text-sm text-[#4F4A45] transition hover:border-[#4A90E2]/40">
                  Todo 템플릿 저장
                  <span>→</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-2xl border border-[#E5DED5] bg-[#FFFBF7] px-4 py-3 text-left text-sm text-[#4F4A45] transition hover:border-[#E94E77]/40">
                  백업 가져오기
                  <span>→</span>
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-dashed border-[#E5DED5] bg-[#FFFBF7] p-5 text-xs text-[#6F6F6F]">
              <p className="font-semibold text-[#2F2A26]">Tip</p>
              <p className="mt-1 leading-relaxed">
                설정 변경은 저장 버튼을 누르지 않아도 초안으로 유지됩니다. 추후 JWT 연동 시 세션 만료 알림이 여기에 표시됩니다.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </div>
  );
}
