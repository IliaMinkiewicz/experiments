"use strict";
// Ход эксперимента в браузере: экраны, пробы, запись и отправка данных.
// Расписание участника (листы, порядок проб, позиции слов) строится в design.js,
// тексты — в texts.js, стимулы и листы — в stimuli.js, тренировочные пробы — в practice.js.

// ---------- Настройки ----------

const CONFIG = {
  experiment: "RMET_pilot_26",
  uploadUrl: "https://script.google.com/macros/s/AKfycbwaFK70UaMGENE6P4eJWdMNYoG0dnQ79RzWa-dcMS81csWU3p5uAap58Lq4Q9xV48JP/exec", // адрес веб-приложения Google Apps Script
  secret: "gs(&T6shgw3gs4nhdfk5p033EAS#34W%fgGHwsws3",    // та же строка, что SHARED_SECRET в свойствах скрипта
  fixationMs: 500, // фиксационный крест перед изображением
  minAge: 18,
  maxAge: 45,
};

// Изображения грузятся с jsDelivr (копия репозитория на коммите с изображениями);
// если не получилось — с самой страницы. При добавлении изображений коммит в адресе нужно обновить.
const IMAGE_CDN = "https://cdn.jsdelivr.net/gh/IliaMinkiewicz/experiments@b6c2e98/RMET_pilot_26/";
const IMAGE_PARALLEL = 6;        // одновременных загрузок
const IMAGE_TRIES = 4;           // попыток на одно изображение
const IMAGE_TIMEOUT_MS = 120000; // ожидание одной попытки

// Обычно все участники получают одну общую ссылку без параметров: номер выдаёт Apps Script
// после согласия и анкеты, браузер его запоминает. Параметры ссылки — для особых случаев:
//   ?p=12   номер участника вручную (например, участник перешёл на другой компьютер);
//   ?s=3    начать с сессии 3 — если прогресс в браузере потерян;
//   ?new=1  забыть участника, сохранённого в этом браузере (новый участник на том же компьютере);
//   ?g=5    группа явно — только для проверок (?p=test&g=5);
//   ?auto=1 автопрогон для проверки: ответы случайные, данные никуда не отправляются.
const params = new URLSearchParams(location.search);
const AUTO = params.get("auto") === "1";

// Столбцы файла с данными; одна строка — одна проба.
const COLUMNS = [
  // участник и расписание
  "experiment", "participant_id", "group", "list_order", "first_task", "session", "list", "block", "task",
  // проба и изображение
  "is_practice", "trial", "stim_id", "image", "actor_sex", "angle",
  // четыре варианта по позициям (1 — слева вверху, 2 — справа вверху, 3 — слева внизу, 4 — справа внизу) и их роли
  "opt1", "opt2", "opt3", "opt4", "role1", "role2", "role3", "role4",
  // ответ и время (мс от появления изображения)
  "position", "response", "response_role", "correct", "rt_ms", "move_onset_ms",
  // мышь: где был курсор при появлении изображения, где был щелчок, расстояние между ними (px)
  "cursor_start_x", "cursor_start_y", "click_x", "click_y", "distance_px", "onset_iso",
  // анкета и компьютер участника
  "age", "sex", "native_ru", "screen", "window", "user_agent",
];

// Текущее состояние: участник, его расписание, накопленные строки данных, загруженные изображения.
const state = {
  pid: "", group: 0, startSession: 1, demo: {}, plan: null, schedule: null,
  rows: [], uploads: {}, pending: [], images: {}, running: false,
};

// ---------- Вспомогательные функции ----------

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// Показать один экран (section с классом screen), остальные скрыть.
function show(id) {
  document.querySelectorAll(".screen").forEach((screen) => { screen.hidden = screen.id !== id; });
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}

// Экран с текстом и кнопкой; возвращает обещание, которое выполнится по нажатию кнопки.
function message(html, buttonText, withStatus) {
  $("msg-body").innerHTML = html;
  $("b-msg").textContent = buttonText || TEXTS.continueButton;
  $("msg-status").textContent = "";
  statusTarget = withStatus ? "msg-status" : null;
  renderStatus();
  show("screen-msg");
  return new Promise((resolve) => {
    $("b-msg").onclick = () => {
      $("b-msg").onclick = null;
      resolve();
    };
    if (AUTO) setTimeout(() => $("b-msg").click(), 0);
  });
}

// ---------- Мышь ----------

// Последнее известное положение курсора и время первого движения после появления изображения.
const pointer = { x: null, y: null, moved: null };
let answerWaiter = null; // функция, которая получит ответ; задана, пока проба ждёт щелчка

function trackPointer(e) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  if (answerWaiter && pointer.moved === null && e.type === "pointermove") pointer.moved = e.timeStamp;
}
window.addEventListener("pointermove", trackPointer, { passive: true });
window.addEventListener("pointerdown", trackPointer, { passive: true, capture: true });

// Ответ — нажатие левой кнопки мыши на одном из четырёх слов (кнопки o0–o3 — позиции 1–4).
[0, 1, 2, 3].forEach((pos) => $("o" + pos).addEventListener("pointerdown", (e) => {
  if (!answerWaiter || e.button !== 0) return;
  e.preventDefault();
  const receive = answerWaiter;
  answerWaiter = null;
  receive({ pos: pos, time: e.timeStamp, x: e.clientX, y: e.clientY });
}));

// Автопрогон: щелчок по случайному слову. Параметр ?hold=N останавливает прогон на N-й пробе (для снимка экрана).
async function autoClick() {
  state.autoCount = (state.autoCount || 0) + 1;
  if (state.autoCount === Number(params.get("hold"))) await new Promise(() => {});
  await sleep(2);
  const button = $("o" + Math.floor(Math.random() * 4));
  const box = button.getBoundingClientRect();
  button.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true, button: 0, pointerType: "mouse", clientX: box.x + box.width / 2, clientY: box.y + box.height / 2,
  }));
}

// ---------- Одна проба ----------

async function runTrial(trial, session, block, index, isPractice) {
  // Фиксационный крест, затем изображение и четыре слова.
  show("screen-fix");
  await sleep(AUTO ? 1 : CONFIG.fixationMs);
  $("stim").replaceChildren(state.images[trial.image]);
  trial.options.forEach((option, pos) => { $("o" + pos).textContent = option.word; });
  await nextFrame();
  show("screen-trial");
  const onset = await nextFrame(); // первый кадр после отрисовки изображения — от него считается время ответа
  const onsetIso = new Date().toISOString();
  const start = { x: pointer.x, y: pointer.y };
  pointer.moved = null;

  // Ждём щелчка по слову.
  const answer = new Promise((resolve) => { answerWaiter = resolve; });
  if (AUTO) await autoClick();
  const resp = await answer;

  // Строка данных.
  const chosen = trial.options[resp.pos];
  const stim = STIMULI[trial.stim] || trial; // у тренировочных проб пол и ракурс записаны в самой пробе
  const px = (v) => (v === null ? "" : Math.round(v));
  const ms = (t) => (t === null ? "" : (t - onset).toFixed(1));
  state.rows.push({
    experiment: CONFIG.experiment, participant_id: state.pid, group: state.group,
    list_order: state.plan.map((p) => p.list).join("-"), first_task: state.plan[0].tasks[0],
    session: session.session, list: session.list, block: block.block, task: block.task,
    is_practice: isPractice ? 1 : 0, trial: index + 1,
    stim_id: trial.stim, image: trial.image, actor_sex: stim.sex || "", angle: stim.angle || "",
    opt1: trial.options[0].word, opt2: trial.options[1].word, opt3: trial.options[2].word, opt4: trial.options[3].word,
    role1: trial.options[0].role, role2: trial.options[1].role, role3: trial.options[2].role, role4: trial.options[3].role,
    position: resp.pos + 1, response: chosen.word, response_role: chosen.role,
    correct: chosen.role.startsWith("correct") ? 1 : 0,
    rt_ms: ms(resp.time), move_onset_ms: ms(pointer.moved),
    cursor_start_x: px(start.x), cursor_start_y: px(start.y), click_x: px(resp.x), click_y: px(resp.y),
    distance_px: start.x === null ? "" : px(Math.hypot(resp.x - start.x, resp.y - start.y)),
    onset_iso: onsetIso,
    age: state.demo.age, sex: state.demo.sex, native_ru: state.demo.native_ru,
    screen: screen.width + "x" + screen.height, window: innerWidth + "x" + innerHeight, user_agent: navigator.userAgent,
  });
  backup();
}

// ---------- Ход эксперимента ----------

// Сессии по расписанию; в каждой два блока (прямая и обратная задача), в сессии 1 перед блоком — тренировка.
async function run() {
  state.running = true;
  for (const session of state.schedule) {
    if (session.session < state.startSession) continue;
    for (const block of session.blocks) {
      await message(TEXTS[block.task], TEXTS.startButton);
      if (block.practice.length) {
        await message(TEXTS.practiceStart, TEXTS.startButton);
        for (let i = 0; i < block.practice.length; i++) await runTrial(block.practice[i], session, block, i, true);
        await message(TEXTS.practiceEnd, TEXTS.startButton);
      }
      for (let i = 0; i < block.trials.length; i++) await runTrial(block.trials[i], session, block, i, false);
    }
    uploadSession(session.session);
    saveProgress(session.session);
    if (session.session < 4) await message(TEXTS.pause(session.session), TEXTS.continueButton, true);
  }
  await finish();
}

// Последний экран: дожидаемся отправки и повторяем неудавшиеся отправки.
async function finish() {
  $("end-text").innerHTML = TEXTS.end + `<p>${TEXTS.participantNumber(state.pid)}</p>`;
  statusTarget = "end-status";
  show("screen-end");
  renderStatus();
  await Promise.allSettled(state.pending);
  const failed = Object.keys(state.uploads).filter((s) => state.uploads[s] === "error").map(Number);
  for (const s of failed) await uploadSession(s);
  renderStatus();
  state.running = false;
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  if (AUTO) { // автопрогон: данные кладутся на страницу, откуда их забирает проверка
    const pre = document.createElement("pre");
    pre.id = "auto-csv";
    pre.hidden = true;
    pre.textContent = toCsv(state.rows);
    document.body.appendChild(pre);
  }
}

// ---------- Данные: сохранение в браузере и отправка ----------

function toCsv(rows) {
  const esc = (v) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => esc(r[c])).join(","))].join("\n");
}

// Копия всех строк в браузере (localStorage) после каждой пробы — на случай сбоя.
const rowsKey = () => CONFIG.experiment + "_" + state.pid;
function backup() {
  try { localStorage.setItem(rowsKey(), JSON.stringify(state.rows)); } catch (e) { /* хранилище недоступно */ }
}
function savedRows() {
  try { return JSON.parse(localStorage.getItem(rowsKey()) || "[]"); } catch (e) { return []; }
}

// Прогресс участника: сколько сессий пройдено и ответы анкеты.
// По нему при повторном открытии ссылки исследование продолжается с прерванной сессии.
const progressKey = () => CONFIG.experiment + "_progress_" + state.pid;
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey()) || "null"); } catch (e) { return null; }
}
function saveProgress(done) {
  if (AUTO) return;
  try { localStorage.setItem(progressKey(), JSON.stringify({ done: done, demo: state.demo })); } catch (e) { /* хранилище недоступно */ }
}

// Строка о состоянии отправки («Данные: сессия 1: сохранены») на экранах перерыва и конца.
let statusTarget = null;
function renderStatus() {
  if (!statusTarget) return;
  const names = { ok: "сохранены", sending: "отправляются", off: "отправка не настроена", error: "не отправлены, сохранены в браузере" };
  const parts = Object.keys(state.uploads).map(Number).sort((a, b) => a - b)
    .map((s) => `сессия ${s}: ${names[state.uploads[s]]}`);
  $(statusTarget).textContent = parts.length ? "Данные: " + parts.join("; ") : "";
}

// Отправка строк одной сессии в Google Apps Script, который сохраняет их в закрытый репозиторий.
function uploadSession(session) {
  if (AUTO || !CONFIG.uploadUrl) {
    state.uploads[session] = "off";
    renderStatus();
    return Promise.resolve();
  }
  state.uploads[session] = "sending";
  renderStatus();
  const body = JSON.stringify({
    experiment: CONFIG.experiment, participantId: state.pid, group: state.group, session: session,
    timestamp: new Date().toISOString(), secret: CONFIG.secret,
    csvData: toCsv(state.rows.filter((r) => r.session === session)),
  });
  const request = fetch(CONFIG.uploadUrl, { method: "POST", body: body })
    .then((res) => res.json())
    .then((reply) => { state.uploads[session] = reply && reply.ok ? "ok" : "error"; })
    .catch(() => { state.uploads[session] = "error"; })
    .then(renderStatus);
  state.pending.push(request);
  return request;
}

// ---------- Загрузка изображений ----------
// Начинается сразу при открытии страницы; попытки чередуют jsDelivr и саму страницу.

const loader = { total: 0, done: 0, failed: [], promise: Promise.resolve([]) };

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    let finished = false;
    const finish = (ok) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(ok ? img : null);
    };
    const timer = setTimeout(() => { img.src = ""; finish(false); }, IMAGE_TIMEOUT_MS);
    img.onload = () => { if (img.decode) img.decode().then(() => finish(true), () => finish(true)); else finish(true); };
    img.onerror = () => finish(false);
    img.alt = "";
    img.src = src;
  });
}

function renderLoad() {
  const text = `${TEXTS.loading}: ${loader.done} из ${loader.total}` +
    (loader.failed.length ? `, не загрузилось: ${loader.failed.length}` : "");
  ["setup-load", "load-status"].forEach((id) => { $(id).textContent = text; });
}

function preload(paths) {
  loader.total = paths.length;
  loader.done = 0;
  loader.failed = [];
  renderLoad();
  const queue = paths.slice();
  const worker = async () => {
    while (queue.length) {
      const path = queue.shift();
      let img = null;
      for (let attempt = 0; attempt < IMAGE_TRIES && !img; attempt++) {
        if (attempt) await sleep(1000 * attempt);
        img = await loadImage(attempt % 2 === 0 && IMAGE_CDN ? IMAGE_CDN + path : path);
      }
      if (img) state.images[path] = img;
      else loader.failed.push(path);
      loader.done++;
      renderLoad();
    }
  };
  loader.promise = Promise.all(Array.from({ length: IMAGE_PARALLEL }, worker)).then(() => loader.failed);
  return loader.promise;
}

function allImages() {
  const paths = Object.keys(STIMULI).map((id) => STIMULI[id].image);
  ["direct", "reverse"].forEach((task) => (PRACTICE[task] || []).forEach((item) => { if (item.image) paths.push(item.image); }));
  return [...new Set(paths)];
}

// ---------- Участник: номер, группа, продолжение ----------

// Группа задаётся номером участника по кругу: 1–8, затем снова 1 (участник 9 — группа 1).
function groupFor(pid) {
  const g = Number(params.get("g"));
  if (Number.isInteger(g) && g >= 1 && g <= 8) return g;
  const n = Number(pid);
  return /^\d+$/.test(pid) && n >= 1 ? ((n - 1) % 8) + 1 : 0;
}

function planText(group) {
  const plan = Design.groupPlan(group);
  const names = { direct: "прямая", reverse: "обратная" };
  return `Группа ${group}: листы по сессиям ${plan.map((p) => p.list).join("–")}, первая задача — ${names[plan[0].tasks[0]]}.`;
}

// Номер участника, сохранённый в этом браузере: по той же общей ссылке участник продолжит с прерванной сессии.
const PID_KEY = CONFIG.experiment + "_participant";
function storedPid() {
  try { return localStorage.getItem(PID_KEY) || ""; } catch (e) { return ""; }
}
function rememberPid(pid) {
  try { localStorage.setItem(PID_KEY, pid); } catch (e) { /* хранилище недоступно */ }
  history.replaceState(null, "", "?p=" + pid); // при перезагрузке страницы участник продолжит с того же места
}

// Новый номер у Apps Script (1, 2, 3… по порядку).
async function requestNumber() {
  if (!CONFIG.uploadUrl) throw new Error("адрес Apps Script не задан");
  const res = await fetch(CONFIG.uploadUrl, {
    method: "POST",
    body: JSON.stringify({ action: "new_participant", experiment: CONFIG.experiment, secret: CONFIG.secret }),
  });
  const reply = await res.json();
  if (!reply || !reply.ok || !reply.pid) throw new Error("номер не выдан");
  return String(reply.pid);
}

// Номер назначен после анкеты: запоминаем его, сохраняем анкету и переходим к началу.
function setParticipant(pid) {
  state.pid = pid;
  state.group = groupFor(pid);
  rememberPid(pid);
  saveProgress(state.startSession - 1);
  prepare(TEXTS.participantNumber(pid));
}

// Участник с известным номером: новый — согласие и анкета; вернувшийся — сразу к прерванной сессии.
function begin(pid) {
  state.pid = pid;
  state.group = groupFor(pid);
  rememberPid(pid);
  const forced = Number(params.get("s"));
  const hasForced = forced >= 1 && forced <= 4;
  const progress = loadProgress();
  const done = progress ? progress.done : 0;
  if (!hasForced && done >= 4) {
    $("end-text").innerHTML = TEXTS.done;
    $("b-download").hidden = true;
    show("screen-end");
    return;
  }
  state.startSession = hasForced ? forced : done + 1;
  if (progress && progress.demo) {
    state.demo = progress.demo;
    state.rows = savedRows().filter((r) => r.session < state.startSession);
    prepare(TEXTS.resume(state.startSession) + " " + TEXTS.participantNumber(pid));
  } else {
    $("consent-text").innerHTML = TEXTS.consent;
    show("screen-consent");
  }
}

// Расписание участника и экран перехода в полноэкранный режим; кнопка «Начать» включается, когда загружены изображения.
async function prepare(note) {
  state.plan = Design.groupPlan(state.group);
  state.schedule = Design.buildSchedule(state.pid, state.group, STIMULI, LISTS, PRACTICE);
  $("full-text").textContent = (note ? note + " " : "") + TEXTS.fullscreen;
  $("b-retry").hidden = true;
  show("screen-full");
  const failed = await loader.promise;
  if (failed.length) $("b-retry").hidden = false;
  else $("b-full").disabled = false;
  return failed;
}

// ---------- Кнопки и поля ----------

$("f-pid").addEventListener("input", () => {
  const g = groupFor($("f-pid").value.trim());
  $("plan").textContent = g ? planText(g) : "";
});

$("b-setup").addEventListener("click", () => {
  const pid = $("f-pid").value.trim();
  if (!groupFor(pid)) {
    $("setup-error").textContent = "Введите номер участника: целое число от 1.";
    return;
  }
  if (state.demo.age) setParticipant(pid); // анкета уже заполнена, номер не удалось получить автоматически
  else begin(pid);
});

$("b-consent").addEventListener("click", () => show("screen-demo"));

$("b-demo").addEventListener("click", async () => {
  const age = Number($("f-age").value);
  const sex = $("f-sex").value;
  const lang = $("f-lang").value;
  let err = "";
  if (!Number.isInteger(age) || age < CONFIG.minAge || age > CONFIG.maxAge) err = `В исследовании участвуют люди от ${CONFIG.minAge} до ${CONFIG.maxAge} лет.`;
  else if (!sex) err = "Укажите пол.";
  else if (!lang) err = "Укажите, родной ли для вас русский язык.";
  $("demo-error").textContent = err;
  if (err) return;
  state.demo = { age: age, sex: sex, native_ru: lang };
  if (state.pid) { // номер уже известен (ссылка с ?p=)
    saveProgress(state.startSession - 1);
    prepare(TEXTS.participantNumber(state.pid));
    return;
  }
  // Новый участник по общей ссылке: номер выдаёт Apps Script; если не вышло — номер вводит экспериментатор.
  $("b-demo").disabled = true;
  $("demo-status").textContent = TEXTS.gettingNumber;
  try {
    setParticipant(await requestNumber());
  } catch (e) {
    $("setup-error").textContent = TEXTS.noNumber;
    show("screen-setup");
  } finally {
    $("b-demo").disabled = false;
    $("demo-status").textContent = "";
  }
});

$("b-retry").addEventListener("click", () => {
  $("b-retry").hidden = true;
  preload(loader.failed.slice());
  prepare();
});

$("b-full").addEventListener("click", async () => {
  const page = document.documentElement;
  if (page.requestFullscreen) {
    try { await page.requestFullscreen(); } catch (e) { /* продолжаем без полноэкранного режима */ }
  }
  run();
});

// Запасной способ сохранить данные: файл CSV на компьютер участника.
$("b-download").addEventListener("click", () => {
  const blob = new Blob(["﻿" + toCsv(state.rows)], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${CONFIG.experiment}_${state.pid}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
});

// Предупреждение при попытке закрыть страницу во время эксперимента.
window.addEventListener("beforeunload", (e) => {
  if (state.running) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ---------- Запуск ----------

preload(allImages());

if (AUTO) {
  state.pid = params.get("p") || "auto";
  state.group = groupFor(state.pid) || 1;
  state.startSession = Number(params.get("s") || 1);
  state.demo = { age: 0, sex: "тест", native_ru: "тест" };
  prepare().then((failed) => { if (!failed.length) run(); });
} else {
  if (params.get("new") === "1") {
    try { localStorage.removeItem(PID_KEY); } catch (e) { /* хранилище недоступно */ }
    history.replaceState(null, "", location.pathname);
  }
  const linkPid = (params.get("p") || "").trim();
  const pid = linkPid || (params.get("new") === "1" ? "" : storedPid());
  if (/^[A-Za-z0-9_-]+$/.test(pid) && groupFor(pid)) begin(pid); // известный участник
  else if (linkPid) {
    $("setup-error").textContent = "В ссылке неверный номер участника.";
    show("screen-setup");
  } else { // новый участник по общей ссылке
    $("consent-text").innerHTML = TEXTS.consent;
    show("screen-consent");
  }
}
