// 고객의눈 어드민 API 클라이언트
export type ResponseRow = Record<string, string>;

export async function fetchResponses(): Promise<ResponseRow[]> {
  const res = await fetch("/api/admin");
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (data.result !== "success") throw new Error(data.message || data.result);
  return data.rows || [];
}
