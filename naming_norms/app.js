/* ============================================================
   АПРОБАЦИЯ НАЗЫВАНИЙ — логика эксперимента
   Зависимости: config.js, stimuli.json. Внешних библиотек нет.
   ============================================================ */
(function () {
"use strict";

// ---------- утилиты ----------
const $ = (id) => document.getElementById(id);
const show = (id) => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
};
const log = (msg) => {
  if (!CONFIG.debug) return;
  const d = $("debug"); d.classList.remove("hidden");
  d.textContent += msg + "\n"; d.scrollTop = d.scrollHeight;
};
// генератор с сидом: одна и та же последовательность воспроизводима
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randCode(n) {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

// ---------- состояние ----------
const params  = new URLSearchParams(location.search);
const LIST    = parseInt(params.get("list") || "1", 10);
const WORKER  = (params.get("w") || params.get("worker") || "").slice(0, 64);
const PID     = WORKER || ("anon_" + randCode(8));
const CODE    = "NM-" + randCode(6);
const SEED    = Math.floor(Math.random() * 1e9);
const STORE   = "naming_" + PID + "_L" + LIST;

const S = {
  trials: [], idx: 0, rows: [], pending: [],
  answer: "", ease: null, tOnset: 0, tFirstKey: 0,
  demo: {}, phase: "train", startedAt: new Date().toISOString()
};

// ---------- проверки на входе ----------
function gateChecks() {
  if (!CONFIG.enabled) { show("screen-closed"); return false; }
  const mobileUA = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent);
  if (mobileUA || window.innerWidth < CONFIG.minWidth) { show("screen-device"); return false; }
  if (![1, 2, 3].includes(LIST)) {
    show("screen-closed");
    $("screen-closed").querySelector("p").textContent =
      "Ссылка открыта без номера списка. Вернитесь к заданию и перейдите по ссылке из него.";
    return false;
  }
  return true;
}

// ---------- загрузка стимулов ----------
let STIM = null;
function loadStimuli() {
  return fetch("stimuli.json", { cache: "no-store" })
    .then(r => r.json())
    .then(j => { STIM = j; });
}

function buildTrials() {
  const rnd = mulberry32(SEED);

  const train = STIM.train.map((t, i) => ({
    kind: "train", pos: i + 1, id: t.id, file: "train/" + t.file, text: null
  }));

  const main = STIM.items
    .filter(it => it.list === LIST)
    .map(it => ({ kind: "main", id: it.id, file: "img/" + it.file, text: null,
                  check: it.check || "" }));

  // две прямые проверки внимания — вставляются в случайные позиции второй и третьей четверти
  const checks = [
    { kind: "check", id: "check_stol", file: null, expect: "стол",
      text: "Это проверка внимания. Не описывайте картинку — просто напишите в поле ниже слово «стол»." },
    { kind: "check", id: "check_dom", file: null, expect: "дом",
      text: "Это проверка внимания. Не описывайте картинку — просто напишите в поле ниже слово «дом»." }
  ];

  let seq = shuffle(main, rnd);
  const p1 = Math.floor(seq.length * 0.30) + Math.floor(rnd() * 5);
  const p2 = Math.floor(seq.length * 0.70) + Math.floor(rnd() * 5);
  seq.splice(p1, 0, checks[0]);
  seq.splice(p2, 0, checks[1]);
  seq.forEach((t, i) => { t.pos = i + 1; });

  S.trials = train.concat(seq);
  S.nTrain = train.length;
  S.nMain  = seq.length;
  log("список " + LIST + ": " + S.nMain + " карточек + " + S.nTrain + " тренировочных");
}

function preload() {
  const urls = S.trials.filter(t => t.file).map(t => t.file);
  let done = 0;
  const st = $("preload-status");
  return Promise.all(urls.map(u => new Promise(res => {
    const im = new Image();
    im.onload = im.onerror = () => {
      done++; st.textContent = "Загрузка изображений… " + done + " из " + urls.length;
      res();
    };
    im.src = u;
  }))).then(() => {
    st.textContent = "Изображения загружены.";
    $("btn-instr").disabled = false;
  });
}

// ---------- шкала лёгкости ----------
function buildScale() {
  const box = $("ease-scale");
  box.innerHTML = "";
  for (let i = 1; i <= 7; i++) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = i; b.dataset.val = i;
    b.addEventListener("click", () => {
      S.ease = i;
      box.querySelectorAll("button").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel");
      updateNext();
    });
    box.appendChild(b);
  }
}
function clearScale() {
  S.ease = null;
  $("ease-scale").querySelectorAll("button").forEach(x => x.classList.remove("sel"));
}
function updateNext() {
  const txt = $("answer-input").value.trim();
  $("btn-next").disabled = !(txt.length > 0 && S.ease !== null);
}

// ---------- ход проб ----------
function renderTrial() {
  const t = S.trials[S.idx];
  S.phase = t.kind === "train" ? "train" : "main";

  const img = $("stim-img"), txt = $("stim-text");
  if (t.file) {
    img.src = t.file; img.classList.remove("hidden"); txt.textContent = ""; txt.classList.add("hidden");
  } else {
    img.removeAttribute("src"); img.classList.add("hidden");
    txt.textContent = t.text; txt.classList.remove("hidden");
  }

  const total = S.nTrain + S.nMain;
  $("progress-bar").style.width = (100 * S.idx / total) + "%";
  $("trial-counter").textContent = t.kind === "train"
    ? "Тренировка " + t.pos + " из " + S.nTrain
    : "Картинка " + t.pos + " из " + S.nMain;

  $("answer-input").value = "";
  $("trial-err").textContent = "";
  $("train-feedback").textContent = "";
  clearScale();
  updateNext();
  $("answer-input").focus();

  S.tOnset = performance.now();
  S.tFirstKey = 0;
}

function submitTrial() {
  const t = S.trials[S.idx];
  const ans = $("answer-input").value.trim();
  if (!ans) { $("trial-err").textContent = "Напишите название."; return; }
  if (S.ease === null) { $("trial-err").textContent = "Оцените, насколько легко было подобрать название."; return; }

  const now = performance.now();
  const row = {
    code: CODE, pid: PID, worker: WORKER, list: LIST, seed: SEED, version: CONFIG.version,
    kind: t.kind, pos: t.pos, stim_id: t.id, file: t.file || "",
    check: t.check || (t.kind === "check" ? "instruction" : ""),
    answer: ans, answer_raw_len: ans.length,
    latin: /[A-Za-z]/.test(ans) ? 1 : 0,
    ease: S.ease,
    rt_first_key: S.tFirstKey ? Math.round(S.tFirstKey - S.tOnset) : null,
    rt_submit: Math.round(now - S.tOnset),
    ts: new Date().toISOString()
  };

  if (t.kind === "train") {
    $("train-feedback").textContent = "Ответ принят. Так и продолжайте.";
  } else {
    S.rows.push(row);
    S.pending.push(row);
    saveLocal();
    if (S.pending.length >= CONFIG.chunkSize) flushChunk(false);
  }

  S.idx++;
  if (S.idx >= S.trials.length) finish();
  else setTimeout(renderTrial, t.kind === "train" ? 450 : 0);
}

// ---------- сохранение ----------
function saveLocal() {
  try {
    localStorage.setItem(STORE, JSON.stringify({
      code: CODE, pid: PID, list: LIST, seed: SEED,
      demo: S.demo, startedAt: S.startedAt, rows: S.rows
    }));
  } catch (e) { log("localStorage: " + e); }
}

function post(payload) {
  return fetch(CONFIG.uploadUrl, {
    method: "POST",
    // text/plain — «простой» запрос, без preflight: Apps Script иначе отвечает ошибкой
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(r => {
    if (!r.ok) throw new Error("http " + r.status);
    return r.text();
  }).then(txt => {
    // ВАЖНО: без этой проверки любая страница-заглушка (404, «развёртывание не найдено»)
    // считалась бы успешной отправкой, и данные молча терялись бы.
    let j;
    try { j = JSON.parse(txt); }
    catch (e) { throw new Error("ответ не JSON: " + String(txt).slice(0, 60)); }
    if (!j.ok) throw new Error(j.error || "server_error");
    return j;
  });
}

// Независимая проверка: сколько порций реально лежит на сервере.
// Нужна на случай, когда ответ прочитать не удалось, а данные всё-таки дошли.
function verifyOnServer() {
  const u = CONFIG.uploadUrl + "?action=verify&secret=" + encodeURIComponent(CONFIG.secret) +
            "&pid=" + encodeURIComponent(PID) + "&list=" + LIST;
  return fetch(u).then(r => r.json())
                 .then(j => (j && j.ok) ? (j.chunks || 0) : 0)
                 .catch(() => 0);
}

function flushChunk(isFinal) {
  if (!S.pending.length && !isFinal) return Promise.resolve();
  const batch = S.pending.slice();
  S.pending = [];
  const payload = {
    secret: CONFIG.secret, action: "save", pid: PID, list: LIST, code: CODE,
    final: !!isFinal, meta: isFinal ? sessionMeta() : null, rows: batch
  };
  return post(payload)
    .then(res => {
      // ВАЖНО: логирование обёрнуто в try. Раньше здесь вызывался txt.slice() на объекте,
      // который возвращает post(); TypeError ловился соседним .catch, и успешно
      // отправленная порция возвращалась в очередь. Очередь не опустошалась никогда:
      // каждая следующая отправка везла всё с начала, объём рос квадратично,
      // а участник всё равно видел «Данные отправлены».
      try { log("отправлено " + batch.length + " → " + ((res && res.file) || "ok")); } catch (e) {}
      return true;
    })
    .catch(err => {                      // не потерять: вернуть в очередь
      S.pending = batch.concat(S.pending);
      try { log("ошибка отправки: " + err); } catch (e) {}
      return false;
    });
}

function sessionMeta() {
  return {
    code: CODE, pid: PID, worker: WORKER, list: LIST, seed: SEED, version: CONFIG.version,
    demo: S.demo, startedAt: S.startedAt, finishedAt: new Date().toISOString(),
    nTrials: S.rows.length, ua: navigator.userAgent,
    screen: window.innerWidth + "x" + window.innerHeight
  };
}

// ---------- завершение ----------
function finish() {
  show("screen-done");
  $("completion-code").textContent = CODE;
  $("progress-bar").style.width = "100%";

  const expected = Math.max(1, Math.ceil(S.rows.length / CONFIG.chunkSize));
  let tries = 0;

  const giveUp = () => {
    $("upload-status").textContent = "";
    $("manual-save").classList.remove("hidden");
    $("manual-data").value = JSON.stringify({ meta: sessionMeta(), rows: S.rows });
  };

  const attempt = () => flushChunk(true).then(ok => {
    if (ok && !S.pending.length) {
      $("upload-status").textContent = "Данные отправлены. Спасибо!";
      return;
    }
    tries++;
    if (tries < 4) { setTimeout(attempt, 1500 * tries); return; }
    // последняя попытка: спросить сервер напрямую — вдруг данные дошли,
    // а ответ не удалось прочитать
    verifyOnServer().then(chunks => {
      if (chunks >= expected) {
        $("upload-status").textContent = "Данные отправлены. Спасибо!";
        log("verify: на сервере " + chunks + " порций, ожидалось " + expected);
      } else {
        log("verify: на сервере " + chunks + " из " + expected);
        giveUp();
      }
    });
  });
  attempt();
}

// ---------- обработчики ----------
function wire() {
  $("consent-check").addEventListener("change", e => {
    $("btn-consent").disabled = !e.target.checked;
  });
  $("btn-consent").addEventListener("click", () => show("screen-demo"));

  $("btn-demo").addEventListener("click", () => {
    const age = parseInt($("demo-age").value, 10);
    const sex = $("demo-sex").value, lang = $("demo-lang").value;
    if (!age || age < 16 || age > 99) { $("demo-err").textContent = "Укажите возраст (16–99)."; return; }
    if (!sex)  { $("demo-err").textContent = "Укажите пол."; return; }
    if (!lang) { $("demo-err").textContent = "Укажите, родной ли для вас русский язык."; return; }
    S.demo = { age: age, sex: sex, native_ru: lang };
    $("demo-err").textContent = "";
    show("screen-instr");
    preload();
  });

  $("btn-instr").addEventListener("click", () => { show("screen-trial"); renderTrial(); });

  const inp = $("answer-input");
  inp.addEventListener("input", () => {
    if (!S.tFirstKey) S.tFirstKey = performance.now();
    updateNext();
  });
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (S.ease === null) $("ease-scale").querySelector("button").focus();
      else submitTrial();
    }
  });
  $("btn-next").addEventListener("click", submitTrial);

  $("btn-copy").addEventListener("click", () => {
    $("manual-data").select();
    try { document.execCommand("copy"); $("btn-copy").textContent = "Скопировано"; } catch (e) {}
  });

  // страховка: попытка дослать при закрытии вкладки
  window.addEventListener("beforeunload", e => {
    if (S.pending.length && navigator.sendBeacon) {
      navigator.sendBeacon(CONFIG.uploadUrl, new Blob([JSON.stringify({
        secret: CONFIG.secret, action: "save", pid: PID, list: LIST, code: CODE,
        final: false, rows: S.pending
      })], { type: "text/plain;charset=utf-8" }));
    }
    if (S.idx > S.nTrain && S.idx < S.trials.length) {
      e.preventDefault(); e.returnValue = "";
    }
  });
}

// ---------- старт ----------
if (gateChecks()) {
  buildScale();
  wire();
  loadStimuli()
    .then(() => { buildTrials(); show("screen-consent"); })
    .catch(err => {
      show("screen-closed");
      $("screen-closed").querySelector("p").textContent =
        "Не удалось загрузить задание. Обновите страницу или напишите исследователю.";
      log("ошибка загрузки stimuli.json: " + err);
    });
}
})();
