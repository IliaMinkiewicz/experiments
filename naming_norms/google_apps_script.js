/* ============================================================
   ПРИЁМНИК ДАННЫХ АПРОБАЦИИ НАЗЫВАНИЙ
   Google Apps Script -> коммит в приватный репозиторий GitHub.

   Как развернуть:
   0. Создать ПРИВАТНЫЙ репозиторий naming-norms-data с папкой data/ (см. README).
   1. script.google.com -> Новый проект, вставить этот файл.
   2. Заполнить блок НАСТРОЙКИ ниже.
   3. Развернуть -> Новое развёртывание -> Тип «Веб-приложение».
      Запуск от имени: я. Доступ: у всех.
   4. Скопировать URL вида .../exec и вставить в config.js -> uploadUrl.
   5. Токен GitHub: fine-grained, доступ ТОЛЬКО к репозиторию naming-norms-data,
      права Contents: Read and write. Больше ничего не нужно.
      Доступ к experiments этому токену НЕ требуется: задание туда кладётся руками.

   Важно: каждая порция сохраняется отдельным файлом. Это намеренно —
   так параллельные участники не затирают друг друга (read-modify-write
   при дозаписи в один файл даёт гонку и потерю данных).
   ============================================================ */

// ----------------- НАСТРОЙКИ -----------------
// ВАЖНО: данные пишутся в ОТДЕЛЬНЫЙ ПРИВАТНЫЙ репозиторий, а не рядом с заданием.
// Репозиторий с заданием обязан быть публичным — этого требует GitHub Pages, — и всё,
// что лежит в нём, читает кто угодно. В файлах ответов есть возраст, пол, ответ про
// родной язык, идентификатор исполнителя с площадки и сведения о браузере; выкладывать
// это в открытый доступ нельзя.
// Побочная выгода: чужой репозиторий не собирается через Pages, поэтому вопрос
// с лимитом сборок отпадает сам и ветка нужна обычная — main.
const GITHUB_TOKEN = "ВСТАВИТЬ_FINE_GRAINED_TOKEN";  // доступ к naming-norms-data, Contents R/W
const REPO_OWNER   = "IliaMinkiewicz";
const REPO_NAME    = "naming-norms-data";     // ПРИВАТНЫЙ, отдельный от experiments
const BRANCH       = "main";
const FOLDER       = "data";
const SHARED_SECRET = "NAMING_NORMS_2026";     // должен совпадать с config.js
const ACCEPTING    = true;                     // false — приём закрыт, данные не пишутся
const MAX_BODY     = 300000;                   // символов на запрос
// ---------------------------------------------

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: "empty" });
    if (e.postData.contents.length > MAX_BODY)     return json({ ok: false, error: "too_large" });

    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SHARED_SECRET) return json({ ok: false, error: "bad_secret" });
    if (!ACCEPTING)                    return json({ ok: false, error: "closed" });
    if (body.action !== "save")        return json({ ok: false, error: "bad_action" });

    const pid  = sanitize(body.pid || "anon");
    const code = sanitize(body.code || "nocode");
    const list = String(parseInt(body.list, 10) || 0);
    const rows = Array.isArray(body.rows) ? body.rows : [];
    if (!rows.length && !body.final) return json({ ok: true, saved: 0 });

    const stamp = Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss-SSS");
    const name  = pid + "__" + code + "__" + stamp + (body.final ? "__final" : "") + ".json";
    const path  = FOLDER + "/L" + list + "/" + name;

    const payload = JSON.stringify({
      pid: pid, code: code, list: list, final: !!body.final,
      meta: body.meta || null, rows: rows,
      received: new Date().toISOString()
    }, null, 1);

    putFile(path, payload, "naming data " + pid + " L" + list);
    return json({ ok: true, saved: rows.length, file: name });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.secret !== SHARED_SECRET) return json({ ok: false, error: "bad_secret" });

  if (p.action === "ping") return json({ ok: true, accepting: ACCEPTING });

  if (p.action === "counts") {              // сколько участников ЗАВЕРШИЛО каждый список
    // Считаем по файлам с суффиксом __final: они пишутся только на экране «Спасибо».
    // Брошенные на середине прогоны в счёт не идут — иначе список закрывался бы
    // от людей, которые до конца не дошли.
    const counts = {};
    for (let L = 1; L <= 3; L++) {
      const pids = {};
      listFolder(FOLDER + "/L" + L).forEach(f => {
        if (f.indexOf("__final") !== -1) pids[f.split("__")[0]] = 1;
      });
      counts["L" + L] = Object.keys(pids).length;
    }
    return json({ ok: true, counts: counts });
  }

  if (p.action === "verify") {              // сколько порций уже принято от участника
    const list = String(parseInt(p.list, 10) || 0);
    const pid  = sanitize(p.pid || "");
    const files = listFolder(FOLDER + "/L" + list);
    const mine  = files.filter(f => f.indexOf(pid + "__") === 0);
    return json({ ok: true, chunks: mine.length, files: mine });
  }
  return json({ ok: false, error: "bad_action" });
}

function doOptions() {                       // preflight, если фронт пришлёт нестандартные заголовки
  return ContentService.createTextOutput("");
}

// ----------------- GitHub -----------------
function ghHeaders() {
  return {
    Authorization: "Bearer " + GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function putFile(path, content, message) {
  const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME + "/contents/" + path;
  const res = UrlFetchApp.fetch(url, {
    method: "put",
    headers: ghHeaders(),
    contentType: "application/json",
    muteHttpExceptions: true,
    payload: JSON.stringify({
      message: message,
      content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
      branch: BRANCH
    })
  });
  const code = res.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error("github " + code + ": " + res.getContentText().slice(0, 200));
  }
}

function listFolder(path) {
  const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME +
              "/contents/" + path + "?ref=" + BRANCH;
  const res = UrlFetchApp.fetch(url, { headers: ghHeaders(), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return [];
  return JSON.parse(res.getContentText()).map(f => f.name);
}

// ----------------- прочее -----------------
function sanitize(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64); }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
                       .setMimeType(ContentService.MimeType.JSON);
}

/** Ручная проверка: запустить в редакторе, должно записать тестовый файл. */
function selfTest() {
  putFile(FOLDER + "/_selftest.json",
          JSON.stringify({ ok: true, at: new Date().toISOString() }), "selftest");
  Logger.log("записан " + FOLDER + "/_selftest.json");
}
