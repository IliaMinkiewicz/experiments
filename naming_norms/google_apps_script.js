// Приёмник данных апробации: порции ответов -> приватный репозиторий naming-norms-data.
// Развёртывание описано в README.

// настройки
const GITHUB_TOKEN = "ВСТАВИТЬ_FINE_GRAINED_TOKEN";  // fine-grained, Contents R/W
const REPO_OWNER   = "IliaMinkiewicz";
const REPO_NAME    = "naming-norms-data";     // приватный
const BRANCH       = "main";
const FOLDER       = "data";
const SHARED_SECRET = "NAMING_NORMS_2026";     // как в config.js
const ACCEPTING    = true;                     // false — приём закрыт
const MAX_BODY     = 300000;                   // символов на запрос

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

  if (p.action === "counts") {              // законченные части по спискам, включая вторые и третьи
    const done = { 1: {}, 2: {}, 3: {} };
    listData().forEach(f => {
      const m = f.match(/\/L(\d+)\/([^\/]+?)__([^\/]+?)__[^\/]*__final\.json$/);
      const L = m ? Number(m[1]) % 10 : 0;
      if (done[L]) done[L][m[2] + "__" + m[3]] = 1;
    });
    const counts = {};
    for (let L = 1; L <= 3; L++) counts["L" + L] = Object.keys(done[L]).length;
    return json({ ok: true, counts: counts });
  }

  if (p.action === "verify") {              // принятые порции участника
    const pre  = FOLDER + "/L" + (parseInt(p.list, 10) || 0) + "/" + sanitize(p.pid || "") + "__";
    const mine = listData().filter(f => f.indexOf(pre) === 0).map(f => f.split("/").pop());
    return json({ ok: true, chunks: mine.length, files: mine });
  }
  return json({ ok: false, error: "bad_action" });
}

// все файлы данных одним запросом: список папки через contents отдаёт не больше 1000
function listData() {
  const url = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME +
              "/git/trees/" + BRANCH + "?recursive=1";
  const res = UrlFetchApp.fetch(url, { headers: ghHeaders(), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return [];
  return JSON.parse(res.getContentText()).tree
    .filter(t => t.type === "blob" && t.path.indexOf(FOLDER + "/") === 0)
    .map(t => t.path);
}

function doOptions() {
  return ContentService.createTextOutput("");
}

// GitHub
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


function sanitize(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64); }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
                       .setMimeType(ContentService.MimeType.JSON);
}

// проверка записи: запустить в редакторе
function selfTest() {
  putFile(FOLDER + "/_selftest.json",
          JSON.stringify({ ok: true, at: new Date().toISOString() }), "selftest");
  Logger.log("записан " + FOLDER + "/_selftest.json");
}
