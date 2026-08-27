"use client";

import { useMemo, useState, type ReactNode } from "react";
import { fetchResponses, type ResponseRow } from "@/lib/admin";
import {
  SHEET_KEYS,
  AGE_OPTIONS,
  TIME_COMMIT_OPTIONS,
  OFFLINE_OPTIONS,
  ABSENCE_OPTIONS,
  ABSENCE_ALL_OK,
  SUBJECTIVE_FIELDS,
} from "@/lib/survey";

const LABELS: Record<string, string> = {
  timestamp: "제출시각",
  본명: "본명",
  닉네임: "닉네임",
  이메일: "이메일",
  연락처: "연락처",
  연령대: "연령대",
  GitHub이메일: "GitHub 이메일",
  현재하는일: "현재 하는 일",
  카테고리: "카테고리",
  나눌수있는것: "크루카드 · 나눌 수 있는 것",
  궁금한분야: "크루카드 · 궁금한 분야",
  만나고싶은사람: "크루카드 · 만나고 싶은 사람",
  인스타그램: "Instagram",
  스레드: "Threads",
  링크드인: "LinkedIn",
  블로그: "Blog",
  동의_멤버약속: "동의 · 멤버약속",
  동의_이용약관: "동의 · 이용약관",
  동의_콘텐츠활용: "동의 · 콘텐츠활용",
  AI사용경험: "Q9. AI 사용 경험",
  바이브코딩: "Q10. 바이브 코딩",
  Claude사용: "Q11. Claude 사용",
  막힌부분: "Q12. 막힌 부분",
  시간확보: "Q13. 시간 확보",
  포기할것: "Q14. 포기할 것",
  불참일정: "Q15. 불참 일정",
  불참사유: "Q16. 불참 사유",
  오프라인참여: "Q17. 오프라인 참여",
  지역: "Q18. 지역",
  부조장지원: "Q19. 부조장 지원",
  부조장이유: "Q20. 부조장 이유",
  기억되고싶은모습: "Q21. 기억되고 싶은 모습",
  집중영역: "Q22. 집중 영역",
  다짐: "Q23. 다짐",
};

const fmtTime = (v: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString("ko-KR");
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-pop bg-pop/20" : "border-line bg-surface"
      }`}
    >
      <div className="text-[13px] font-semibold text-muted">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[13px] text-muted">{sub}</div>}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  highlight,
}: {
  label: string;
  count: number;
  total: number;
  highlight?: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-44 flex-none truncate text-[13.5px]" title={label}>
        {label}
      </div>
      <div className="h-5 flex-1 overflow-hidden rounded-md bg-white/10">
        <div
          className={`h-full ${highlight ? "bg-red-400" : "bg-pop"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-20 flex-none text-right text-[13px] tabular-nums text-muted">
        {count}명 · {pct}%
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-3 text-[15px] font-bold">{title}</h3>
      {children}
    </div>
  );
}

function distByOptions(rows: ResponseRow[], key: string, options: string[]) {
  return options.map((opt) => ({
    label: opt,
    count: rows.filter((r) => (r[key] || "") === opt).length,
  }));
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ResponseRow[]>([]);
  const [tab, setTab] = useState<"stats" | "list" | "cards" | "subjective">("stats");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchResponses();
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`데이터를 불러오지 못했습니다: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // 최초 로드
  useState(() => { load(); });

  if (loading && rows.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
        <div className="text-4xl">👁️</div>
        <h1 className="mt-4 text-xl font-extrabold">고객의눈 · 어드민</h1>
        <p className="mt-4 text-[14px] text-muted">불러오는 중…</p>
        {error && (
          <p className="mt-3 text-[13.5px] text-red-400">{error}</p>
        )}
      </main>
    );
  }

  return (
    <Dashboard
      rows={rows}
      tab={tab}
      setTab={setTab}
      onReload={load}
    />
  );
}

function Dashboard({
  rows,
  tab,
  setTab,
  onReload,
}: {
  rows: ResponseRow[];
  tab: "stats" | "list" | "cards" | "subjective";
  setTab: (t: "stats" | "list" | "cards" | "subjective") => void;
  onReload: () => void;
}) {
  const total = rows.length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">👁️ 고객의눈 · 어드민</h1>
        <button
          onClick={onReload}
          className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold hover:bg-white/5"
        >
          새로고침
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-line overflow-x-auto">
        {[
          { k: "stats", label: "📊 통계" },
          { k: "list", label: "🗂 응답 목록" },
          { k: "cards", label: "🪪 크루카드" },
          { k: "subjective", label: "📝 주관식" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as typeof tab)}
            className={`-mb-px border-b-2 px-3 py-2 text-[14px] font-semibold transition whitespace-nowrap ${
              tab === t.k
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-muted">
          아직 응답이 없습니다.
        </div>
      ) : tab === "stats" ? (
        <StatsTab rows={rows} />
      ) : tab === "list" ? (
        <ListTab rows={rows} />
      ) : tab === "cards" ? (
        <CrewCardsTab rows={rows} />
      ) : (
        <SubjectiveTab rows={rows} />
      )}
    </main>
  );
}

/* ── 탭 A: 통계 ── */
function StatsTab({ rows }: { rows: ResponseRow[] }) {
  const total = rows.length;
  const isY = (v?: string) => (v || "").toUpperCase() === "Y";

  const memberY = rows.filter((r) => isY(r["동의_멤버약속"])).length;
  const termsY = rows.filter((r) => isY(r["동의_이용약관"])).length;
  const contentY = rows.filter((r) => isY(r["동의_콘텐츠활용"])).length;
  const allConsent = rows.filter(
    (r) =>
      isY(r["동의_멤버약속"]) &&
      isY(r["동의_이용약관"]) &&
      isY(r["동의_콘텐츠활용"]),
  ).length;

  const catMap = new Map<string, number>();
  rows.forEach((r) => {
    const c = (r["카테고리"] || "(미입력)").trim() || "(미입력)";
    catMap.set(c, (catMap.get(c) || 0) + 1);
  });
  const catDist = [...catMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const ageDist = distByOptions(rows, "연령대", AGE_OPTIONS);
  const timeDist = distByOptions(rows, "시간확보", TIME_COMMIT_OPTIONS);
  const offlineDist = distByOptions(rows, "오프라인참여", OFFLINE_OPTIONS);

  const timeRisk = timeDist
    .filter((d) => d.label.startsWith("⚠️") || d.label.startsWith("❌"))
    .reduce((s, d) => s + d.count, 0);
  const offlineOk = offlineDist.find((d) => d.label.startsWith("✅"))?.count ?? 0;

  const absenceOpts = [...ABSENCE_OPTIONS, ABSENCE_ALL_OK];
  const absenceDist = absenceOpts.map((opt) => ({
    label: opt,
    count: rows.filter((r) => (r["불참일정"] || "").includes(opt)).length,
  }));

  const subleaders = rows.filter((r) =>
    (r["부조장지원"] || "").startsWith("✅"),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="총 응답 수" value={total} accent />
        <StatCard
          label="동의 3종 모두 완료"
          value={allConsent}
          sub={`${total > 0 ? Math.round((allConsent / total) * 100) : 0}%`}
        />
        <StatCard
          label="시간확보 리스크 (⚠️·❌)"
          value={timeRisk}
          sub="운영 리스크 인원"
        />
        <StatCard
          label="오프라인(4회차) 참여 예상"
          value={offlineOk}
          sub="✅ 응답 수"
        />
      </div>

      <Panel title="동의 완료율">
        <BarRow label="멤버의 약속" count={memberY} total={total} />
        <BarRow label="이용약관" count={termsY} total={total} />
        <BarRow label="콘텐츠 활용" count={contentY} total={total} />
        <div className="mt-2 border-t border-line pt-2">
          <BarRow label="3종 모두 동의" count={allConsent} total={total} />
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="카테고리 분포 (Q8)">
          {catDist.map((d) => (
            <BarRow key={d.label} label={d.label} count={d.count} total={total} />
          ))}
        </Panel>
        <Panel title="연령대 분포 (Q5)">
          {ageDist.map((d) => (
            <BarRow key={d.label} label={d.label} count={d.count} total={total} />
          ))}
        </Panel>
        <Panel title="시간 확보 (Q13)">
          {timeDist.map((d) => (
            <BarRow
              key={d.label}
              label={d.label}
              count={d.count}
              total={total}
              highlight={d.label.startsWith("⚠️") || d.label.startsWith("❌")}
            />
          ))}
        </Panel>
        <Panel title="오프라인 참여 (Q17)">
          {offlineDist.map((d) => (
            <BarRow
              key={d.label}
              label={d.label}
              count={d.count}
              total={total}
              highlight={d.label.startsWith("❌")}
            />
          ))}
        </Panel>
      </div>

      <Panel title="주차별 불참/불확실 집계 (Q15)">
        {absenceDist.map((d) => (
          <BarRow
            key={d.label}
            label={d.label}
            count={d.count}
            total={total}
            highlight={!d.label.startsWith("✅")}
          />
        ))}
      </Panel>

      <Panel title={`부조장 지원 (Q19) — ${subleaders.length}명`}>
        {subleaders.length === 0 ? (
          <p className="text-[13.5px] text-muted">아직 지원자가 없습니다.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subleaders.map((r, i) => (
              <span
                key={i}
                className="rounded-full border border-pop bg-pop/20 px-3 py-1 text-[13.5px] font-semibold"
              >
                {r["닉네임"] || "(닉네임 없음)"}
              </span>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ── 탭 B: 응답 목록 ── */
function ListTab({ rows }: { rows: ResponseRow[] }) {
  const [q, setQ] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const arr = rows
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        if (!kw) return true;
        return (
          (r["닉네임"] || "").toLowerCase().includes(kw) ||
          (r["카테고리"] || "").toLowerCase().includes(kw) ||
          (r["본명"] || "").toLowerCase().includes(kw)
        );
      });
    arr.sort((a, b) => {
      const ta = new Date(a.r["timestamp"] || 0).getTime();
      const tb = new Date(b.r["timestamp"] || 0).getTime();
      return sortDesc ? tb - ta : ta - tb;
    });
    return arr;
  }, [rows, q, sortDesc]);

  const downloadCSV = () => {
    const headers = ["timestamp", ...SHEET_KEYS];
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.map((h) => esc(LABELS[h] || h)).join(","),
      ...rows.map((r) => headers.map((h) => esc(r[h] || "")).join(",")),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "고객의눈_응답.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="닉네임 · 본명 · 카테고리 검색"
          className="min-w-[220px] flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-pop/60"
        />
        <button
          onClick={() => setSortDesc((s) => !s)}
          className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold hover:bg-white/5"
        >
          제출시각 {sortDesc ? "최신순 ↓" : "오래된순 ↑"}
        </button>
        <button
          onClick={downloadCSV}
          className="rounded-lg bg-pop px-3 py-2 text-[13px] font-semibold text-black hover:opacity-90"
        >
          CSV 다운로드
        </button>
      </div>

      <p className="mb-3 text-[13px] text-muted">
        {filtered.length}건 표시 (전체 {rows.length}건)
      </p>

      <div className="space-y-2.5">
        {filtered.map(({ r, idx }) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5"
            >
              <div className="min-w-0">
                <div className="truncate font-bold">
                  {r["닉네임"] || "(닉네임 없음)"}
                  <span className="ml-2 text-[13px] font-normal text-muted">
                    {r["본명"]}
                  </span>
                </div>
                <div className="truncate text-[13px] text-muted">
                  {r["카테고리"]} · {fmtTime(r["timestamp"])}
                </div>
              </div>
              <span className="flex-none text-muted">
                {open === idx ? "▲" : "▼"}
              </span>
            </button>
            {open === idx && (
              <div className="border-t border-line bg-white/[0.03] px-4 py-3">
                <dl className="space-y-2.5">
                  {["timestamp", ...SHEET_KEYS].map((k) => (
                    <div key={k}>
                      <dt className="text-[12.5px] font-semibold text-muted">
                        {LABELS[k] || k}
                      </dt>
                      <dd className="whitespace-pre-wrap text-[14px]">
                        {k === "timestamp" ? fmtTime(r[k]) : r[k] || "-"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 탭 C: 크루카드 모아보기 ── */
function CrewCardsTab({ rows }: { rows: ResponseRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter(
      (r) =>
        (r["닉네임"] || "").toLowerCase().includes(kw) ||
        (r["본명"] || "").toLowerCase().includes(kw) ||
        (r["카테고리"] || "").toLowerCase().includes(kw),
    );
  }, [rows, q]);

  return (
    <div>
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="닉네임 · 본명 · 카테고리 검색"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-pop/60 sm:w-80"
        />
      </div>
      <p className="mb-4 text-[13px] text-muted">
        {filtered.length}명 표시 (전체 {rows.length}명)
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((r, i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pop/30 text-xl">
                👁️
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-extrabold">
                  {r["닉네임"] || r["본명"]}({r["본명"]})
                </div>
                <div className="truncate text-[12px] text-muted">
                  {r["카테고리"]} · {r["현재하는일"]}
                </div>
              </div>
            </div>

            {/* 본문 */}
            <div className="space-y-3 text-[13px]">
              {r["나눌수있는것"] && (
                <div>
                  <div className="font-bold text-muted text-[11px] mb-0.5">내가 나눌 수 있는 것</div>
                  <div className="whitespace-pre-wrap">{r["나눌수있는것"]}</div>
                </div>
              )}
              {r["궁금한분야"] && (
                <div>
                  <div className="font-bold text-muted text-[11px] mb-0.5">궁금한 분야</div>
                  <div className="whitespace-pre-wrap">{r["궁금한분야"]}</div>
                </div>
              )}
              {r["만나고싶은사람"] && (
                <div>
                  <div className="font-bold text-muted text-[11px] mb-0.5">이런 사람과 얘기하고 싶어요</div>
                  <div className="whitespace-pre-wrap">{r["만나고싶은사람"]}</div>
                </div>
              )}
            </div>

            {/* SNS 링크 */}
            {(r["인스타그램"] || r["스레드"] || r["링크드인"] || r["블로그"]) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {r["인스타그램"] && (
                  <a
                    href={r["인스타그램"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white/5 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/10 transition"
                  >
                    Instagram ↗
                  </a>
                )}
                {r["스레드"] && (
                  <a
                    href={r["스레드"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white/5 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/10 transition"
                  >
                    Threads ↗
                  </a>
                )}
                {r["링크드인"] && (
                  <a
                    href={r["링크드인"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white/5 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/10 transition"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {r["블로그"] && (
                  <a
                    href={r["블로그"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white/5 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/10 transition"
                  >
                    Blog ↗
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 탭 D: 주관식 모아보기 ── */
function SubjectiveTab({ rows }: { rows: ResponseRow[] }) {
  const [field, setField] = useState<string>(SUBJECTIVE_FIELDS[0].key);

  return (
    <div>
      <div className="mb-4">
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-[14px] outline-none focus:border-ink sm:w-auto"
        >
          {SUBJECTIVE_FIELDS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {rows.map((r, i) => {
          const ans = (r[field] || "").trim();
          return (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="mb-1 text-[13px] font-bold">
                {r["닉네임"] || "(닉네임 없음)"}
                <span className="ml-2 font-normal text-muted">
                  {r["카테고리"]}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">
                {ans || <span className="text-muted">(미응답)</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
