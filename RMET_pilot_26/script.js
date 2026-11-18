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
  "key", "response", "response_role", "correct", "rt_ms", "onset_iso",
  "gender", "age", "native_language", "handedness", "screen", "window", "user_agent",
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

// Клавиатура: один обработчик, одно ожидание за раз.
let keyWaiter = null;
window.addEventListener("keydown", (e) => {
  if (!keyWaiter || e.repeat) return;
  const v = keyWaiter.match(e);
  if (v === null) return;
  e.preventDefault();
  const w = keyWaiter;
  keyWaiter = null;
  w.resolve({ key: v, ts: e.timeStamp });
});
const waitFor = (match) => new Promise((resolve) => { keyWaiter = { match, resolve }; });
const matchSpace = (e) => (e.code === "Space" ? "space" : null);
const matchResponse = (e) => {
  const m = /^(?:Digit|Numpad)([1-4])$/.exec(e.code);
  return m ? Number(m[1]) : null;
};

// Состояние отправки данных.
let statusTarget = null;
function renderStatus() {
  if (!statusTarget) return;
  const names = { ok: "сохранены", sending: "отправляются", off: "отправка не настроена", error: "не отправлены, сохранены в браузере" };
  const parts = Object.keys(state.uploads).map(Number).sort((a, b) => a - b)
    .map((s) => `сессия ${s}: ${names[state.uploads[s]]}`);
  $(statusTarget).textContent = parts.length ? "Данные: " + parts.join("; ") : "";
}

async function message(html, hint, withStatus) {
  $("msg-body").innerHTML = html;
  $("msg-hint").textContent = hint || "";
  $("msg-status").textContent = "";
  statusTarget = withStatus ? "msg-status" : null;
  renderStatus();
  show("screen-msg");
  if (!AUTO) await waitFor(matchSpace);
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
  t.options.forEach((o, p) => { $("w" + p).textContent = o.word; });
  await nextFrame();
  show("screen-trial");
  const onset = await nextFrame(); // первый кадр после отрисовки изображения
  const onsetIso = new Date().toISOString();
  let resp;
  if (AUTO) {
    state.autoCount = (state.autoCount || 0) + 1;
    if (state.autoCount === Number(params.get("hold"))) await new Promise(() => {});
    await sleep(2);
    resp = { key: 1 + Math.floor(Math.random() * 4), ts: performance.now() };
  } else {
    resp = await waitFor(matchResponse);
  }
  const chosen = t.options[resp.key - 1];
  const st = STIMULI[t.stim] || {};
  state.rows.push({
    experiment: CONFIG.experiment, participant_id: state.pid, group: state.group,
    list_order: state.plan.map((p) => p.list).join("-"), first_task: state.plan[0].tasks[0],
    session: s.session, list: s.list, block: b.block, task: b.task, is_practice: practice ? 1 : 0,
    trial: i + 1, stim_id: t.stim, image: t.image, actor_sex: st.sex || "", angle: st.angle || "",
    opt1: t.options[0].word, opt2: t.options[1].word, opt3: t.options[2].word, opt4: t.options[3].word,
    role1: t.options[0].role, role2: t.options[1].role, role3: t.options[2].role, role4: t.options[3].role,
    key: resp.key, response: chosen.word, response_role: chosen.role,
    correct: chosen.role.indexOf("correct") === 0 ? 1 : 0,
    rt_ms: (resp.ts - onset).toFixed(1), onset_iso: onsetIso,
    gender: state.demo.gender, age: state.demo.age, native_language: state.demo.lang, handedness: state.demo.hand,
    screen: screen.width + "x" + screen.height, window: innerWidth + "x" + innerHeight, user_agent: navigator.userAgent,
  });
  backup();
}

function preload(paths) {
  let done = 0;
  const failed = [];
  const status = () => {
    $("load-status").textContent = `${TEXTS.loading}: ${done} из ${paths.length}` + (failed.length ? `, ошибок: ${failed.length}` : "");
  };
  status();
  return Promise.all(paths.map((p) => new Promise((resolve) => {
    const im = new Image();
    im.alt = "";
    im.onload = () => {
      const fin = () => { state.images[p] = im; done++; status(); resolve(); };
      if (im.decode) im.decode().then(fin, fin); else fin();
    };
    im.onerror = () => { failed.push(p); done++; status(); resolve(); };
    im.src = p;
  }))).then(() => failed);
}

async function prepare() {
  state.plan = Design.groupPlan(state.group);
  state.schedule = Design.buildSchedule(state.pid, state.group, STIMULI, LISTS, PRACTICE);
  $("full-text").textContent = TEXTS.fullscreen;
  show("screen-full");
  const paths = [...new Set(state.schedule.flatMap((s) => s.blocks.flatMap((b) => b.practice.concat(b.trials).map((t) => t.image))))];
  const failed = await preload(paths);
  if (failed.length) {
    $("load-status").textContent = "Не удалось загрузить изображения: " + failed.join(", ");
    return failed;
  }
  $("b-full").disabled = false;
  return failed;
}

async function run() {
  state.running = true;
  for (const s of state.schedule) {
    if (s.session < state.startSession) continue;
    for (const b of s.blocks) {
      await message(TEXTS[b.task], TEXTS.startHint);
      if (b.practice.length) {
        await message(TEXTS.practiceStart, TEXTS.startHint);
        for (let i = 0; i < b.practice.length; i++) await runTrial(b.practice[i], s, b, i, true);
        await message(TEXTS.practiceEnd, TEXTS.startHint);
      }
      for (let i = 0; i < b.trials.length; i++) await runTrial(b.trials[i], s, b, i, false);
    }
    uploadSession(s.session);
    if (s.session < 4) await message(TEXTS.pause(s.session), "", true);
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

function planText(group) {
  const plan = Design.groupPlan(group);
  const names = { direct: "прямая", reverse: "обратная" };
  return "Листы по сессиям: " + plan.map((p) => p.list).join("–") + "; первая задача: " + names[plan[0].tasks[0]];
}

$("f-group").addEventListener("change", () => {
  const g = $("f-group").value;
  $("plan").textContent = g ? planText(g) : "";
});

$("b-setup").addEventListener("click", () => {
  const pid = $("f-pid").value.trim();
  const group = Number($("f-group").value);
  let err = "";
  if (!/^[A-Za-z0-9_-]+$/.test(pid)) err = "Номер участника: латинские буквы, цифры, «-» или «_».";
  else if (!(group >= 1 && group <= 8)) err = "Выберите группу.";
  $("setup-error").textContent = err;
  if (err) return;
  state.pid = pid;
  state.group = group;
  state.startSession = Number($("f-start").value);
  $("consent-text").innerHTML = TEXTS.consent;
  show("screen-consent");
});

$("b-consent").addEventListener("click", () => show("screen-demo"));

$("f-lang-other").addEventListener("input", () => {
  document.querySelector('input[name="lang"][value="другой"]').checked = true;
});

$("b-demo").addEventListener("click", () => {
  const val = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;
  const gender = val("gender");
  const lang = val("lang");
  const hand = val("hand");
  const age = Number($("f-age").value);
  const other = $("f-lang-other").value.trim();
  let err = "";
  if (!gender) err = "Укажите пол.";
  else if (!Number.isInteger(age) || age < CONFIG.minAge || age > CONFIG.maxAge) err = `Укажите возраст от ${CONFIG.minAge} до ${CONFIG.maxAge} лет.`;
  else if (!lang || (lang === "другой" && !other)) err = "Укажите родной язык.";
  else if (!hand) err = "Укажите ведущую руку.";
  $("demo-error").textContent = err;
  if (err) return;
  state.demo = { gender: gender, age: age, lang: lang === "другой" ? other : lang, hand: hand };
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

if (AUTO) {
  state.pid = params.get("pid") || "auto";
  state.group = Number(params.get("group") || 1);
  state.startSession = Number(params.get("start") || 1);
  state.demo = { gender: "тест", age: 0, lang: "тест", hand: "тест" };
  prepare().then((failed) => { if (!failed.length) run(); });
}
