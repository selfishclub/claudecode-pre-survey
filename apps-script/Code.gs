/**
 * 고객의눈 사전 서베이 + 온보딩 — Google Apps Script 웹앱 백엔드
 *
 * 배포 방법:
 *  1) 고객의눈 전용 Google 스프레드시트 생성
 *  2) 확장 프로그램 → Apps Script → 이 코드 붙여넣기
 *  3) 배포 → 새 배포 → 유형: 웹 앱
 *     - 실행: 나
 *     - 액세스: 모든 사용자
 *  4) 생성된 /exec URL 복사 → 프론트엔드 lib/config.ts 의 SCRIPT_URL 에 붙여넣기
 *
 * 시트 탭:
 *   - "응답" — 사전 서베이 제출 데이터
 *   - "온보딩" — 온보딩 체크리스트 제출 데이터
 */

var SURVEY_SHEET = "응답";
var ONBOARDING_SHEET = "온보딩";

var SURVEY_HEADERS = [
  "timestamp", "본명", "이메일", "연락처", "연령대", "GitHub이메일",
  "현재하는일", "카테고리", "준비상태", "비즈니스상태", "도메인",
  "나눌수있는것", "궁금한분야", "만나고싶은사람", "인스타그램", "스레드", "링크드인", "블로그",
  "동의_멤버약속", "동의_이용약관", "동의_콘텐츠활용",
  "AI사용경험", "바이브코딩", "Claude사용", "막힌부분",
  "시간확보", "포기할것", "불참일정", "불참사유", "오프라인참여", "지역",
  "부조장지원", "부조장이유",
  "기억되고싶은모습", "집중영역", "다짐"
];

var ONBOARDING_HEADERS = [
  "timestamp", "본명", "닉네임", "이메일",
  "슬랙 데스크탑 + 모바일 모두 설치",
  "워크스페이스에 입장 완료",
  "이름을 닉네임(본명) 형식으로 설정",
  "#00-공통-인사해요-sns친구해요 채널에 자기소개 남김",
  "깃허브 계정 생성 및 초대 수락",
  "클로드 데스크탑 앱 설치",
  "구독 계정으로 로그인",
  "클로드 코드 실행 확인",
  "VS Code 설치 + 확장 2개 설치",
  "VS Code에서 Claude Code 확장 설치 완료",
  "클로드코드로 사이트부터 어드민 깃허브까지 1 시청",
  "클로드코드로 사이트부터 어드민 깃허브까지 2 시청",
  "이기적공유회 — 비즈니스 코어 만들기 시청"
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

    // 온보딩 제출
    if (data.type === "onboarding") {
      var obSheet = getOrCreateSheet(ss, ONBOARDING_SHEET, ONBOARDING_HEADERS);
      var obRow = ONBOARDING_HEADERS.map(function (h) {
        if (h === "timestamp") return new Date();
        var v = data[h];
        return v == null ? "" : v;
      });
      obSheet.appendRow(obRow);
      return ContentService.createTextOutput(
        JSON.stringify({ result: "success", sheet: "onboarding" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 사전 서베이 제출
    var sheet = getOrCreateSheet(ss, SURVEY_SHEET, SURVEY_HEADERS);
    var row = SURVEY_HEADERS.map(function (h) {
      if (h === "timestamp") return new Date();
      var v = data[h];
      return Array.isArray(v) ? v.join(", ") : v == null ? "" : v;
    });
    sheet.appendRow(row);
    return ContentService.createTextOutput(
      JSON.stringify({ result: "success", sheet: "survey" })
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
  var sheet = ss.getSheetByName(SURVEY_SHEET);
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
