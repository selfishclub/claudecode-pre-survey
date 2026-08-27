"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SCRIPT_URL, LINKS } from "@/lib/config";
import {
  type Answers,
  createEmptyAnswers,
  REQUIRED_KEYS,
  AGE_OPTIONS,
  CATEGORY_OPTIONS,
  TIME_COMMIT_OPTIONS,
  OFFLINE_OPTIONS,
  SUBLEADER_OPTIONS,
  ABSENCE_OPTIONS,
  ABSENCE_ALL_OK,
  READINESS_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  DOMAIN_OPTIONS,
  TIME_TABLE,
  SCHEDULE_TABLE,
} from "@/lib/survey";
import {
  ProgressBar,
  SectionLabel,
  SectionCard,
  Box,
  FieldLabel,
  TextInput,
  TextArea,
  RadioGroup,
  CheckboxGroup,
  ConsentCheck,
} from "@/components/ui";

const ETC = "그 외(직접 입력)";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^01[0-9]-?\d{3,4}-?\d{4}$/;

/* OS 선택 탭 — Mac / Windows */
function OsTabSelector() {
  const [os, setOs] = useState<"mac" | "win">("mac");
  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setOs("mac")}
          className={`rounded-lg border px-4 py-2 text-[14px] font-bold transition ${os === "mac" ? "border-pop bg-pop/20" : "border-neutral-200 bg-neutral-50 hover:bg-pop/10"}`}
        >
          🍎 Mac 사용자
        </button>
        <button
          type="button"
          onClick={() => setOs("win")}
          className={`rounded-lg border px-4 py-2 text-[14px] font-bold transition ${os === "win" ? "border-pop bg-pop/20" : "border-neutral-200 bg-neutral-50 hover:bg-pop/10"}`}
        >
          🪟 Windows 사용자
        </button>
      </div>

      {os === "mac" ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
          <p className="font-bold text-neutral-900">🍎 Mac에 클로드 앱 설치하기</p>
          <ol className="ml-5 list-decimal space-y-2 text-[14.5px]">
            <li>
              <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">다운로드 페이지</a>에서 Mac 버전 다운로드
            </li>
            <li>받은 파일을 열고 Claude 아이콘을 <strong>응용 프로그램 폴더</strong>로 드래그</li>
            <li>앱 실행 후 <strong>Max 구독 계정</strong>으로 로그인</li>
            <li>앱 안에서 <strong>Claude Code</strong> 메뉴 확인</li>
            <li>설치 안내창이 뜨면 <strong>&ldquo;설치&rdquo; 버튼 승인</strong></li>
          </ol>
          <div className="rounded-lg border border-neutral-300 bg-white p-3 text-[13.5px] space-y-1.5">
            <p className="font-bold">참고 사항</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>인터넷 속도에 따라 <strong>5~15분</strong> 정도 걸립니다. 창을 닫지 마세요</li>
              <li>중간에 Mac 로그인 비밀번호를 물어볼 수 있어요 — 정상입니다. <strong>화면에 글자가 안 보여도 입력되고 있으니</strong> 그대로 치고 Enter</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
          <p className="font-bold text-neutral-900">🪟 Windows에 클로드 앱 설치하기</p>
          <ol className="ml-5 list-decimal space-y-2 text-[14.5px]">
            <li>
              <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">다운로드 페이지</a>에서 Windows 버전 클로드 앱 설치
            </li>
            <li>클로드 앱 <strong>완전히 종료 후 재실행</strong> (켜둔 상태로는 인식 안 됨!)</li>
            <li><strong>Max 구독 계정</strong>으로 로그인</li>
            <li>설치 안내창이 뜨면 <strong>&ldquo;설치&rdquo; 버튼 승인</strong></li>
          </ol>
          <div className="rounded-lg border border-neutral-300 bg-white p-3 text-[13.5px] space-y-1.5">
            <p className="font-bold">문제 해결</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Claude Code 화면이 안 열리면 → 앱을 완전히 종료하고 다시 실행. <strong>열에 아홉은 이걸로 해결됩니다</strong></li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`scroll-mt-24 ${error ? "field-error" : ""}`}>
      <FieldLabel label={label} hint={hint} required={required} error={error} />
      {children}
    </div>
  );
}

function NotionLink({ href, label }: { href: string; label: string }) {
  if (!href) {
    return (
      <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-muted">
        👉 {label}{" "}
        <span className="text-[12px] font-normal">(링크 준비 중)</span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[14px] font-semibold text-neutral-900 underline decoration-pop decoration-2 underline-offset-4 hover:opacity-70"
    >
      👉 {label}
    </a>
  );
}

/* 온보딩 체크 항목 */
const ONBOARDING_CHECKS = [
  { id: "ob_slack_install", label: "슬랙 데스크탑 + 모바일 모두 설치" },
  { id: "ob_slack_join", label: "워크스페이스에 입장 완료" },
  { id: "ob_slack_name", label: "이름을 닉네임(본명) 형식으로 설정" },
  { id: "ob_slack_hello", label: "#00-공통-인사해요-sns친구해요 채널에 자기소개 남김" },
  { id: "ob_github", label: "깃허브 계정 생성 및 초대 수락" },
  { id: "ob_node", label: "클로드 데스크탑 앱 설치" },
  { id: "ob_claude_install", label: "구독 계정으로 로그인" },
  { id: "ob_claude_login", label: "클로드 코드 실행 확인" },
  { id: "ob_vscode", label: "VS Code 설치 + 확장 2개 설치" },
  { id: "ob_vscode_clone", label: "VS Code에서 Claude Code 확장 설치 완료" },
  { id: "ob_video1", label: "클로드코드로 사이트부터 어드민 깃허브까지 1 시청" },
  { id: "ob_video2", label: "클로드코드로 사이트부터 어드민 깃허브까지 2 시청" },
  { id: "ob_video3", label: "이기적공유회 — 비즈니스 코어 만들기 시청" },
];

/* 온보딩 체크박스 아이템 */
function OnboardingCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] transition ${
        checked
          ? "border-pop bg-pop/30 text-black font-bold"
          : "border-pop/40 bg-pop/10 text-black hover:border-pop/70 hover:bg-pop/15"
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 transition ${
          checked
            ? "border-pop bg-pop text-black"
            : "border-pop/50 bg-pop/20"
        }`}
      >
        {checked && <span className="text-[12px] leading-none">✓</span>}
      </span>
      <span>{label}</span>
    </button>
  );
}

/* 전체 플로우 바 (Step 1 사전 서베이 ↔ Step 2 온보딩) — 탭 전환 가능 */
function FlowBar({
  activeTab,
  onTabChange,
  step1Done,
  surveyProgress,
  step2Done,
  onboardingProgress,
}: {
  activeTab: "survey" | "onboarding";
  onTabChange: (tab: "survey" | "onboarding") => void;
  step1Done: boolean;
  surveyProgress?: number;
  step2Done?: boolean;
  onboardingProgress?: number;
}) {
  const s1 = step1Done ? 50 : Math.round((surveyProgress ?? 0) / 2);
  const s2 = step2Done ? 50 : Math.round((onboardingProgress ?? 0) / 2);
  const totalPct = s1 + s2;
  return (
    <div className="mb-8">
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pop to-emerald-400 transition-all duration-500"
          style={{ width: `${totalPct}%` }}
        />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onTabChange("survey")}
          className={`flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-bold transition cursor-pointer ${
            step1Done
              ? "bg-emerald-500/20 text-emerald-400"
              : activeTab === "survey"
              ? "bg-pop text-black"
              : "bg-white/10 text-neutral-400 hover:bg-white/15"
          }`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-extrabold ${
            step1Done
              ? "bg-emerald-500 text-white"
              : activeTab === "survey"
              ? "bg-black text-pop"
              : "bg-white/20 text-neutral-400"
          }`}>
            {step1Done ? "✓" : "1"}
          </span>
          사전 서베이
        </button>
        <div className={`h-0.5 w-8 ${step1Done ? "bg-emerald-500/40" : "bg-white/20"}`} />
        <button
          type="button"
          onClick={() => onTabChange("onboarding")}
          className={`flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-bold transition cursor-pointer ${
            step2Done
              ? "bg-emerald-500/20 text-emerald-400"
              : activeTab === "onboarding"
              ? "bg-pop text-black"
              : step1Done
              ? "bg-pop/80 text-black hover:bg-pop"
              : "bg-white/10 text-neutral-400 hover:bg-white/15"
          }`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-extrabold ${
            step2Done
              ? "bg-emerald-500 text-white"
              : activeTab === "onboarding"
              ? "bg-black text-pop"
              : "bg-white/20 text-neutral-400"
          }`}>
            {step2Done ? "✓" : "2"}
          </span>
          온보딩
        </button>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Answers>(createEmptyAnswers);
  const [categorySel, setCategorySel] = useState("");
  const [categoryEtc, setCategoryEtc] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"survey" | "onboarding">("survey");
  const [readinessSel, setReadinessSel] = useState("");
  const [readinessEtc, setReadinessEtc] = useState("");
  const [bizSel, setBizSel] = useState("");
  const [bizEtc, setBizEtc] = useState("");
  const [domainSel, setDomainSel] = useState("");
  const [domainEtc, setDomainEtc] = useState("");
  const [obChecks, setObChecks] = useState<Record<string, boolean>>({});
  const obDone = ONBOARDING_CHECKS.filter((c) => obChecks[c.id]).length;
  const obTotal = ONBOARDING_CHECKS.length;
  const obProgress = Math.round((obDone / obTotal) * 100);
  const [obName, setObName] = useState("");
  const [obNickname, setObNickname] = useState("");
  const obAllDone = obDone === obTotal && obName.trim().length > 0 && obNickname.trim().length > 0;
  const [obSubmitted, setObSubmitted] = useState(false);
  const categoryValue = categorySel === ETC ? categoryEtc.trim() : categorySel;
  const readinessValue = readinessSel === ETC ? readinessEtc.trim() : readinessSel;
  const bizValue = bizSel === ETC ? bizEtc.trim() : bizSel;
  const domainValue = domainSel === ETC ? domainEtc.trim() : domainSel;
  useEffect(() => {
    setAnswers((a) => ({ ...a, 카테고리: categoryValue }));
  }, [categoryValue]);
  useEffect(() => {
    setAnswers((a) => ({ ...a, 준비상태: readinessValue }));
  }, [readinessValue]);
  useEffect(() => {
    setAnswers((a) => ({ ...a, 비즈니스상태: bizValue }));
  }, [bizValue]);
  useEffect(() => {
    setAnswers((a) => ({ ...a, 도메인: domainValue }));
  }, [domainValue]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const toggleAbsence = (opt: string) => {
    setAnswers((a) => {
      if (opt === ABSENCE_ALL_OK) {
        return {
          ...a,
          불참일정: a.불참일정.includes(ABSENCE_ALL_OK) ? [] : [ABSENCE_ALL_OK],
        };
      }
      const without = a.불참일정.filter((v) => v !== ABSENCE_ALL_OK);
      return {
        ...a,
        불참일정: without.includes(opt)
          ? without.filter((v) => v !== opt)
          : [...without, opt],
      };
    });
  };

  const filled = (k: keyof Answers): boolean => {
    if (k === "불참일정") return answers.불참일정.length > 0;
    return String(answers[k] ?? "").trim() !== "";
  };

  const errors = useMemo(() => {
    const e = new Set<string>();
    for (const k of REQUIRED_KEYS) if (!filled(k)) e.add(k);
    // 이메일 형식 검증
    if (answers.이메일.trim() && !EMAIL_RE.test(answers.이메일.trim()))
      e.add("이메일");
    // GitHub 이메일 형식 검증
    if (answers.GitHub이메일.trim() && !EMAIL_RE.test(answers.GitHub이메일.trim()))
      e.add("GitHub이메일");
    // 연락처 형식 검증 (전화번호만 허용)
    if (answers.연락처.trim() && !PHONE_RE.test(answers.연락처.trim().replace(/\s/g, "")))
      e.add("연락처");
    // 연락처에 이메일 넣은 경우 차단
    if (answers.연락처.trim() && EMAIL_RE.test(answers.연락처.trim()))
      e.add("연락처");
    // 이메일에 전화번호 넣은 경우 차단
    if (answers.이메일.trim() && PHONE_RE.test(answers.이메일.trim().replace(/[-\s]/g, "")))
      e.add("이메일");
    if (!answers.동의_멤버약속) e.add("동의_멤버약속");
    if (!answers.동의_이용약관) e.add("동의_이용약관");
    if (!answers.동의_콘텐츠활용) e.add("동의_콘텐츠활용");
    return e;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const err = (k: string) => showErrors && errors.has(k);

  const progress = useMemo(() => {
    const total = REQUIRED_KEYS.length + 3;
    let done = REQUIRED_KEYS.filter(filled).length;
    if (answers.동의_멤버약속) done++;
    if (answers.동의_이용약관) done++;
    if (answers.동의_콘텐츠활용) done++;
    return (done / total) * 100;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleSubmit = async () => {
    if (errors.size > 0) {
      setShowErrors(true);
      setTimeout(() => {
        document
          .querySelector(".field-error")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    setSubmitting(true);
    const payload = {
      ...answers,
      동의_멤버약속: answers.동의_멤버약속 ? "Y" : "N",
      동의_이용약관: answers.동의_이용약관 ? "Y" : "N",
      동의_콘텐츠활용: answers.동의_콘텐츠활용 ? "Y" : "N",
    };
    try {
      if (!SCRIPT_URL) {
        console.warn(
          "[고객의눈] SCRIPT_URL이 아직 설정되지 않았습니다. lib/config.ts를 확인하세요.",
        );
      }
      if (SCRIPT_URL) {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitted(true);
    window.scrollTo({ top: 0 });
  };

  // ── 제출 완료 → 온보딩 탭 자동 전환 ──
  if (submitted && activeTab === "survey") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <FlowBar activeTab="survey" onTabChange={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0 }); }} step1Done surveyProgress={100} step2Done={obSubmitted} onboardingProgress={obProgress} />

        <div className="text-center mb-8">
          <div className="text-6xl">👁️</div>
          <h1 className="mt-6 text-3xl font-extrabold">Step 1 완료!</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-neutral-300">
            사전 서베이가 제출되었습니다.
            <br />
            이제 <strong className="text-pop">Step 2: 온보딩</strong>을 진행해 주세요.
          </p>
          <p className="mt-2 text-[14px] font-bold text-red-400">
            ⏰ 온보딩 마감: 9/2(화) 오후 7시(19:00)까지
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("onboarding")}
          className="w-full rounded-2xl bg-pop py-4 text-[17px] font-extrabold text-black transition hover:opacity-90"
        >
          온보딩 시작하기 →
        </button>

        <p className="mt-6 text-center text-[14px] text-neutral-400">
          추가 문의는{" "}
          {LINKS.kakao ? (
            <a
              href={LINKS.kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              셀피쉬클럽 카카오채널
            </a>
          ) : (
            <span className="font-semibold">셀피쉬클럽 카카오채널</span>
          )}
          로 해주세요.
        </p>
      </main>
    );
  }

  // ── 온보딩 탭 ──
  if (activeTab === "onboarding") {
    const IMG = "https://selfishclub.github.io/sponge-intro/img";
    const toggleOb = (id: string) => setObChecks((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
      <>
        {/* 온보딩 진행률 바 */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1.5 w-full bg-white/15">
            <div className="h-full bg-pop transition-all duration-500" style={{ width: `${obProgress}%` }} />
          </div>
          <div className="flex justify-end px-4 py-1">
            <span className="text-[11px] font-semibold tracking-wide text-muted tabular-nums">
              {obDone}/{obTotal} 완료 ({obProgress}%)
            </span>
          </div>
        </div>

        <main className="mx-auto max-w-2xl px-4 pb-32 pt-12 sm:px-6">
          <FlowBar
            activeTab="onboarding"
            onTabChange={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0 }); }}
            step1Done={submitted}
            step2Done={obSubmitted}
            surveyProgress={progress}
            onboardingProgress={obProgress}
          />
          <div className="mb-6 rounded-2xl border-2 border-pop bg-pop/10 px-5 py-5 text-center">
            <p className="text-[15px] font-bold text-pop">
              ✅ Step 1(사전 서베이)을 이미 완료하셨다면 다시 작성하지 않으셔도 됩니다. 바로 온보딩을 진행해 주세요!
            </p>
            <p className="mt-2 text-[13.5px] text-neutral-300">
              아직 제출 전이라면 Step 1을 먼저 완료해 주세요.
            </p>
            <button
              onClick={() => { setActiveTab("survey"); window.scrollTo({ top: 0 }); }}
              className="mt-3 rounded-xl border border-neutral-500 px-5 py-2 text-[13px] font-semibold text-neutral-300 transition hover:bg-white/10"
            >
              Step 1 서베이 작성하러 가기 →
            </button>
          </div>
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[14px] text-neutral-300">
            ⏰ 온보딩 마감: <strong>9/2(화) 오후 7시(19:00)</strong>까지 모든 항목 완료
          </div>

          <header className="mb-10">
            <div className="text-5xl">🏔️</div>
            <h1 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-4xl">
              온보딩
            </h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-neutral-300">
              셋업데이(8/22) 전에, 아래 항목을 <strong className="text-pop">하나씩 직접 따라하고</strong> 완료할 때마다 <strong className="text-pop">체크박스를 눌러</strong> 주세요.
              <br />
              처음이라 불안하신가요? 지난 기수 크루의 대부분이 <strong>터미널을 처음 본 비개발자</strong>였어요.
            </p>
          </header>

          <div className="space-y-8">
            {/* ── 슬랙 ── */}
            <SectionCard>
              <SectionLabel n={1} emoji="💬" title="슬랙에 입장하고 프로필 설정" />
              <div className="space-y-5 text-[15px] leading-relaxed text-neutral-700">
                <div>
                  <p className="font-bold text-neutral-900">1. 슬랙 앱 설치</p>
                  <p className="mt-1">데스크탑과 모바일 <strong>모두</strong> 설치해 주세요.</p>
                  <p className="mt-1">
                    <a href="https://slack.com/intl/ko-kr/downloads" target="_blank" rel="noopener noreferrer" className="font-semibold text-neutral-900 underline decoration-pop decoration-2 underline-offset-4 hover:opacity-70">
                      👉 슬랙 다운로드
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">2. 초대 링크로 접속</p>
                  <p className="mt-2">
                    <a href="https://join.slack.com/t/w1777265456-oc0196728/shared_invite/zt-474uduu3o-BcNrJwYrKRoWoF3jzKA0~g" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[14px] font-bold text-white transition hover:opacity-80">
                      슬랙 워크스페이스 입장하기 →
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">3. 프로필 설정</p>
                  <ol className="mt-2 ml-5 list-decimal space-y-1.5">
                    <li>왼쪽 위 내 프로필 사진 → <strong>프로필 편집</strong></li>
                    <li>성명란: <strong>닉네임(본명)</strong> <span className="text-neutral-400">예: 파이리(진예림)</span></li>
                    <li>직함란: 본인이 하는 일 한 줄</li>
                    <li>이름 발음: 외국어 발음이 있으면 함께 기재</li>
                  </ol>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${IMG}/slack-profile-example.png`} alt="슬랙 프로필 예시" className="mt-3 w-full max-w-[340px] rounded-xl border border-neutral-200" />
                </div>
                <details className="rounded-xl border-2 border-pop overflow-hidden">
                  <summary className="px-4 py-3 cursor-pointer font-bold bg-pop/20 text-neutral-900 hover:bg-pop/30 transition">🎨 프로필 사진 꾸미기 (클릭해서 열기)</summary>
                  <div className="px-4 py-4 space-y-3">
                    <p><a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline">gemini.google.com</a>에서 AI 프로필 이미지를 만들 수 있어요.</p>
                    <ol className="ml-5 list-decimal space-y-1">
                      <li><strong>+ 버튼</strong> → &ldquo;이미지 만들기&rdquo; (모델: <strong>사고</strong> 또는 <strong>pro</strong>)</li>
                      <li>본인 사진 + 예시 사진 → 배경색이 같은 이미지 생성</li>
                    </ol>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${IMG}/gemini-guide.png`} alt="Gemini 가이드" className="w-full max-w-[480px] rounded-xl border border-neutral-200" />
                    <p className="font-bold mt-3">완성 예시</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/onboarding-complete.png" alt="프로필 완성 예시" className="w-[160px] rounded-xl border-2 border-pop" />
                    <p className="font-bold mt-3">고객의눈 로고 & 프로필 프레임</p>
                    <div className="flex gap-3 flex-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${IMG}/sponge-logo.png`} alt="로고" className="w-[120px] rounded-xl" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${IMG}/profile-frame.png`} alt="프레임" className="w-[120px] rounded-xl border border-neutral-200" />
                    </div>
                  </div>
                </details>
                <div>
                  <p className="font-bold text-neutral-900">4. 인사하기</p>
                  <p className="mt-1"><strong>#00-공통-인사해요-sns친구해요</strong> 채널에서 간단한 자기소개를 남겨주세요.</p>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {ONBOARDING_CHECKS.slice(0, 4).map((c) => (
                  <OnboardingCheck key={c.id} checked={!!obChecks[c.id]} onChange={() => toggleOb(c.id)} label={c.label} />
                ))}
              </div>
            </SectionCard>

            {/* ── 깃허브 ── */}
            <SectionCard>
              <SectionLabel n={2} emoji="🐙" title="깃허브 초대 수락" />
              <div className="space-y-3 text-[15px] leading-relaxed text-neutral-700">
                <p>과제는 <strong>깃허브(GitHub)</strong>에 제출합니다. &ldquo;과제 우체통&rdquo;이라고만 이해하면 충분해요.</p>
                <ol className="ml-5 list-decimal space-y-1.5">
                  <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">github.com</a>에서 가입 (이메일 인증까지!)</li>
                  <li>Step 1(사전 서베이)에 <strong>GitHub 이메일</strong>을 정확히 입력</li>
                  <li>제출해주신 분들에게 일괄 초대 메일 발송 예정</li>
                  <li>받은편지함에 초대 메일 → <strong>View invitation</strong> → <strong>Accept</strong></li>
                </ol>
              </div>
              <div className="mt-4"><Box variant="plain"><p className="font-bold">📬 초대 메일 안내</p><p className="mt-1 leading-relaxed">Step 1(사전 서베이)을 제출해주신 분들 대상으로 일괄 초대합니다. 초대 메일이 안 보이면 ① 스팸함 확인 ② 로그인 상태로 다시 클릭 ③ 서베이에 입력한 이메일과 GitHub 가입 이메일이 같은지 확인</p></Box></div>
              <div className="mt-5">
                <OnboardingCheck checked={!!obChecks["ob_github"]} onChange={() => toggleOb("ob_github")} label="깃허브 계정 생성 및 초대 수락" />
              </div>
            </SectionCard>

            {/* ── 클로드 앱 설치 ── */}
            <SectionCard>
              <SectionLabel n={3} emoji="🤖" title="클로드 앱 설치 — AI 동료 채용하기" />
              <p className="mb-5 text-[15px] leading-relaxed text-neutral-700">
                <strong>클로드(Claude)</strong> 데스크탑 앱을 설치하면, 내 컴퓨터 안에서 직접 파일을 만들고 일을 해주는 AI 에이전트 <strong>클로드 코드(Claude Code)</strong>를 바로 사용할 수 있습니다.
              </p>

              {/* ── Git 설치 안내 ── */}
              <div className="mb-5 rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                <p className="font-bold text-neutral-900 text-[15px] mb-2">⚠️ 클로드 코드 설치 전, Git이 필요합니다!</p>
                <p className="text-[14px] text-neutral-700 mb-3">클로드 코드는 Git이 설치되어 있어야 동작합니다. 아래 운영체제에 맞게 먼저 설치해 주세요.</p>
                <div className="space-y-4">
                  {/* 윈도우 */}
                  <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                    <p className="font-bold text-[14px] text-neutral-900 mb-2">🪟 1. 윈도우에서 설치하기</p>
                    <div className="space-y-3 text-[13.5px] text-neutral-700">
                      <div>
                        <p className="font-semibold">① 설치 파일 받기</p>
                        <p className="mt-1">아래 주소로 들어갑니다.</p>
                        <p className="mt-1"><a href="https://git-scm.com/install/windows" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">https://git-scm.com/install/windows</a></p>
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
                  {/* 맥 */}
                  <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                    <p className="font-bold text-[14px] text-neutral-900 mb-2">🍎 2. 맥에서 설치하기</p>
                    <p className="text-[13.5px] text-neutral-700 mb-2">맥은 깃이 이미 깔려 있는 경우가 많습니다. 그래서 설치보다 <strong>확인이 먼저</strong>입니다.</p>
                    <p className="text-[13.5px] text-neutral-700 mb-1">공식 페이지: <a href="https://git-scm.com/install/mac" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">https://git-scm.com/install/mac</a></p>
                    <div className="space-y-3 text-[13.5px] text-neutral-700">
                      <div>
                        <p className="font-semibold">① 터미널 열기</p>
                        <p className="mt-1"><strong>Command(⌘) + 스페이스바</strong> → <strong>터미널</strong> 입력 → Enter</p>
                        <p className="text-[12.5px] text-neutral-500">(또는 응용 프로그램 → 유틸리티 → 터미널)</p>
                      </div>
                      <div>
                        <p className="font-semibold">② 이미 있는지 확인</p>
                        <p className="mt-1">아래를 입력하고 Enter를 누릅니다.</p>
                        <div className="mt-1 rounded bg-neutral-100 px-3 py-2 font-mono text-[13px]">git --version</div>
                        <ul className="mt-1 ml-5 list-disc space-y-1">
                          <li><code>git version 2.39.5</code> 처럼 버전 번호가 나온다면 → <strong>이미 설치되어 있습니다. 여기서 끝!</strong></li>
                          <li><strong>설치 안내 팝업이 뜬다면</strong> → 설치 버튼을 누르고 끝날 때까지 기다립니다.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 3-1: 계정 & 플랜 ── */}
              <div className="space-y-5 text-[15px] text-neutral-700">
                <div>
                  <p className="font-bold text-neutral-900">1. 클로드 계정 & Max 플랜 준비</p>
                  <p className="mt-1"><a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">claude.ai</a>에서 계정을 만들고 <strong>Max 플랜</strong>으로 구독하세요.</p>
                  <p className="mt-1 text-[13.5px] text-neutral-500">클로드 코드는 유료 플랜에서만 사용 가능합니다. 무료 계정으로는 로그인 자체가 불가능해요.</p>
                  <div className="mt-3"><Box variant="warn"><p className="font-bold">⚠️ 반드시 Max 플랜이어야 합니다!</p><p className="mt-1 leading-relaxed">5주 동안 원활한 과제 수행과 실습을 위해 Max 플랜이 필요합니다. Pro 이하 등급에서는 사용량 한도에 걸려 작업이 중단될 수 있어요.</p><p className="mt-1 text-[13px]">💡 이번 달만 Max로 올리고, 다음 달에 낮추는 분들도 많습니다.</p></Box></div>
                </div>

                {/* ── STEP 3-2: OS 선택 탭 ── */}
                <div>
                  <p className="font-bold text-neutral-900 mb-3">2. 클로드 앱 설치 & 클로드 코드 활성화</p>
                  <OsTabSelector />
                </div>

              </div>

              {/* ── 막힐 때 ── */}
              <div className="mt-5"><Box variant="plain">
                <p className="font-bold text-neutral-900">🆘 설치 중 막히면?</p>
                <p className="mt-2 leading-relaxed">그 화면을 <strong>그대로 캡처해서 클로드에게 보여주세요.</strong></p>
                <div className="mt-3 rounded-xl bg-neutral-100 px-4 py-3 text-[13.5px] leading-relaxed">
                  <p className="font-semibold text-neutral-700">&ldquo;내가 클로드 코드 데스크톱 앱을 처음 받았어. 나는 [윈도우/맥] 사용자인데 이런 화면이 지금 뜨고 있거든? 이게 무엇인지 알려주고, 해결하려면 어떻게 해야 되는지 스텝 바이 스텝으로 알려줘.&rdquo;</p>
                </div>
                <div className="mt-3 rounded-xl bg-neutral-100 px-4 py-3 text-[13.5px] leading-relaxed">
                  <p className="font-semibold text-neutral-700">&ldquo;나는 Git이 뭐고 로컬 세션에서 뭐가 필요하고 이런 거 다 모르겠거든. 그래서 네가 최대한 모든 걸 다 해결해 달라는 의미야. 만약 내가 필수적으로 해야만 하는 일이 있다면, 그것만 내가 알기 쉽게 설명해 줘.&rdquo;</p>
                </div>
                <div className="mt-2 text-[13px] text-neutral-500">
                  <p>📸 캡처 방법: Mac <strong>Shift+Cmd+4</strong> / Windows <strong>Win+Shift+S</strong></p>
                  <p className="mt-1">글로만 물어보면 클로드도 상황을 정확히 알 수 없어요. <strong>반드시 캡처 이미지와 함께!</strong></p>
                  <p className="mt-1">그래도 해결 안 되면 <strong>오픈카톡방</strong>에 캡처와 함께 올려주세요. &ldquo;이런 것도 물어봐도 되나&rdquo; 싶은 것일수록 편하게 질문하세요.</p>
                </div>
              </Box></div>

              <div className="mt-5 space-y-2">
                {ONBOARDING_CHECKS.slice(5, 8).map((c) => (
                  <OnboardingCheck key={c.id} checked={!!obChecks[c.id]} onChange={() => toggleOb(c.id)} label={c.label} />
                ))}
              </div>
            </SectionCard>

            {/* ── VS Code ── */}
            <SectionCard>
              <SectionLabel n={4} emoji="💻" title="VS Code — 클로드 코드의 작업실" />

              <div className="mb-5 space-y-3 text-[15px] leading-relaxed text-neutral-700">
                <p>
                  <strong>클로드 코드(Claude Code)</strong>는 터미널에서 동작하기 때문에, 사실 어떤 코드 편집기를 써도 됩니다.
                  하지만 고객의눈에서는 <strong>VS Code</strong>를 권장합니다.
                </p>
              </div>

              <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="font-bold text-neutral-900 mb-3">왜 VS Code인가요?</p>
                <ul className="space-y-2.5 text-[14.5px] text-neutral-700">
                  <li className="flex gap-2">
                    <span className="flex-none">📂</span>
                    <span><strong>폴더 구조를 한눈에</strong> — 클로드가 만든 파일과 폴더가 왼쪽 탐색기에 트리 형태로 보여서, 프로젝트 전체를 쉽게 파악할 수 있어요.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-none">🔍</span>
                    <span><strong>변경 사항 즉시 확인</strong> — 클로드가 코드를 수정하면 어디가 바뀌었는지 색깔로 표시되고, 수정 전후를 나란히 비교할 수 있어요.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-none">🤖</span>
                    <span><strong>Claude Code 확장 지원</strong> — VS Code 안에서 바로 클로드 코드를 실행할 수 있는 공식 확장이 있어요. 터미널과 편집기를 따로 왔다 갔다 할 필요가 없습니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-none">🆓</span>
                    <span><strong>무료 + 가장 많이 쓰는 편집기</strong> — 전 세계에서 가장 많이 쓰이는 코드 편집기라 자료도 많고, 모르는 게 있을 때 검색이 쉬워요.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-5">
                <Box variant="plain">
                  <p className="text-[14px] leading-relaxed text-neutral-600">
                    💡 이미 Cursor, Windsurf, WebStorm 등 다른 편집기를 쓰고 계시다면 그걸 쓰셔도 괜찮습니다. 다만 운영진이 안내하는 화면 예시는 VS Code 기준이에요.
                  </p>
                </Box>
              </div>

              <div className="space-y-5 text-[15px] text-neutral-700">
                <div>
                  <p className="font-bold text-neutral-900">STEP 1. VS Code 설치</p>
                  <p className="mt-1"><a href="https://code.visualstudio.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-pop decoration-2 underline-offset-4">code.visualstudio.com</a> → 큰 파란 버튼 → 기본값으로 설치</p>
                </div>

                <div>
                  <p className="font-bold text-neutral-900">STEP 2. 메뉴 한국어로 바꾸기 (Korean Language Pack)</p>
                  <p className="mt-1 text-[13.5px] text-neutral-500">먼저 해두면 다음 단계 메뉴가 다 한국어로 보여서 훨씬 편해요.</p>
                  <ol className="mt-2 ml-5 list-decimal space-y-1.5">
                    <li>왼쪽 막대의 <strong>네모 4개(확장/Extensions)</strong> 아이콘 클릭 — 단축키 <strong>Cmd + Shift + X</strong></li>
                    <li>검색창에 <strong>Korean Language Pack</strong> 입력</li>
                    <li><strong>발행자 Microsoft</strong> 항목의 <strong>Install</strong> 클릭
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/vscode-extensions.png" alt="Korean Language Pack 설치" className="mt-2 w-full max-w-[400px] rounded-xl border border-neutral-200" />
                    </li>
                    <li>오른쪽 아래 <strong>&ldquo;다시 시작(Restart)&rdquo;</strong> 알림이 뜨면 클릭 → 메뉴가 한국어로 바뀜</li>
                  </ol>
                  <p className="mt-1 text-[13px] text-neutral-500">알림이 안 뜨면: <strong>Cmd + Shift + P</strong> → <code className="rounded bg-neutral-200 px-1">Configure Display Language</code> 입력 → 한국어 선택 → 재시작</p>
                </div>

                <div>
                  <p className="font-bold text-neutral-900">STEP 3. Claude Code 확장 설치</p>
                  <ol className="mt-2 ml-5 list-decimal space-y-1.5">
                    <li><strong>확장</strong>(Cmd + Shift + X) → 검색창에 <strong>Claude Code</strong></li>
                    <li><strong>발행자가 &ldquo;Anthropic&rdquo;</strong>인 항목을 <strong>설치</strong>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/vscode-claude-code.png" alt="Claude Code 확장 설치" className="mt-2 w-full max-w-[400px] rounded-xl border border-neutral-200" />
                    </li>
                    <li>설치되면 <strong>Spark 아이콘(✱, 주황색)</strong>이 생겨요 (왼쪽 막대 또는 오른쪽 위)</li>
                  </ol>
                  <div className="mt-3"><Box variant="warn"><p className="font-bold">⚠️ 꼭 확인하세요!</p><p className="mt-1 leading-relaxed"><code className="rounded bg-neutral-200 px-1">Claude Dev</code>, <code className="rounded bg-neutral-200 px-1">Cline</code>, 그냥 <code className="rounded bg-neutral-200 px-1">Claude</code> 같은 비슷한 이름은 <strong>다른(서드파티) 확장</strong>이에요. API 키를 따로 넣으라고 해서 막혀요. 우리가 쓰는 건 <strong>Claude Code · 발행자 Anthropic</strong> 하나예요.</p></Box></div>
                  <p className="mt-2 text-[13px] text-neutral-500">Spark(✱) 아이콘이 안 보이면: <strong>Cmd + Shift + P</strong> → <code className="rounded bg-neutral-200 px-1">Developer: Reload Window</code></p>
                </div>
              </div>
              <div className="mt-4"><Box variant="plain"><p>VS Code 설치 및 <strong>확장 2개(Korean Language Pack + Claude Code)</strong>까지 설치해주시면 됩니다! 🙂</p></Box></div>
              <div className="mt-5 space-y-2">
                {ONBOARDING_CHECKS.slice(8, 10).map((c) => (
                  <OnboardingCheck key={c.id} checked={!!obChecks[c.id]} onChange={() => toggleOb(c.id)} label={c.label} />
                ))}
              </div>
            </SectionCard>

            {/* ── 사전 시청 자료 ── */}
            <SectionCard>
              <SectionLabel n={5} emoji="📺" title="사전 시청 자료 — 3개 모두 필수" />
              <p className="mb-5 text-[15px] leading-relaxed text-neutral-700">
                1회차에 클로드코드와 깃허브를 모두 다루기 때문에, 미리 보고 오시면 셋업데이가 훨씬 수월해요.
              </p>
              <div className="space-y-3 mb-5">
                <a href="https://youtu.be/9T5TIcAB1So" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100">
                  <span className="text-xl">▶️</span> 클로드코드로 사이트부터 어드민 깃허브까지 1
                </a>
                <a href="https://youtu.be/QMOafySztl4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100">
                  <span className="text-xl">▶️</span> 클로드코드로 사이트부터 어드민 깃허브까지 2
                </a>
                <a href="https://www.youtube.com/watch?v=2ixblNkICtc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-100">
                  <span className="text-xl">▶️</span> 이기적공유회 — 비즈니스 코어 만들기 (8/17)
                </a>
              </div>
              <div className="space-y-2">
                {ONBOARDING_CHECKS.slice(10, 13).map((c) => (
                  <OnboardingCheck key={c.id} checked={!!obChecks[c.id]} onChange={() => toggleOb(c.id)} label={c.label} />
                ))}
              </div>
            </SectionCard>

            {/* ── 막혔을 때 ── */}
            <SectionCard>
              <SectionLabel n={6} emoji="🆘" title="막혔을 때 — 캡처 + 클로드에게 물어보기" />

              <div className="mb-5 rounded-xl border-2 border-pop bg-pop/10 p-4">
                <p className="font-bold text-neutral-900 text-[15px] mb-2">📸 막히면 무조건 화면 캡처!</p>
                <p className="text-[14.5px] leading-relaxed text-neutral-700">
                  에러가 나거나 막힐 때는 <strong>화면을 캡처해서 클로드에게 그대로 보여주세요.</strong>
                  텍스트로 설명하는 것보다 스크린샷 한 장이 훨씬 정확합니다.
                </p>
                <div className="mt-3 space-y-1 text-[13.5px] text-neutral-600">
                  <p>🍎 Mac: <strong>⌘ + Shift + 4</strong> → 영역 선택 캡처</p>
                  <p>🪟 Windows: <strong>Win + Shift + S</strong> → 영역 선택 캡처</p>
                </div>
              </div>

              <p className="mb-3 text-[15px] font-bold text-neutral-900">캡처와 함께 이렇게 물어보세요</p>
              <div className="space-y-3">
                {[
                  { n: "①", label: "에러가 떴을 때", text: "[캡처 첨부] 이 에러가 뭔지 비개발자도 이해할 수 있게 설명해주고, 해결 순서를 한 단계씩 알려줘." },
                  { n: "②", label: "안 될 때", text: "[캡처 첨부] 네가 알려준 방법이 안 됐어. 지금 화면이 이래. 다른 방법을 알려줘." },
                  { n: "③", label: "용어가 어려울 때", text: "이 용어를 초등학생도 알 수 있게 한 문장으로 설명해줘: [용어]" },
                  { n: "④", label: "어디까지 왔는지 모를 때", text: "[캡처 첨부] 내가 하려는 것: [목표]. 여기까지 했는데 다음에 뭘 하면 돼?" },
                  { n: "⑤", label: "겁이 날 때", text: "지금부터 내가 하는 작업을 옆에서 지켜보다가, 위험한 것 같으면 실행 전에 꼭 나에게 확인해줘." },
                ].map((q) => (
                  <div key={q.n} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-700">
                    <span className="font-bold text-neutral-900">{q.n} {q.label}</span>
                    <p className="mt-1 text-neutral-600">&ldquo;{q.text}&rdquo;</p>
                  </div>
                ))}
              </div>
              <div className="mt-5"><Box variant="plain"><p className="font-bold">사람을 부를 타이밍</p><p className="mt-1.5 leading-relaxed text-neutral-700">같은 에러 <strong>3번</strong> 반복 / <strong>30분</strong> 넘게 막힘 / <strong>로그인·결제·계정</strong> → <strong>무지성질문방</strong> 또는 조장에게!</p></Box></div>
            </SectionCard>

            {/* ── 셋업데이 ── */}
            <SectionCard>
              <SectionLabel n={7} emoji="🛠" title="셋업데이 — 8/22(토) 19:00" />
              <p className="mb-4 text-[15px] leading-relaxed text-neutral-700">
                슬랙에 공지되는 <strong>줌 링크</strong>로 들어오시면 됩니다. (19:00 ~ 23:00)
              </p>
              <div className="mb-5 text-[15px] text-neutral-700">
                <p className="font-bold text-neutral-900 mb-2">셋업데이에는요</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li><strong>프로필사진 만들기</strong> + 슬랙 간단 사용법</li>
                  <li><strong>깃헙부터 레포 pull/push까지</strong> — 자기소개를 예시로</li>
                  <li><strong>클로드코드 시작해보기</strong> — 간단한 투두 리스트 만들기</li>
                  <li><strong>조별 모임</strong></li>
                </ul>
              </div>
            </SectionCard>

            {/* ── 완료 제출 ── */}
            <div className="pt-2">
              {obSubmitted ? (
                <div className="rounded-2xl border-2 border-pop bg-pop/10 px-6 py-8 text-center">
                  <div className="text-5xl">👁️</div>
                  <h2 className="mt-3 text-xl font-extrabold text-pop">온보딩 완료!</h2>
                  <p className="mt-2 text-[15px] text-neutral-300">셋업데이(8/22)에서 만나요 👁️</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[14px] font-bold text-neutral-200">
                        본명 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={obName}
                        onChange={(e) => setObName(e.target.value)}
                        placeholder="예) 진예림"
                        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-pop/60"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[14px] font-bold text-neutral-200">
                        닉네임 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={obNickname}
                        onChange={(e) => setObNickname(e.target.value)}
                        placeholder="슬랙에 설정한 닉네임"
                        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-pop/60"
                      />
                    </div>
                  </div>
                  <div className={`mb-4 rounded-xl px-4 py-3 text-center ${obAllDone ? "border-2 border-pop bg-pop/15" : "border border-white/10 bg-white/5"}`}>
                    <p className={`text-[15px] font-bold ${obAllDone ? "text-pop" : "text-neutral-200"}`}>
                      {obDone === obTotal && (!obName.trim() || !obNickname.trim())
                        ? "본명과 닉네임을 입력해 주세요"
                        : obAllDone
                        ? "🎉 모든 항목을 완료했습니다! 아래 버튼을 눌러 완료해 주세요."
                        : `완료한 항목의 체크박스를 눌러주세요 (${obDone}/${obTotal})`}
                    </p>
                    <p className="mt-1 text-[12px] text-neutral-400">
                      * 커리큘럼은 진행 상황에 따라 일부 변경될 수 있습니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!obAllDone || obSubmitted) return;
                      setObSubmitted(true);
                      try {
                        const obPayload = {
                          type: "onboarding",
                          닉네임: obNickname.trim(),
                          본명: obName.trim(),
                          이메일: "",
                          ...Object.fromEntries(
                            ONBOARDING_CHECKS.map((c) => [c.label, obChecks[c.id] ? "✅" : ""])
                          ),
                        };
                        if (SCRIPT_URL) {
                          await fetch(SCRIPT_URL, {
                            method: "POST",
                            mode: "no-cors",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify(obPayload),
                          });
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    disabled={!obAllDone}
                    className={`w-full rounded-2xl py-4 text-[17px] font-extrabold transition ${
                      obAllDone
                        ? "bg-pop text-black hover:opacity-90"
                        : "bg-white/10 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    {obAllDone ? "온보딩 완료하기 🏔️" : `${obDone}/${obTotal} 완료`}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── 서베이 화면 ──
  return (
    <>
      <ProgressBar value={progress} />
      <main className="mx-auto max-w-2xl px-4 pb-32 pt-12 sm:px-6">
        <FlowBar
          activeTab="survey"
          onTabChange={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0 }); }}
          step1Done={submitted}
          surveyProgress={progress}
          step2Done={obSubmitted}
          onboardingProgress={obProgress}
        />

        {/* 안내 배너 */}
        <div className="mb-6 rounded-2xl border-2 border-pop bg-pop/10 px-5 py-4 text-center">
          <p className="text-[15px] font-bold text-pop">
            ✅ 이미 Step 1을 완료하셨다면 바로 Step 2 온보딩으로 넘어가세요!
          </p>
          <button
            onClick={() => { setActiveTab("onboarding"); window.scrollTo({ top: 0 }); }}
            className="mt-3 rounded-xl border border-pop px-5 py-2 text-[13px] font-semibold text-pop transition hover:bg-pop/20"
          >
            Step 2 온보딩으로 가기 →
          </button>
        </div>

        <header className="mb-10">
          <div className="text-5xl">👁️</div>
          <h1 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-4xl">
            고객의눈
            <br />
            사전 서베이
          </h1>
          <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-neutral-300">
            <p>
              고객의눈 크루가 되신 것을 환영합니다!
              <br />
              사전 서베이를 꼼꼼히 작성해 주시고, 이번 주 토요일(8/22, 토)
              셋업데이에 온라인으로 만나요.
            </p>
            <p className="font-medium">
              꼼꼼하게 확인 후 작성해주세요. ⏱ 소요 시간: 약 20분
            </p>
          </div>
        </header>

        <div className="space-y-8">
          {/* ── SECTION 1: 기본 정보 ── */}
          <SectionCard>
            <SectionLabel n={1} emoji="🙋" title="기본 정보 및 자기소개" />
            <div className="space-y-7">
              <Field
                id="본명"
                label="Q1. 본명 (실명)"
                hint="신청·결제하신 분과 동일한 이름으로 적어주세요."
                required
                error={err("본명")}
              >
                <TextInput
                  value={answers.본명}
                  onChange={(v) => set("본명", v)}
                  placeholder="홍길동"
                  error={err("본명")}
                />
              </Field>

              <Field
                id="이메일"
                label="Q2. 이메일"
                hint="운영 안내 수신용"
                required
                error={err("이메일")}
              >
                <TextInput
                  value={answers.이메일}
                  onChange={(v) => set("이메일", v)}
                  placeholder="you@example.com"
                  type="email"
                  inputMode="email"
                  error={err("이메일")}
                />
                {err("이메일") && answers.이메일.trim() && (
                  <p className="mt-1.5 text-[13px] text-red-400">
                    이메일 형식을 확인해주세요.
                  </p>
                )}
              </Field>

              <Field
                id="연락처"
                label="Q3. 연락처"
                hint="연락 가능한 휴대폰 번호"
                required
                error={err("연락처")}
              >
                <TextInput
                  value={answers.연락처}
                  onChange={(v) => set("연락처", v)}
                  placeholder="010-0000-0000"
                  type="tel"
                  inputMode="tel"
                  error={err("연락처")}
                />
                {err("연락처") && answers.연락처.trim() && (
                  <p className="mt-1.5 text-[13px] text-red-400">
                    휴대폰 번호 형식으로 입력해주세요. (예: 010-1234-5678)
                  </p>
                )}
              </Field>

              <Field
                id="연령대"
                label="Q4. 연령대"
                required
                error={err("연령대")}
              >
                <RadioGroup
                  options={AGE_OPTIONS}
                  value={answers.연령대}
                  onChange={(v) => set("연령대", v)}
                  error={err("연령대")}
                />
              </Field>

              <Field
                id="GitHub이메일"
                label="Q5. GitHub 계정 이메일"
                hint="셋업데이부터 GitHub 계정이 필요합니다. 초대를 위해 깃헙 아이디가 아닌, 깃헙을 가입하신 이메일을 적어주세요."
                required
                error={err("GitHub이메일")}
              >
                <p className="mb-2 text-[13.5px] text-muted">
                  계정이 없으시면{" "}
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-neutral-900 underline decoration-pop decoration-2 underline-offset-4 hover:opacity-70"
                  >
                    github.com
                  </a>
                  에서 무료 가입 후 그 이메일을 적어주세요.
                </p>
                <TextInput
                  value={answers.GitHub이메일}
                  onChange={(v) => set("GitHub이메일", v)}
                  placeholder="github-email@example.com"
                  type="email"
                  inputMode="email"
                  error={err("GitHub이메일")}
                />
                {err("GitHub이메일") && answers.GitHub이메일.trim() && (
                  <p className="mt-1.5 text-[13px] text-red-400">
                    이메일 형식을 확인해주세요. (예: name@gmail.com)
                  </p>
                )}
              </Field>

              <Field
                id="현재하는일"
                label="Q6. 현재 하고 계신 일"
                hint="한 줄로 소개해 주세요"
                required
                error={err("현재하는일")}
              >
                <TextInput
                  value={answers.현재하는일}
                  onChange={(v) => set("현재하는일", v)}
                  placeholder="예) 스타트업 마케터 / 1인 쇼핑몰 운영"
                  error={err("현재하는일")}
                />
              </Field>

              <Field
                id="카테고리"
                label="Q7. 본인을 가장 잘 설명하는 카테고리"
                required
                error={err("카테고리")}
              >
                <RadioGroup
                  options={[...CATEGORY_OPTIONS, ETC]}
                  value={categorySel}
                  onChange={setCategorySel}
                  error={err("카테고리")}
                />
                {categorySel === ETC && (
                  <div className="mt-2.5">
                    <TextInput
                      value={categoryEtc}
                      onChange={setCategoryEtc}
                      placeholder="직접 입력해주세요"
                      error={err("카테고리")}
                    />
                  </div>
                )}
              </Field>
            </div>
          </SectionCard>

          {/* ── SECTION 2: 크루챗 카드 ── */}
          <SectionCard>
            <SectionLabel n={2} emoji="🪪" title="크루챗 카드 — 나를 소개하기" />
            <p className="mb-6 text-[15px] leading-relaxed text-neutral-700">
              아래 내용은 고객의눈 크루챗 카드에 들어갑니다.
              다른 크루들이 나를 알아갈 수 있도록, 솔직하고 구체적으로
              적어주세요. 카드는 슬랙과 조 활동에서 크루들끼리 서로를
              더 잘 이해하기 위해 사용됩니다.
            </p>

            <div className="mb-5 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pop/30 text-2xl">
                  👁️
                </div>
                <div>
                  <div className="text-[16px] font-extrabold text-neutral-900">
                    {answers.본명 || "본명"}
                  </div>
                  <div className="text-[13px] text-neutral-500">
                    {answers.카테고리 || "카테고리"} · {answers.현재하는일 || "현재 하는 일"}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {answers.준비상태 && (
                  <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                    {answers.준비상태.split(" —")[0]}
                  </span>
                )}
                {answers.비즈니스상태 && (
                  <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                    {answers.비즈니스상태.split(" —")[0]}
                  </span>
                )}
                {answers.도메인 && (
                  <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    {answers.도메인}
                  </span>
                )}
              </div>

              <div className="space-y-3 text-[13.5px] mt-3">
                <div>
                  <div className="font-bold text-neutral-400 text-[12px]">내가 나눌 수 있는 것</div>
                  <div className="text-neutral-700">
                    {answers.나눌수있는것 || "여기에 내용이 표시됩니다"}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-neutral-400 text-[12px]">궁금한 분야</div>
                  <div className="text-neutral-700">
                    {answers.궁금한분야 || "여기에 내용이 표시됩니다"}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-neutral-400 text-[12px]">이런 사람과 얘기하고 싶어요</div>
                  <div className="text-neutral-700">
                    {answers.만나고싶은사람 || "여기에 내용이 표시됩니다"}
                  </div>
                </div>
              </div>

              {(answers.인스타그램 || answers.스레드 || answers.링크드인 || answers.블로그) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {answers.인스타그램 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-700">
                      Instagram ↗
                    </span>
                  )}
                  {answers.스레드 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-700">
                      Threads ↗
                    </span>
                  )}
                  {answers.링크드인 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-700">
                      LinkedIn ↗
                    </span>
                  )}
                  {answers.블로그 && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-700">
                      Blog ↗
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-7">
              <Field
                id="준비상태"
                label="비즈니스 준비 상태"
                hint="지금 만들고 있거나 만들고 싶은 비즈니스의 준비 상태를 알려주세요."
                required
                error={err("준비상태")}
              >
                <RadioGroup
                  options={[...READINESS_OPTIONS, ETC]}
                  value={readinessSel}
                  onChange={setReadinessSel}
                  error={err("준비상태")}
                />
                {readinessSel === ETC && (
                  <div className="mt-2.5">
                    <TextInput
                      value={readinessEtc}
                      onChange={setReadinessEtc}
                      placeholder="직접 입력해주세요"
                      error={err("준비상태")}
                    />
                  </div>
                )}
              </Field>

              <Field
                id="비즈니스상태"
                label="비즈니스 유형"
                hint="만들고 있거나 관심 있는 비즈니스가 어떤 형태인가요?"
                required
                error={err("비즈니스상태")}
              >
                <RadioGroup
                  options={[...BUSINESS_TYPE_OPTIONS, ETC]}
                  value={bizSel}
                  onChange={setBizSel}
                  error={err("비즈니스상태")}
                />
                {bizSel === ETC && (
                  <div className="mt-2.5">
                    <TextInput
                      value={bizEtc}
                      onChange={setBizEtc}
                      placeholder="직접 입력해주세요"
                      error={err("비즈니스상태")}
                    />
                  </div>
                )}
              </Field>

              <Field
                id="도메인"
                label="도메인 (시장)"
                hint="관심 있거나 진출하려는 분야를 선택해주세요."
                required
                error={err("도메인")}
              >
                <RadioGroup
                  options={[...DOMAIN_OPTIONS, ETC]}
                  value={domainSel}
                  onChange={setDomainSel}
                  error={err("도메인")}
                />
                {domainSel === ETC && (
                  <div className="mt-2.5">
                    <TextInput
                      value={domainEtc}
                      onChange={setDomainEtc}
                      placeholder="직접 입력해주세요"
                      error={err("도메인")}
                    />
                  </div>
                )}
              </Field>

              <Field
                id="나눌수있는것"
                label="내가 나눌 수 있는 것"
                hint="본인의 경험·지식·스킬 중 다른 크루에게 도움이 될 만한 것을 적어주세요."
                required
                error={err("나눌수있는것")}
              >
                <TextArea
                  value={answers.나눌수있는것}
                  onChange={(v) => set("나눌수있는것", v)}
                  placeholder="예) 1. 마케팅 경험 (퍼포먼스/브랜딩/콘텐츠) / 2. IP구상 (뉴스레터, 유튜브) / 3. 커뮤니티 운영 노하우"
                  rows={4}
                  error={err("나눌수있는것")}
                />
              </Field>

              <Field
                id="궁금한분야"
                label="궁금한 분야"
                hint="고객의눈에서 다른 크루들에게 물어보고 싶은 분야가 있다면 적어주세요."
                required
                error={err("궁금한분야")}
              >
                <TextArea
                  value={answers.궁금한분야}
                  onChange={(v) => set("궁금한분야", v)}
                  placeholder="예) 모든 분야에 열려있음 / AI 자동화, 1인 사업 구조"
                  rows={3}
                  error={err("궁금한분야")}
                />
              </Field>

              <Field
                id="만나고싶은사람"
                label="이런 사람과 얘기하고 싶어요"
                hint="고객의눈에서 만나고 싶은 사람의 유형을 적어주세요."
                required
                error={err("만나고싶은사람")}
              >
                <TextArea
                  value={answers.만나고싶은사람}
                  onChange={(v) => set("만나고싶은사람", v)}
                  placeholder="예) 본업 병행 1인 크리에이터 / 퇴사 후 나의 길을 걷는 분 / 한 분야에서 5년 이상 파보신 분"
                  rows={3}
                  error={err("만나고싶은사람")}
                />
              </Field>

              <div className="space-y-4">
                <FieldLabel
                  label="SNS 및 블로그 링크 (선택)"
                  hint="크루챗 카드에 링크 버튼으로 표시됩니다. 공유하고 싶은 것만 적어주세요."
                />
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[13.5px] font-semibold text-neutral-600">
                      Instagram
                    </label>
                    <TextInput
                      value={answers.인스타그램}
                      onChange={(v) => set("인스타그램", v)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13.5px] font-semibold text-neutral-600">
                      Threads
                    </label>
                    <TextInput
                      value={answers.스레드}
                      onChange={(v) => set("스레드", v)}
                      placeholder="https://threads.net/@username"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13.5px] font-semibold text-neutral-600">
                      LinkedIn
                    </label>
                    <TextInput
                      value={answers.링크드인}
                      onChange={(v) => set("링크드인", v)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13.5px] font-semibold text-neutral-600">
                      Blog
                    </label>
                    <TextInput
                      value={answers.블로그}
                      onChange={(v) => set("블로그", v)}
                      placeholder="https://blog.example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── SECTION 3: 동의 ── */}
          <SectionCard>
            <SectionLabel
              n={3}
              emoji="✅"
              title="함께하기 전에 — 멤버의 약속 · 이용약관 · 콘텐츠 안내"
            />
            <p className="mb-6 text-[15px] leading-relaxed text-neutral-700">
              고객의눈은 운영진이 &lsquo;제공&rsquo;하는 강의가 아니라, 크루
              모두가 함께 굴리는 커뮤니티예요. 그래서 시작 전에 꼭 확인하고 가야
              할 세 가지를 안내드립니다. 가볍게 넘기지 마시고, 천천히 읽어보신 후
              체크해 주세요.
            </p>

            <div className="space-y-6">
              <div
                id="동의_약관"
                className={`scroll-mt-24 ${
                  err("동의_멤버약속") || err("동의_이용약관")
                    ? "field-error"
                    : ""
                }`}
              >
                <h3 className="text-[16px] font-bold">
                  3-1. 멤버의 약속 · 이용약관
                </h3>
                <p className="mt-3 text-[14.5px] font-semibold">멤버의 약속</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-neutral-700">
                  이기적공유에 진심으로 참여하기, 조의 리듬을 함께 만들기, 서로의
                  시도를 존중하기 — 우리가 5주를 잘 보내기 위한 약속이에요.
                </p>
                <div className="mt-2">
                  <NotionLink
                    href={LINKS.memberPromise}
                    label="멤버의 약속 전문 보기 (노션)"
                  />
                </div>

                <p className="mt-4 text-[14.5px] font-semibold">이용약관</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-neutral-700">
                  참여·운영·환불 등에 대한 기본 약관이에요.
                </p>
                <div className="mt-2">
                  <NotionLink
                    href={LINKS.terms}
                    label="이용약관 전문 보기 (노션)"
                  />
                </div>

                <div className="mt-4">
                  <ConsentCheck
                    checked={answers.동의_멤버약속 && answers.동의_이용약관}
                    onChange={(v) =>
                      setAnswers((a) => ({
                        ...a,
                        동의_멤버약속: v,
                        동의_이용약관: v,
                      }))
                    }
                    label="이용약관을 모두 확인했으며, 고객의눈 멤버약속을 지킬 것에 동의합니다."
                    error={err("동의_멤버약속") || err("동의_이용약관")}
                  />
                </div>
              </div>

              <div
                id="동의_콘텐츠활용"
                className={`scroll-mt-24 ${
                  err("동의_콘텐츠활용") ? "field-error" : ""
                }`}
              >
                <h3 className="text-[16px] font-bold">
                  3-2. 콘텐츠 활용 안내 📸
                </h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-neutral-700">
                  고객의눈 활동 중 촬영되는 사진·영상, 그리고 슬랙·조 채널에
                  쌓이는 공유 기록은 고객의눈의 활동을 이기적으로 알리는
                  콘텐츠로 활용되거나 SNS 등에 올라갈 수 있어요.
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-neutral-700">
                  원치 않으시면 <strong>사전에 미리, 또는 이후에라도 운영진
                  다니에게 말씀해주셔도 괜찮습니다.</strong>
                </p>
                <div className="mt-3">
                  <ConsentCheck
                    checked={answers.동의_콘텐츠활용}
                    onChange={(v) => set("동의_콘텐츠활용", v)}
                    label="위 안내 내용을 확인했습니다."
                    error={err("동의_콘텐츠활용")}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── SECTION 4: AI 도구 사용 경험 ── */}
          <SectionCard>
            <SectionLabel n={4} emoji="🤖" title="AI 도구 사용 경험" />
            <p className="mb-6 text-[15px] leading-relaxed text-neutral-700">
              조 배정과 W1 사전 안내에 활용하기 위해, 본인의 AI 사용 경험을
              솔직하게 적어주세요. 정답이 있는 질문이 아니에요. 잘 못 써도 괜찮고,
              많이 안 써도 괜찮아요.
            </p>
            <div className="space-y-7">
              <Field
                id="AI사용경험"
                label="Q8. 최근 AI 도구를 어떻게 사용하셨나요?"
                hint="최근 1~3개월 기준, 어떤 일에 어떻게 활용했는지 구체적으로."
                required
                error={err("AI사용경험")}
              >
                <TextArea
                  value={answers.AI사용경험}
                  onChange={(v) => set("AI사용경험", v)}
                  rows={5}
                  error={err("AI사용경험")}
                />
              </Field>
              <Field
                id="바이브코딩"
                label="Q9. 바이브 코딩(Vibe Coding) 사용 이력이 있으신가요?"
                hint="있다면 어떤 도구로 무엇을, 없다면 '없음'."
                required
                error={err("바이브코딩")}
              >
                <TextArea
                  value={answers.바이브코딩}
                  onChange={(v) => set("바이브코딩", v)}
                  rows={4}
                  error={err("바이브코딩")}
                />
              </Field>
              <Field
                id="Claude사용"
                label="Q10. 평소에 Claude를 사용하시나요?"
                hint="사용 빈도와 주 용도."
                required
                error={err("Claude사용")}
              >
                <TextArea
                  value={answers.Claude사용}
                  onChange={(v) => set("Claude사용", v)}
                  rows={4}
                  error={err("Claude사용")}
                />
              </Field>
              <Field
                id="막힌부분"
                label="Q11. AI를 쓰면서 본인이 가장 막히거나 어려웠던 부분은 무엇인가요?"
                required
                error={err("막힌부분")}
              >
                <TextArea
                  value={answers.막힌부분}
                  onChange={(v) => set("막힌부분", v)}
                  rows={4}
                  error={err("막힌부분")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── SECTION 5: 참여 조건과 시간 확보 ── */}
          <SectionCard>
            <SectionLabel n={5} emoji="⏳" title="참여 조건과 시간 확보" />
            <p className="mb-5 text-[15px] leading-relaxed text-neutral-700">
              고객의눈을 제대로 굴리려면, 라이브 세션 외에도 본인 시간이
              필요합니다. (총 7회차 · 5주)
            </p>

            <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-left text-[13.5px]">
                <thead className="bg-neutral-50 text-[12px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-semibold">구분</th>
                    <th className="px-3 py-2 font-semibold">시간</th>
                    <th className="px-3 py-2 font-semibold">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {TIME_TABLE.map((r) => (
                    <tr key={r.구분} className="border-t border-neutral-200 align-top">
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                        {r.구분}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{r.시간}</td>
                      <td className="px-3 py-2.5 text-neutral-700">{r.내용}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mb-6 text-[14.5px] leading-relaxed text-neutral-700">
              이 시간들은 5주 동안 전체적으로 확보되어야 합니다. 특정 한 주에
              몰아서가 아니라, 매주 본인의 리듬 안에서 꾸준히 굴러갈 수 있게요.
              (8/22 ~ 9/20)
            </p>

            <div className="space-y-7">
              <Field
                id="시간확보"
                label="Q12. 위 시간 구조를 확인하셨고, 5주 동안 책임감 있게 확보하실 수 있겠습니까?"
                required
                error={err("시간확보")}
              >
                <RadioGroup
                  options={TIME_COMMIT_OPTIONS}
                  value={answers.시간확보}
                  onChange={(v) => set("시간확보", v)}
                  error={err("시간확보")}
                />
              </Field>
              <Field
                id="포기할것"
                label="Q13. 이 시간을 지키기 위해, 본인이 포기하거나 미뤄야 할 것 한 가지를 적어주세요."
                required
                error={err("포기할것")}
              >
                <TextInput
                  value={answers.포기할것}
                  onChange={(v) => set("포기할것", v)}
                  placeholder="예) 주말 넷플릭스 정주행"
                  error={err("포기할것")}
                />
              </Field>
            </div>

            <div className="mt-7">
              <Box variant="warn">
                <p className="font-bold">⚠️ 환불 안내</p>
                <p className="mt-2 leading-relaxed">
                  신청 후 본인의 일정·상황상 끝까지 함께 가기 어렵다고
                  판단되시면, 환불 기한 내에 환불이
                  가능합니다. 조 편성과 운영 준비가 시작되면
                  이후에는 환불·환급이 어렵다는 점 미리 양해
                  부탁드려요. 서로 함께하기로 한 약속을 가볍게 여기지 않기 위한
                  최소한의 기준이라고 생각해 주시면 감사하겠습니다.
                </p>
                <p className="mt-2 leading-relaxed">
                  모든 문의는 셀피쉬클럽 카카오채널로 부탁드립니다.
                </p>
              </Box>
            </div>
          </SectionCard>

          {/* ── SECTION 6: 일정과 참여 방식 ── */}
          <SectionCard>
            <SectionLabel n={6} emoji="📅" title="일정과 참여 방식" />

            <div className="space-y-4">
              <Box variant="plain">
                <p className="font-bold">📹 카메라 사용 안내</p>
                <p className="mt-1.5 leading-relaxed text-neutral-700">
                  라이브 세션과 조 모임에서는 가급적 카메라를 켜고 참여해 주세요.
                  얼굴을 보고 이야기할 때 집중 학습력과 이기적공유의 밀도가 훨씬
                  좋아집니다.
                </p>
              </Box>

              <Box variant="yellow">
                <p className="font-bold">🛠 셋업데이 안내 — 전원 참석</p>
                <p className="mt-1.5 leading-relaxed">
                  <strong>일시: 8월 22일(토) 저녁 7시 ~ 11시 (19:00–23:00)</strong>
                  <br />
                  <strong>방식: 온라인 진행</strong>
                </p>
                <p className="mt-2 leading-relaxed">
                  본격 시작 전, 함께 모여 GitHub와 Claude Code 환경을 직접
                  세팅하고 과제 제출 방법까지 익히는 시간입니다. 서로 가볍게
                  자기소개도 나눠요. 강의가 아니라 같이 손으로 세팅하는
                  자리예요. 이후 모든 주차가 매끄럽게 굴러가려면 꼭 필요한
                  시간이라, 전원 참석으로 진행합니다.
                </p>
              </Box>
            </div>

            <div className="mt-6 space-y-2.5">
                  {SCHEDULE_TABLE.map((r) => (
                    <div
                      key={r.회차}
                      className={`rounded-xl border px-4 py-3 ${
                        r.highlight ? "border-pop bg-pop/10" : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <div className="text-[12px] font-semibold text-neutral-500">
                        {r.회차}회차 · {r.날짜} {r.시간} · {r.구분}
                      </div>
                      <div className="mt-1 text-[15px] font-bold text-neutral-900">
                        {r.내용}
                      </div>
                    </div>
                  ))}
            </div>
            <p className="mt-3 text-[13px] text-neutral-500">
              ⚠️ 일정과 커리큘럼은 변동될 수 있습니다.
            </p>

            <div className="mt-7 space-y-7">
              <Field
                id="불참일정"
                label="Q14. 참여가 어렵거나 불확실한 일정을 모두 선택해주세요."
                required
                error={err("불참일정")}
              >
                <CheckboxGroup
                  options={[ABSENCE_ALL_OK, ...ABSENCE_OPTIONS]}
                  values={answers.불참일정}
                  onToggle={toggleAbsence}
                  error={err("불참일정")}
                />
              </Field>
            </div>

            <div className="mt-7">
              <Box variant="yellow">
                <p className="font-bold">🏕 4회차 오프라인 모임 — 9/5(토)</p>
                <p className="mt-1.5 leading-relaxed">
                  <strong>시간: 확정 후 안내 / 장소: 서울 (추후 안내 예정)</strong>
                  <br />
                  5주 중 유일한 대면 모임이며, 이번 기수는 전체 크루가 다 함께
                  모입니다. (※ 세부 장소 등은 확정되는 대로 별도 공지드리며,
                  운영 상황에 따라 변동될 수 있어요.)
                </p>
              </Box>
            </div>

            <div className="mt-7 space-y-7">
              <Field
                id="오프라인참여"
                label="Q15. 4회차 오프라인 모임 참여 가능 여부"
                required
                error={err("오프라인참여")}
              >
                <RadioGroup
                  options={OFFLINE_OPTIONS}
                  value={answers.오프라인참여}
                  onChange={(v) => set("오프라인참여", v)}
                  error={err("오프라인참여")}
                />
              </Field>
              <Field
                id="지역"
                label="Q16. 거주·근무 지역"
                required
                error={err("지역")}
              >
                <TextInput
                  value={answers.지역}
                  onChange={(v) => set("지역", v)}
                  placeholder="예) 서울 강남구 / 경기 성남시"
                  error={err("지역")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── SECTION 7: 부조장 지원 ── */}
          <SectionCard>
            <SectionLabel
              n={7}
              emoji="🙌"
              title="부조장 지원 — 더 깊이 가져가고 싶다면"
            />
            <div className="space-y-3 text-[15px] leading-relaxed text-neutral-700">
              <p>
                고객의눈은 조별로 운영됩니다. 각
                조에는 조장과 함께, 조원들을 적극적으로 챙기고 활동하는 부조장이
                있어요.
              </p>
              <p>
                부조장은 누군가를 가르치는 자리가 아닙니다. 조장과 함께{" "}
                <strong>조원들을 적극적으로 챙기고, 본인의 인사이트를 가장 먼저
                나누며 공유해 주는 역할</strong>이에요. 특히{" "}
                <strong>&lsquo;이기적공유&rsquo;</strong> — 적극적으로 챙기고
                공유할수록 본인에게도 더 큰 장점이 되는 자리예요.
              </p>
              <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="font-bold text-neutral-900">부조장이 되려면</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-[14px]">
                  <li><strong>모든 세션(7회차) 참여</strong>가 가능해야 합니다.</li>
                  <li>조별 채널에서 조원들을 <strong>독려</strong>해 주세요.</li>
                  <li>조끼리 모여서 과제를 함께하는 <strong>모각공(모여서 각자 공부)</strong>에서 조원들을 챙겨줄 수 있어야 합니다.</li>
                </ul>
              </div>
              <div className="mt-3 rounded-xl border-2 border-pop bg-pop/10 px-4 py-4">
                <p className="font-bold text-neutral-900">🎁 부조장 지원자 특별 혜택</p>
                <p className="mt-2 text-[15px] font-extrabold text-neutral-900">돈으로도 살 수 없는 스페셜 셸 10개 추가 지급!</p>
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-700">💎 일반 참여자보다 스페셜 셸 10개를 더 받을 수 있습니다. 돈으로도 살 수 없는 특별한 보상, 부조장 지원자만의 혜택입니다.</p>
              </div>
            </div>
            <div className="mt-6 space-y-7">
              <Field
                id="부조장지원"
                label="Q17. 부조장으로 지원하실 의향이 있으신가요?"
                required
                error={err("부조장지원")}
              >
                <RadioGroup
                  options={SUBLEADER_OPTIONS}
                  value={answers.부조장지원}
                  onChange={(v) => set("부조장지원", v)}
                  error={err("부조장지원")}
                />
              </Field>
              <Field id="부조장이유" label="Q18. 부조장에 지원하신 이유">
                <TextInput
                  value={answers.부조장이유}
                  onChange={(v) => set("부조장이유", v)}
                  placeholder="(선택) 자유롭게 적어주세요"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── SECTION 8: 마지막 ── */}
          <SectionCard>
            <SectionLabel n={8} emoji="✍️" title="마지막 — 본인의 언어로" />
            <p className="mb-5 text-[15px] leading-relaxed text-neutral-700">
              세 문항이 남았습니다. 본인의 언어로 적어주세요.
            </p>

            <div className="mb-6">
              <Box variant="plain">
                <p className="font-bold">💰 비용 안내</p>
                <p className="mt-1.5 leading-relaxed text-neutral-700">
                  5주 동안은 기본적으로 Claude를 사용하며, 필요에 따라 추가 API나
                  다른 툴이 더해질 수 있습니다. Claude 유료 계정 기준 사용 깊이에
                  따라 <strong>월 $100 ~ $200 수준</strong>의 비용이 발생할 수
                  있다는 점도 함께 인지하시고 답해주세요.
                </p>
              </Box>
            </div>

            <div className="space-y-7">
              <Field
                id="기억되고싶은모습"
                label="Q19. 5주 뒤, 고객의눈 크루들에게 어떤 사람으로 기억되고 싶으신가요?"
                required
                error={err("기억되고싶은모습")}
              >
                <TextArea
                  value={answers.기억되고싶은모습}
                  onChange={(v) => set("기억되고싶은모습", v)}
                  rows={4}
                  error={err("기억되고싶은모습")}
                />
              </Field>
              <Field
                id="집중영역"
                label="Q20. 이번 기간 동안 본인이 시간과 비용을 아낌없이 써보고 싶은 영역은 무엇인가요?"
                hint="아직 고민 중이라면 '고민 중'이라고 적으셔도 돼요."
                required
                error={err("집중영역")}
              >
                <TextArea
                  value={answers.집중영역}
                  onChange={(v) => set("집중영역", v)}
                  rows={4}
                  error={err("집중영역")}
                />
              </Field>
              <Field
                id="다짐"
                label="Q21. 마지막으로, 5주 동안 본인에게 하는 다짐과 이번 클럽에서 얻고자 하는 바를 적어주세요."
                required
                error={err("다짐")}
              >
                <TextArea
                  value={answers.다짐}
                  onChange={(v) => set("다짐", v)}
                  rows={5}
                  error={err("다짐")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── 제출 영역 ── */}
          <div className="pt-2">
            {showErrors && errors.size > 0 && (
              <div className="mb-4 rounded-xl border-2 border-red-500/60 bg-red-950/40 px-4 py-3 text-[15px] font-semibold text-red-300">
                ⚠️ 작성하지 않은 필수 항목이 있어요.
              </div>
            )}
            <div className="mb-4 rounded-xl border-2 border-red-500/60 bg-red-950/40 px-4 py-3 text-center text-[14px] text-neutral-200">
              <p><strong>Step 1(사전 서베이) + Step 2(온보딩)</strong>: <strong className="text-red-300">9/2(화) 오후 7시(19:00)</strong>까지</p>
              <p className="mt-1 text-[13px] text-neutral-400">모두 완료해야 셋업데이 참여가 가능합니다.</p>
            </div>
            <p className="mb-3 text-center text-[14px] text-muted">
              제출 후에는 답변을 수정할 수 없습니다.
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-2xl bg-pop py-4 text-[17px] font-extrabold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "제출 중…" : "제출하기 👁️"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
