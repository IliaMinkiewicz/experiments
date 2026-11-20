// Приём данных пилота и запись CSV в репозиторий GitHub (по файлу на сессию, без перезаписи),
// а также выдача номеров новым участникам: 1, 2, 3… по порядку.
//
// Свойства скрипта (Project Settings → Script properties):
//   GITHUB_TOKEN      — fine-grained token с доступом Contents: Read and write только к репозиторию с данными;
//   SHARED_SECRET     — та же строка, что CONFIG.secret в script.js;
//   NEXT_PARTICIPANT  — следующий номер участника; создаётся сам (с 1). Удалить свойство — нумерация начнётся заново.
// Развёртывание: Deploy → New deployment → Web app; Execute as: Me; Who has access: Anyone.
// После изменения кода: Deploy → Manage deployments → карандаш → Version: New version → Deploy (адрес не меняется).
// Адрес веб-приложения вставляется в CONFIG.uploadUrl в script.js.

const REPO_OWNER = "IliaMinkiewicz";
const REPO_NAME = "experiments-data"; // закрытый репозиторий с данными
const BRANCH = "main";
const FOLDER_PATH = "RMET_pilot_26";
const TIME_ZONE = "Europe/Moscow";

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const req = JSON.parse(e.postData.contents);
    if (!req.secret || req.secret !== props.getProperty("SHARED_SECRET")) return reply(false, "forbidden");
    if (req.action === "new_participant") return newParticipant(props);

    const pid = String(req.participantId || "").replace(/[^A-Za-z0-9_-]/g, "");
    const session = String(req.session || "").replace(/\D/g, "");
    if (!pid || !session || !req.csvData) return reply(false, "missing fields");

    const stamp = Utilities.formatDate(new Date(), TIME_ZONE, "yyyyMMdd_HHmmss");
    const path = FOLDER_PATH + "/" + pid + "_session" + session + "_" + stamp + ".csv";
    const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + path;
    const res = UrlFetchApp.fetch(url, {
      method: "put",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        Authorization: "Bearer " + props.getProperty("GITHUB_TOKEN"),
        Accept: "application/vnd.github+json",
      },
      payload: JSON.stringify({
        message: "RMET pilot: " + pid + ", session " + session,
        content: Utilities.base64Encode(req.csvData, Utilities.Charset.UTF_8),
        branch: BRANCH,
      }),
    });
    const code = res.getResponseCode();
    return reply(code === 200 || code === 201, "github " + code);
  } catch (err) {
    return reply(false, String(err));
  }
}

// Следующий номер участника. Блокировка нужна, чтобы двое участников, открывших страницу
// одновременно, не получили один и тот же номер.
function newParticipant(props) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const pid = Number(props.getProperty("NEXT_PARTICIPANT") || 1);
    props.setProperty("NEXT_PARTICIPANT", String(pid + 1));
    return reply(true, "new participant", { pid: pid });
  } finally {
    lock.releaseLock();
  }
}

function reply(ok, message, extra) {
  const body = Object.assign({ ok: ok, message: message }, extra || {});
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
