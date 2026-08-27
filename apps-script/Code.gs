/**
 * 고객의눈 — Claude Code 설치 가이드 제출 데이터 수집
 *
 * 배포 방법:
 *  1) Google 스프레드시트 생성
 *  2) 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 *  3) 배포 → 새 배포 → 유형: 웹 앱
 *     - 실행: 나
 *     - 액세스: 모든 사용자
 *  4) 생성된 /exec URL 복사 → 프론트엔드 lib/config.ts 의 SCRIPT_URL 에 붙여넣기
 *
 * 시트 탭:
 *   - "응답" — 준비 완료 제출 데이터
 */

var SHEET_NAME = "응답";

var HEADERS = [
  "timestamp",
  "성함",
  "OS",
  "claude.ai 접속 후 계정 생성(또는 로그인) 완료",
  "요금제 확인 — Max 플랜 구독 완료",
  "다운로드 페이지에서 Mac 버전 다운로드",
  "파일 열고 Claude 아이콘을 응용 프로그램 폴더로 드래그",
  "앱 실행 후 계정 로그인",
  "앱 안에서 Claude Code 메뉴 확인",
  "설치 안내창이 뜨면 \"설치\" 버튼 승인",
  "다운로드 페이지에서 Windows 버전 클로드 앱 설치",
  "Git for Windows 설치 (모든 선택지 기본값 Next)",
  "클로드 앱 완전히 종료 후 재실행",
  "Claude Code 메뉴에서 \"Git 설치\" 안내가 사라진 것 확인",
  "github.com에서 가입 완료 (구글 계정 로그인 권장)",
  "vercel.com에서 \"Continue with GitHub\"로 가입 완료"
];

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet(ss, SHEET_NAME, HEADERS);

    var row = HEADERS.map(function (h) {
      if (h === "timestamp") return new Date();
      var v = data[h];
      return v == null ? "" : v;
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var callback = p.callback;

  function out(obj) {
    var json = JSON.stringify(obj);
    if (callback) {
      return ContentService.createTextOutput(
        callback + "(" + json + ")"
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2)
    return out({ result: "success", rows: [] });

  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var rows = values.map(function (r) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = r[i];
    });
    return obj;
  });
  return out({ result: "success", rows: rows });
}
