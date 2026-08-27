"use client";

import { useState, useMemo } from "react";
import { SCRIPT_URL } from "@/lib/config";

/* ── 체크 항목 정의 ── */
const STEP1_CHECKS = [
  { id: "s1_1", label: "claude.ai 접속 후 계정 생성(또는 로그인) 완료" },
  { id: "s1_2", label: "요금제 확인 — Max 플랜 구독 완료" },
];
const STEP2_CHECKS = [
  { id: "s2_1", label: "다운로드 페이지에서 Mac 버전 다운로드" },
  { id: "s2_2", label: "파일 열고 Claude 아이콘을 응용 프로그램 폴더로 드래그" },
  { id: "s2_3", label: "앱 실행 후 계정 로그인" },
  { id: "s2_4", label: "앱 안에서 Claude Code 메뉴 확인" },
  { id: "s2_5", label: "설치 안내창이 뜨면 \"설치\" 버튼 승인" },
];
const STEP3_CHECKS = [
  { id: "s3_1", label: "다운로드 페이지에서 Windows 버전 클로드 앱 설치" },
  { id: "s3_2", label: "Git for Windows 설치 (모든 선택지 기본값 Next)" },
  { id: "s3_3", label: "클로드 앱 완전히 종료 후 재실행" },
  { id: "s3_4", label: "Claude Code 메뉴에서 \"Git 설치\" 안내가 사라진 것 확인" },
  { id: "s3_5", label: "설치 안내창이 뜨면 \"설치\" 버튼 승인" },
];
const STEP4_CHECKS = [
  { id: "s4_1", label: "github.com에서 가입 완료 (구글 계정 로그인 권장)" },
];
const STEP5_CHECKS = [
  { id: "s5_1", label: "vercel.com에서 \"Continue with GitHub\"로 가입 완료" },
];

/* 체크박스 컴포넌트 */
function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] transition ${
        checked
          ? "border-pop bg-pop/30 text-black font-bold"
          : "border-pop/40 bg-pop/10 text-black hover:border-pop/70 hover:bg-pop/15"
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 transition ${
          checked ? "border-pop bg-pop text-black" : "border-pop/50 bg-pop/20"
        }`}
      >
        {checked && <span className="text-[12px] leading-none">✓</span>}
      </span>
      <span>{label}</span>
    </button>
  );
}

/* FAQ 아코디언 */
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left bg-neutral-50 hover:bg-neutral-100 transition">
        <span className="font-bold text-[14.5px] text-neutral-900">{q}</span>
        <span className="text-neutral-400 text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 py-3 text-[14px] text-neutral-700 leading-relaxed border-t border-neutral-200">{a}</div>}
    </div>
  );
}

export default function GuidePage() {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [os, setOs] = useState<"mac" | "win" | null>(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: string) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  // OS별 체크 항목 계산
  const allChecks = useMemo(() => {
    const base = [...STEP1_CHECKS, ...STEP4_CHECKS, ...STEP5_CHECKS];
    if (os === "mac") return [...base, ...STEP2_CHECKS];
    if (os === "win") return [...base, ...STEP3_CHECKS];
    return base;
  }, [os]);

  const doneCount = allChecks.filter((c) => checks[c.id]).length;
  const totalCount = allChecks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const allDone = doneCount === totalCount && os !== null;

  // 제출
  const handleSubmit = async () => {
    if (!name.trim()) { setError("성함을 입력해 주세요."); return; }
    if (!allDone) { setError("모든 체크 항목을 완료해 주세요."); return; }
    setError("");

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        성함: name.trim(),
        OS: os === "mac" ? "Mac" : "Windows",
        ...Object.fromEntries(allChecks.map((c) => [c.label, checks[c.id] ? "Y" : "N"])),
      };
      if (SCRIPT_URL) {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  // ── 제출 완료 ──
  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-4 text-2xl font-extrabold text-pop">준비 완료되었습니다!</h1>
        <p className="mt-3 text-[15px] text-neutral-300 leading-relaxed">
          사전 준비를 완료해주셔서 감사합니다.<br />
          교육 당일 뵙겠습니다!
        </p>
        <p className="mt-2 text-[13.5px] text-neutral-500">
          모든 설치가 완료된 상태입니다. 교육 당일에 바로 실습을 시작할 수 있어요.
        </p>
      </main>
    );
  }

  return (
    <>
      {/* 상단 진행률 바 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1.5 w-full bg-white/15">
          <div className="h-full bg-pop transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-end px-4 py-1">
          <span className="text-[11px] font-semibold tracking-wide text-neutral-400 tabular-nums">
            {doneCount}/{totalCount} 완료 ({progress}%)
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-12 sm:px-6">
        {/* 헤더 */}
        <header className="mb-10">
          <div className="text-5xl">👁️</div>
          <h1 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-4xl">
            고객의눈<br />
            <span className="text-pop">Claude Code 설치 가이드</span>
          </h1>
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-pop/50 bg-pop/10 px-4 py-2.5">
              <span className="text-lg">⏰</span>
              <p className="text-[14.5px] font-bold text-pop">9/2(화) 오후 7시(19:00)까지 모든 설치 완료</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="text-lg">⏱️</span>
              <p className="text-[14px] text-neutral-300">소요 시간: 약 <strong>20분</strong> · Mac/Windows 모두 가능 · 코딩 지식 불필요</p>
            </div>
          </div>
        </header>

        {/* ── 꿀팁 ── */}
        <section className="mb-10 rounded-2xl border-2 border-pop bg-pop/10 p-5">
          <h2 className="text-lg font-extrabold text-pop mb-3">💡 가장 중요한 꿀팁</h2>
          <p className="text-[15px] text-neutral-700 leading-relaxed mb-3">
            막히면? <strong>화면을 캡처해서 클로드에 붙여넣기!</strong>
          </p>
          <div className="space-y-1 text-[13.5px] text-neutral-600 mb-4">
            <p>🍎 Mac: <strong>Shift + Command + 4</strong></p>
            <p>🪟 Windows: <strong>Windows키 + Shift + S</strong></p>
          </div>
          <div className="rounded-xl bg-neutral-100 px-4 py-3 text-[13.5px] leading-relaxed text-neutral-700">
            <p className="font-semibold">&ldquo;내가 클로드 코드 데스크톱 앱을 처음 받았어. 나는 [윈도우/맥] 사용자인데 이런 화면이 지금 뜨고 있거든? 이게 무엇인지 알려주고, 해결하려면 어떻게 해야 되는지 스텝 바이 스텝으로 알려줘.&rdquo;</p>
          </div>
          <div className="mt-3 rounded-xl bg-neutral-100 px-4 py-3 text-[13.5px] leading-relaxed text-neutral-700">
            <p className="font-semibold">&ldquo;나는 Git이 뭐고 로컬 세션에서 뭐가 필요하고 이런 거 다 모르겠거든. 그래서 네가 최대한 모든 걸 다 해결해 달라는 의미야. 만약 내가 필수적으로 해야만 하는 일이 있다면, 그것만 내가 알기 쉽게 설명해 줘.&rdquo;</p>
          </div>
        </section>

        <div className="space-y-8">
          {/* ── STEP 1: 클로드 계정 ── */}
          <section className="rounded-2xl border border-white/10 bg-white p-6">
            <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-neutral-400">STEP 1</div>
            <h2 className="text-xl font-extrabold text-neutral-900 mb-1">🔑 클로드 계정과 요금제 준비하기</h2>
            <p className="text-[13px] text-neutral-500 mb-5">공통 · 약 5분</p>

            <div className="space-y-3 text-[15px] text-neutral-700 mb-5">
              <p><a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">claude.ai</a>에 접속해서 계정을 만들고(또는 로그인) <strong>Max 플랜</strong>으로 구독하세요.</p>
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
                <p className="font-bold">⚠️ Max 플랜 필수!</p>
                <p className="mt-1">클로드 코드는 Max 플랜에서만 원활하게 사용 가능합니다. Pro 이하에서는 사용량 한도에 걸려 작업이 중단될 수 있어요.</p>
                <p className="mt-1 text-[13px] text-amber-700">💡 이번 달만 Max로 올리고 다음 달에 낮추는 분들도 많습니다.</p>
              </div>
            </div>

            <div className="space-y-2">
              {STEP1_CHECKS.map((c) => (
                <Check key={c.id} checked={!!checks[c.id]} onChange={() => toggle(c.id)} label={c.label} />
              ))}
            </div>
          </section>

          {/* ── OS 선택 ── */}
          <section className="rounded-2xl border border-white/10 bg-white p-6">
            <h2 className="text-xl font-extrabold text-neutral-900 mb-4">💻 사용하시는 컴퓨터를 선택하세요</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setOs("mac")}
                className={`flex-1 rounded-xl border-2 px-4 py-4 text-center font-bold transition ${
                  os === "mac" ? "border-pop bg-pop/20 text-neutral-900" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-pop/50"
                }`}
              >
                🍎 Mac
              </button>
              <button
                onClick={() => setOs("win")}
                className={`flex-1 rounded-xl border-2 px-4 py-4 text-center font-bold transition ${
                  os === "win" ? "border-pop bg-pop/20 text-neutral-900" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-pop/50"
                }`}
              >
                🪟 Windows
              </button>
            </div>
          </section>

          {/* ── STEP 2: Mac 설치 ── */}
          {os === "mac" && (
            <section className="rounded-2xl border border-white/10 bg-white p-6">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-neutral-400">STEP 2</div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-1">🍎 Mac에 클로드 앱 설치하기</h2>
              <p className="text-[13px] text-neutral-500 mb-5">약 10분</p>

              <div className="space-y-3 text-[15px] text-neutral-700 mb-5">
                <p><a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">👉 클로드 앱 다운로드</a></p>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13.5px]">
                  <p className="font-bold text-neutral-900 mb-2">참고 사항</p>
                  <ul className="ml-5 list-disc space-y-1 text-neutral-600">
                    <li>Git이 없으면 <strong>Xcode Command Line Tools</strong> 설치 안내가 자동으로 뜹니다 — 승인만 누르면 돼요</li>
                    <li>설치 시간: <strong>5~15분</strong> (창을 닫지 마세요)</li>
                    <li>설치 중 Mac 로그인 비밀번호를 물어볼 수 있어요 — 정상입니다. <strong>글자가 안 보여도 입력되고 있으니</strong> 그대로 치고 Enter</li>
                  </ul>
                  <p className="mt-2 text-neutral-600">공식 페이지: <a href="https://git-scm.com/install/mac" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">git-scm.com/install/mac</a></p>
                </div>
              </div>

              <div className="space-y-2">
                {STEP2_CHECKS.map((c) => (
                  <Check key={c.id} checked={!!checks[c.id]} onChange={() => toggle(c.id)} label={c.label} />
                ))}
              </div>
            </section>
          )}

          {/* ── STEP 3: Windows 설치 ── */}
          {os === "win" && (
            <section className="rounded-2xl border border-white/10 bg-white p-6">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-neutral-400">STEP 2</div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-1">🪟 Windows에 클로드 앱 설치하기</h2>
              <p className="text-[13px] text-neutral-500 mb-5">약 15분</p>

              <div className="space-y-3 text-[15px] text-neutral-700 mb-5">
                <div className="rounded-lg border-2 border-red-400 bg-red-50 px-4 py-2.5 text-[14px] font-semibold text-red-700">
                  ⚠️ Windows는 Git for Windows가 없으면 클로드 코드가 실행되지 않습니다!
                </div>
                <p><a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">👉 클로드 앱 다운로드</a></p>

                {/* Git 설치 상세 가이드 */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-bold text-neutral-900 mb-3">Git for Windows 설치 방법</p>
                  <div className="space-y-3 text-[13.5px] text-neutral-700">
                    <div>
                      <p className="font-semibold">① 설치 파일 받기</p>
                      <p className="mt-1"><a href="https://git-scm.com/install/windows" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">👉 https://git-scm.com/install/windows</a></p>
                      <p className="mt-1">페이지에서 <strong>Git for Windows/x64 Setup</strong>을 클릭하면 다운로드가 시작됩니다.</p>
                      <p className="mt-1 text-[12.5px] text-neutral-500">삼성 갤럭시북·서피스 등 일부 최신 노트북은 x64가 아니라 ARM64입니다. x64 설치 파일이 실행되지 않는다면 같은 페이지의 <strong>Git for Windows/ARM64 Setup</strong>을 받으세요.</p>
                    </div>
                    <div>
                      <p className="font-semibold">② 설치하기</p>
                      <ul className="mt-1 ml-5 list-disc space-y-1">
                        <li>다운로드된 파일(Git-...-64-bit.exe)을 더블클릭합니다.</li>
                        <li>&ldquo;이 앱이 디바이스를 변경할 수 있도록 허용하시겠어요?&rdquo; → <strong>예</strong></li>
                        <li>설치 화면이 여러 번 나옵니다. <strong>전부 기본값 그대로 두고 Next</strong>를 누르세요.</li>
                        <li>마지막에 <strong>Install</strong> → 설치가 끝나면 <strong>Finish</strong></li>
                      </ul>
                      <p className="mt-1 text-[12.5px] text-neutral-500">화면이 많아서 당황스러우실 수 있는데, 하나도 건드리지 않고 Next만 눌러도 문제없습니다.</p>
                    </div>
                    <div>
                      <p className="font-semibold">③ 설치됐는지 확인</p>
                      <ul className="mt-1 ml-5 list-disc space-y-1">
                        <li>키보드 왼쪽 아래 <strong>윈도우 키</strong>를 누릅니다.</li>
                        <li><strong>cmd</strong> 라고 입력하고 Enter → 검은 창(명령 프롬프트)이 열립니다.</li>
                        <li>아래를 입력하고 Enter를 누릅니다.</li>
                      </ul>
                      <div className="mt-1 rounded bg-neutral-100 px-3 py-2 font-mono text-[13px]">git --version</div>
                      <p className="mt-1 text-[12.5px] text-neutral-500"><code>git version 2.55.0.windows.1</code> 처럼 버전 번호가 나오면 설치 완료입니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {STEP3_CHECKS.map((c) => (
                  <Check key={c.id} checked={!!checks[c.id]} onChange={() => toggle(c.id)} label={c.label} />
                ))}
              </div>
            </section>
          )}

          {/* ── STEP 4: GitHub ── */}
          {os && (
            <section className="rounded-2xl border border-white/10 bg-white p-6">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-neutral-400">STEP 3</div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-1">🐙 GitHub 가입하기</h2>
              <p className="text-[13px] text-neutral-500 mb-5">공통 · 약 5분</p>

              <div className="space-y-3 text-[15px] text-neutral-700 mb-5">
                <p>클로드 코드로 만든 모든 결과물은 <strong>GitHub</strong>에 저장됩니다. 무료이고, 구글 계정으로 간편 가입 가능해요.</p>
                <p><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">👉 GitHub 가입하기</a></p>
              </div>

              <div className="space-y-2">
                {STEP4_CHECKS.map((c) => (
                  <Check key={c.id} checked={!!checks[c.id]} onChange={() => toggle(c.id)} label={c.label} />
                ))}
              </div>
            </section>
          )}

          {/* ── STEP 5: Vercel ── */}
          {os && (
            <section className="rounded-2xl border border-white/10 bg-white p-6">
              <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-neutral-400">STEP 4</div>
              <h2 className="text-xl font-extrabold text-neutral-900 mb-1">▲ Vercel 가입하기</h2>
              <p className="text-[13px] text-neutral-500 mb-5">공통 · 약 2분</p>

              <div className="space-y-3 text-[15px] text-neutral-700 mb-5">
                <p>만든 사이트를 인터넷에 공개하려면 <strong>Vercel</strong>이 필요합니다. GitHub 계정으로 바로 가입할 수 있어요.</p>
                <p><a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">👉 Vercel 가입하기</a></p>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[13.5px] text-neutral-600">
                  <p><strong>Continue with GitHub</strong> 버튼 클릭 → GitHub 자동 로그인 → 플랜 선택: <strong>Hobby (무료)</strong></p>
                </div>
              </div>

              <div className="space-y-2">
                {STEP5_CHECKS.map((c) => (
                  <Check key={c.id} checked={!!checks[c.id]} onChange={() => toggle(c.id)} label={c.label} />
                ))}
              </div>
            </section>
          )}

          {/* ── 제출 ── */}
          {os && (
            <section className="rounded-2xl border-2 border-pop bg-pop/10 p-6">
              <h2 className="text-xl font-extrabold text-pop mb-4">✅ 준비 완료 제출</h2>
              <div className="mb-4">
                <label className="mb-1.5 block text-[14px] font-bold text-neutral-900">
                  성함 <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예) 홍길동"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[14px] text-neutral-900 outline-none focus:border-pop focus:ring-2 focus:ring-pop/60"
                />
              </div>
              <div className="mb-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center">
                <p className={`text-[15px] font-bold ${allDone ? "text-pop" : "text-neutral-500"}`}>
                  {allDone ? "🎉 모든 항목을 완료했습니다! 아래 버튼을 눌러주세요." : `${doneCount}/${totalCount} 완료`}
                </p>
              </div>
              {error && <p className="mb-3 text-center text-[14px] font-semibold text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={!allDone || !name.trim()}
                className={`w-full rounded-xl px-6 py-4 text-[16px] font-extrabold transition ${
                  allDone && name.trim()
                    ? "bg-pop text-black hover:opacity-90 active:scale-[0.98]"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                준비 완료 제출하기
              </button>
            </section>
          )}

          {/* ── FAQ ── */}
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-neutral-200 mb-2">❓ 자주 묻는 질문</h2>
            <Faq
              q="\"Git 설치\" 창이 떴어요. 잘못한 건가요?"
              a="정상입니다! Windows에서 클로드 코드 첫 실행 시 대부분 표시돼요. \"Git 다운로드\" 클릭 후 설치하고 앱을 재실행하면 됩니다."
            />
            <Faq
              q="설치했는데 Claude Code 화면이 안 열려요"
              a="앱을 완전히 종료 후 재실행하면 대부분 해결됩니다. Windows는 Git for Windows가 설치되어 있는지 확인하세요."
            />
            <Faq
              q="설치 중에 비밀번호를 물어봐요"
              a="Mac에서 Xcode Command Line Tools 설치 시 정상적으로 물어봅니다. 글자가 안 보여도 입력되고 있으니 그대로 치고 Enter를 누르세요."
            />
            <Faq
              q="꼭 Max 플랜이어야 하나요?"
              a="네, 권장합니다. 교육 중 사용량 한도에 도달할 수 있어요. 이번 달만 Max로 올리고 다음 달에 낮추는 분들도 많습니다."
            />
            <Faq
              q="GitHub랑 Vercel은 왜 가입해야 하나요?"
              a="GitHub는 코드 저장소, Vercel은 웹사이트를 인터넷에 공개하는 서비스입니다. 둘 다 무료이고 교육 중 실습에 직접 사용합니다."
            />
          </section>
        </div>
      </main>
    </>
  );
}
