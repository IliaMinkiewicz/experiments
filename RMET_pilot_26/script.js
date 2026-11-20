"use strict";

const CONFIG = {
  experiment: "RMET_pilot_26",
  uploadUrl: "https://script.google.com/macros/s/AKfycbwaFK70UaMGENE6P4eJWdMNYoG0dnQ79RzWa-dcMS81csWU3p5uAap58Lq4Q9xV48JP/exec", // адрес веб-приложения Google Apps Script
  secret: "gs(&T6shgw3gs4nhdfk5p033EAS#34W%fgGHwsws3",    // та же строка, что SHARED_SECRET в свойствах скрипта
  fixationMs: 500,
  minAge: 18,
  maxAge: 45,
};

const params = new URLSearchParams(location.search);
const AUTO = params.get("auto") === "1";
if (AUTO && params.get("practice") === "test") {
  PRACTICE.direct = [{ stim: "S1" }, { stim: "S2" }];
  PRACTICE.reverse = [{ stim: "S3" }, { stim: "S4" }];
}

const COLUMNS = [
  "experiment", "participant_id", "group", "list_order", "first_task", "session", "list", "block", "task",
  "is_practice", "trial", "stim_id", "image", "actor_sex", "angle",
  "opt1", "opt2", "opt3", "opt4", "role1", "role2", "role3", "role4",
  "position", "response", "response_role", "correct", "rt_ms", "move_onset_ms",
  "cursor_start_x", "cursor_start_y", "click_x", "click_y", "distance_px", "onset_iso",
  "age", "sex", "native_ru", "screen", "window", "user_agent",
];

const state = {
  pid: "", group: 0, startSession: 1, demo: {}, plan: null, schedule: null,
  rows: [], uploads: {}, pending: [], images: {}, running: false,
};

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => { s.hidden = s.id !== id; });
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}

// Мышь: последнее известное положение курсора; время первого движения после появления изображения.
const pointer = { x: null, y: null, moved: null };
let answerWaiter = null;
const trackPointer = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  if (answerWaiter && pointer.moved === null && e.type === "pointermove") pointer.moved = e.timeStamp;
};
window.addEventListener("pointermove", trackPointer, { passive: true });
window.addEventListener("pointerdown", trackPointer, { passive: true, capture: true });

// Ответ — нажатие левой кнопки мыши на одном из четырёх слов (o0–o3 — позиции 1–4).
[0, 1, 2, 3].forEach((p) => $("o" + p).addEventListener("pointerdown", (e) => {
  if (!answerWaiter || e.button !== 0) return;
  e.preventDefault();
  const w = answerWaiter;
  answerWaiter = null;
  w({ pos: p, ts: e.timeStamp, x: e.clientX, y: e.clientY });
}));

// Состояние отправки данных.
let statusTarget = null;
function renderStatus() {
  if (!statusTarget) return;
  const names = { ok: "сохранены", sending: "отправляются", off: "отправка не настроена", error: "не отправлены, сохранены в браузере" };
  const parts = Object.keys(state.uploads).map(Number).sort((a, b) => a - b)
    .map((s) => `сессия ${s}: ${names[state.uploads[s]]}`);
  $(statusTarget).textContent = parts.length ? "Данные: " + parts.join("; ") : "";
}

function message(html, button, withStatus) {
  $("msg-body").innerHTML = html;
  $("b-msg").textContent = button || TEXTS.continueButton;
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

// Прогресс участника в браузере: сколько сессий пройдено и ответы анкеты.
// По нему при повторном открытии ссылки исследование продолжается с прерванной сессии.
const progressKey = () => CONFIG.experiment + "_progress_" + state.pid;
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey()) || "null"); } catch (e) { return null; }
}
function saveProgress(done) {
  if (AUTO) return;
  try { localStorage.setItem(progressKey(), JSON.stringify({ done: done, demo: state.demo })); } catch (e) { /* хранилище недоступно */ }
}
function savedRows() {
  try { return JSON.parse(localStorage.getItem(CONFIG.experiment + "_" + state.pid) || "[]"); } catch (e) { return []; }
}

function toCsv(rows) {
  const esc = (v) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => esc(r[c])).join(","))].join("\n");
}

function backup() {
  try { localStorage.setItem(CONFIG.experiment + "_" + state.pid, JSON.stringify(state.rows)); } catch (e) { /* хранилище недоступно */ }
}

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
  const p = fetch(CONFIG.uploadUrl, { method: "POST", body: body })
    .then((res) => res.json())
    .then((j) => { state.uploads[session] = j && j.ok ? "ok" : "error"; })
    .catch(() => { state.uploads[session] = "error"; })
    .then(renderStatus);
  state.pending.push(p);
  return p;
}

async function runTrial(t, s, b, i, practice) {
  show("screen-fix");
  await sleep(AUTO ? 1 : CONFIG.fixationMs);
  $("stim").replaceChildren(state.images[t.image]);
  t.options.forEach((o, p) => { $("o" + p).textContent = o.word; });
  await nextFrame();
  show("screen-trial");
  const onset = await nextFrame(); // первый кадр после отрисовки изображения
  const onsetIso = new Date().toISOString();
  const start = { x: pointer.x, y: pointer.y };
  pointer.moved = null;
  const answer = new Promise((resolve) => { answerWaiter = resolve; });
  if (AUTO) {
    state.autoCount = (state.autoCount || 0) + 1;
    if (state.autoCount === Number(params.get("hold"))) await new Promise(() => {});
    await sleep(2);
    const el = $("o" + Math.floor(Math.random() * 4));
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true, button: 0, pointerType: "mouse", clientX: r.x + r.width / 2, clientY: r.y + r.height / 2,
    }));
  }
  const resp = await answer;
  const chosen = t.options[resp.pos];
  const dist = start.x === null ? "" : Math.hypot(resp.x - start.x, resp.y - start.y).toFixed(0);
  const st = STIMULI[t.stim] || t;
  state.rows.push({
    experiment: CONFIG.experiment, participant_id: state.pid, group: state.group,
    list_order: state.plan.map((p) => p.list).join("-"), first_task: state.plan[0].tasks[0],
    session: s.session, list: s.list, block: b.block, task: b.task, is_practice: practice ? 1 : 0,
    trial: i + 1, stim_id: t.stim, image: t.image, actor_sex: st.sex || "", angle: st.angle || "",
    opt1: t.options[0].word, opt2: t.options[1].word, opt3: t.options[2].word, opt4: t.options[3].word,
    role1: t.options[0].role, role2: t.options[1].role, role3: t.options[2].role, role4: t.options[3].role,
    position: resp.pos + 1, response: chosen.word, response_role: chosen.role,
    correct: chosen.role.indexOf("correct") === 0 ? 1 : 0,
    rt_ms: (resp.ts - onset).toFixed(1),
    move_onset_ms: pointer.moved === null ? "" : (pointer.moved - onset).toFixed(1),
    cursor_start_x: start.x === null ? "" : Math.round(start.x), cursor_start_y: start.y === null ? "" : Math.round(start.y),
    click_x: Math.round(resp.x), click_y: Math.round(resp.y), distance_px: dist, onset_iso: onsetIso,
    age: state.demo.age, sex: state.demo.sex, native_ru: state.demo.native_ru,
    screen: screen.width + "x" + screen.height, window: innerWidth + "x" + innerHeight, user_agent: navigator.userAgent,
  });
  backup();
}

// Загрузка изображений: начинается сразу при открытии страницы, не больше IMAGE_PARALLEL
// одновременно, до IMAGE_TRIES попыток на изображение. Попытки чередуют источники:
// CDN jsDelivr (копия репозитория на коммите с изображениями) и сама страница.
const IMAGE_CDN = "https://cdn.jsdelivr.net/gh/IliaMinkiewicz/experiments@b6c2e98/RMET_pilot_26/";
const IMAGE_PARALLEL = 6;
const IMAGE_TRIES = 4;
const IMAGE_TIMEOUT_MS = 120000;
const loader = { total: 0, done: 0, failed: [], promise: Promise.resolve([]) };

function loadImage(p) {
  return new Promise((resolve) => {
    const im = new Image();
    let finished = false;
    const finish = (ok) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(ok ? im : null);
    };
    const timer = setTimeout(() => { im.src = ""; finish(false); }, IMAGE_TIMEOUT_MS);
    im.onload = () => { if (im.decode) im.decode().then(() => finish(true), () => finish(true)); else finish(true); };
    im.onerror = () => finish(false);
    im.alt = "";
    im.src = p;
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
      const p = queue.shift();
      let im = null;
      for (let k = 0; k < IMAGE_TRIES && !im; k++) {
        if (k) await sleep(1000 * k);
        im = await loadImage(k % 2 === 0 && IMAGE_CDN ? IMAGE_CDN + p : p);
      }
      if (im) state.images[p] = im;
      else loader.failed.push(p);
      loader.done++;
      renderLoad();
    }
  };
  loader.promise = Promise.all(Array.from({ length: IMAGE_PARALLEL }, worker)).then(() => loader.failed);
  return loader.promise;
}

function allImages() {
  const paths = Object.keys(STIMULI).map((k) => STIMULI[k].image);
  ["direct", "reverse"].forEach((t) => (PRACTICE[t] || []).forEach((it) => { if (it.image) paths.push(it.image); }));
  return [...new Set(paths)];
}

async function prepare(note) {
  state.plan = Design.groupPlan(state.group);
  state.schedule = Design.buildSchedule(state.pid, state.group, STIMULI, LISTS, PRACTICE);
  $("full-text").textContent = (note ? note + " " : "") + TEXTS.fullscreen;
  $("b-retry").hidden = true;
  show("screen-full");
  const failed = await loader.promise;
  if (failed.length) {
    $("b-retry").hidden = false;
    return failed;
  }
  $("b-full").disabled = false;
  return failed;
}

$("b-retry").addEventListener("click", () => {
  $("b-retry").hidden = true;
  preload(loader.failed.slice());
  prepare();
});

async function run() {
  state.running = true;
  for (const s of state.schedule) {
    if (s.session < state.startSession) continue;
    for (const b of s.blocks) {
      await message(TEXTS[b.task], TEXTS.startButton);
      if (b.practice.length) {
        await message(TEXTS.practiceStart, TEXTS.startButton);
        for (let i = 0; i < b.practice.length; i++) await runTrial(b.practice[i], s, b, i, true);
        await message(TEXTS.practiceEnd, TEXTS.startButton);
      }
      for (let i = 0; i < b.trials.length; i++) await runTrial(b.trials[i], s, b, i, false);
    }
    uploadSession(s.session);
    saveProgress(s.session);
    if (s.session < 4) await message(TEXTS.pause(s.session), TEXTS.continueButton, true);
  }
  await finish();
}

async function finish() {
  $("end-text").innerHTML = TEXTS.end;
  statusTarget = "end-status";
  show("screen-end");
  renderStatus();
  await Promise.allSettled(state.pending);
  const failed = Object.keys(state.uploads).filter((s) => state.uploads[s] === "error").map(Number);
  for (const s of failed) await uploadSession(s);
  renderStatus();
  state.running = false;
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  if (AUTO) {
    const pre = document.createElement("pre");
    pre.id = "auto-csv";
    pre.hidden = true;
    pre.textContent = toCsv(state.rows);
    document.body.appendChild(pre);
  }
}

// Группа задаётся номером участника по кругу: 1–8, затем снова 1 (участник 9 — группа 1).
// Для проверок можно указать группу явно: ?p=test&g=5. Номер сессии ?s=2 — только на случай,
// когда прогресс в браузере потерян (участник открыл ссылку на другом компьютере).
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

function begin(pid) {
  state.pid = pid;
  state.group = groupFor(pid);
  const forced = Number(params.get("s"));
  const prog = loadProgress();
  const done = prog ? prog.done : 0;
  if (!(forced >= 1 && forced <= 4) && done >= 4) {
    $("end-text").innerHTML = TEXTS.done;
    $("b-download").hidden = true;
    show("screen-end");
    return;
  }
  state.startSession = forced >= 1 && forced <= 4 ? forced : done + 1;
  if (prog && prog.demo) {
    state.demo = prog.demo;
    state.rows = savedRows().filter((r) => r.session < state.startSession);
    prepare(TEXTS.resume(state.startSession));
  } else {
    $("consent-text").innerHTML = TEXTS.consent;
    show("screen-consent");
  }
}

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
  history.replaceState(null, "", "?p=" + pid); // при перезагрузке страницы участник продолжит с того же места
  begin(pid);
});

$("b-consent").addEventListener("click", () => show("screen-demo"));

$("b-demo").addEventListener("click", () => {
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
  saveProgress(state.startSession - 1);
  prepare();
});

$("b-full").addEventListener("click", async () => {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    try { await el.requestFullscreen(); } catch (e) { /* без полноэкранного режима */ }
  }
  run();
});

$("b-download").addEventListener("click", () => {
  const blob = new Blob(["﻿" + toCsv(state.rows)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${CONFIG.experiment}_${state.pid}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

window.addEventListener("beforeunload", (e) => {
  if (state.running) {
    e.preventDefault();
    e.returnValue = "";
  }
});

preload(allImages());

if (AUTO) {
  state.pid = params.get("p") || "auto";
  state.group = groupFor(state.pid) || 1;
  state.startSession = Number(params.get("s") || 1);
  state.demo = { age: 0, sex: "тест", native_ru: "тест" };
  prepare().then((failed) => { if (!failed.length) run(); });
} else {
  const pid = (params.get("p") || "").trim();
  if (/^[A-Za-z0-9_-]+$/.test(pid) && groupFor(pid)) begin(pid);
  else {
    if (pid) $("setup-error").textContent = "В ссылке неверный номер участника.";
    show("screen-setup");
  }
}
