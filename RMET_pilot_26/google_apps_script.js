// Приём данных пилота и запись CSV в репозиторий GitHub (порциями по 12 проб, каждая порция — новый файл;
// в конце пройденной сессии — ещё и цельный файл сессии),
// а также выдача номеров новым участникам: 1, 2, 3… по порядку.
//
// Свойства скрипта (Project Settings → Script properties):
//   GITHUB_TOKEN      — fine-grained token с доступом Contents: Read and write только к репозиторию с данными;
//   SHARED_SECRET     — та же строка, что CONFIG.secret в script.js;
//   NEXT_PARTICIPANT  — следующий номер участника; создаётся сам (с 1). Удалить свойство — нумерация начнётся заново.
//   GROUP_OF, COMPLETED — группа каждого участника и номера тех, кто прошёл все 4 сессии; создаются сами.
//   Группу новому участнику дают ту, где меньше всего прошедших все сессии (при равенстве — меньше назначенных),
//   поэтому выбывшие участники не нарушают баланс групп. Чтобы начать набор заново, удалите все три свойства.
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
    if (req.action === "participant_group") return participantGroup(props, req.participantId);

    const pid = String(req.participantId || "").replace(/[^A-Za-z0-9_-]/g, "");
    const session = String(req.session || "").replace(/\D/g, "");
    const part = String(req.part || "").replace(/\D/g, "");
    if (!pid || !session || !req.csvData) return reply(false, "missing fields");

    // Файлы в папке участника: порция — 17_session2_part03_20261121_143005.csv,
    // цельный файл пройденной сессии — 17_session2_full_20261121_145012.csv.
    const stamp = Utilities.formatDate(new Date(), TIME_ZONE, "yyyyMMdd_HHmmss");
    const kind = req.whole === true ? "_full" : part ? "_part" + ("0" + part).slice(-2) : "";
    const name = pid + "_session" + session + kind + "_" + stamp + ".csv";
    const path = FOLDER_PATH + "/" + pid + "/" + name;
    const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + path;
    const options = {
      method: "put",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        Authorization: "Bearer " + props.getProperty("GITHUB_TOKEN"),
        Accept: "application/vnd.github+json",
      },
      payload: JSON.stringify({
        message: "RMET pilot: " + pid + ", session " + session + (req.whole === true ? ", full" : part ? ", part " + part : ""),
        content: Utilities.base64Encode(req.csvData, Utilities.Charset.UTF_8),
        branch: BRANCH,
      }),
    };
    // Записи по одной: одновременные коммиты в репозиторий конфликтуют (GitHub отвечает 409).
    // При конфликте или сбое GitHub — до трёх попыток.
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      let code = 0;
      for (let attempt = 1; attempt <= 3; attempt++) {
        code = UrlFetchApp.fetch(url, options).getResponseCode();
        if (code !== 409 && code < 500) break;
        Utilities.sleep(1000 * attempt);
      }
      const ok = code === 200 || code === 201;
      if (ok && req.whole === true && session === "4") markCompleted(props, pid); // участник прошёл все сессии
      return reply(ok, "github " + code);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return reply(false, String(err));
  }
}

const GROUPS = 8;
const readJson = (props, key, empty) => JSON.parse(props.getProperty(key) || empty);

// Следующий номер участника и его группа. Блокировка нужна, чтобы двое участников, открывших страницу
// одновременно, не получили один и тот же номер.
function newParticipant(props) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const pid = Number(props.getProperty("NEXT_PARTICIPANT") || 1);
    const groupOf = readJson(props, "GROUP_OF", "{}");
    const completed = readJson(props, "COMPLETED", "[]");
    const done = new Array(GROUPS + 1).fill(0);
    const assigned = new Array(GROUPS + 1).fill(0);
    Object.keys(groupOf).forEach((p) => {
      assigned[groupOf[p]]++;
      if (completed.indexOf(p) >= 0) done[groupOf[p]]++;
    });
    let group = 1;
    for (let g = 2; g <= GROUPS; g++) {
      if (done[g] < done[group] || (done[g] === done[group] && assigned[g] < assigned[group])) group = g;
    }
    groupOf[String(pid)] = group;
    props.setProperties({ NEXT_PARTICIPANT: String(pid + 1), GROUP_OF: JSON.stringify(groupOf) });
    return reply(true, "new participant", { pid: pid, group: group });
  } finally {
    lock.releaseLock();
  }
}

// Группа уже назначенного участника (например, если он открыл ссылку на другом компьютере); 0 — неизвестна.
function participantGroup(props, participantId) {
  const groupOf = readJson(props, "GROUP_OF", "{}");
  return reply(true, "participant group", { group: groupOf[String(participantId)] || 0 });
}

// Отметка «прошёл все четыре сессии» (вызывается внутри блокировки записи).
function markCompleted(props, pid) {
  const completed = readJson(props, "COMPLETED", "[]");
  if (completed.indexOf(pid) < 0) {
    completed.push(pid);
    props.setProperty("COMPLETED", JSON.stringify(completed));
  }
}

function reply(ok, message, extra) {
  const body = Object.assign({ ok: ok, message: message }, extra || {});
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
