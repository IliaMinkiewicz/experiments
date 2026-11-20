// Расписание участника: порядок листов и задач по сессиям, порядок изображений в блоке,
// расстановка четырёх слов по позициям. Случайность задаётся номером участника,
// поэтому для одного и того же номера расписание всегда одинаковое и его можно восстановить.
// Файл подключается и на странице (window.Design), и в проверках под Node.js.
(function (root) {
  "use strict";

  // Порядок листов по сессиям для групп 1–4 и 5–8: сбалансированный латинский квадрат 4×4.
  const LIST_ORDERS = [[1, 2, 4, 3], [2, 3, 1, 4], [3, 4, 2, 1], [4, 1, 3, 2]];
  // Позиции вариантов: 0 — слева вверху, 1 — справа вверху, 2 — слева внизу, 3 — справа внизу.
  // Все шесть пар позиций для двух правильных ответов обратной задачи.
  const PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  // Те же пары, сгруппированные так, что две пары одной группы вместе занимают все четыре позиции.
  const MATCHINGS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];

  // Генератор случайных чисел с зерном: строка → число (FNV-1a) → последовательность (Mulberry32).
  function hashString(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng(seed) {
    return mulberry32(hashString(String(seed)));
  }

  // Перемешанная копия массива (исходный не меняется).
  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // План группы: какой лист в какой сессии и в каком порядке задачи (группы 1–4 начинают с прямой,
  // 5–8 — с обратной; дальше порядок задач чередуется по сессиям).
  function groupPlan(group) {
    const g = Number(group);
    if (!(g >= 1 && g <= 8)) throw new Error("Номер группы должен быть от 1 до 8");
    const lists = LIST_ORDERS[(g - 1) % 4];
    const first = g <= 4 ? "direct" : "reverse";
    const second = first === "direct" ? "reverse" : "direct";
    return lists.map((list, i) => ({
      session: i + 1,
      list: list,
      tasks: i % 2 === 0 ? [first, second] : [second, first],
    }));
  }

  // Четыре слова прямой задачи: правильное — на позицию correctPos, три дистрактора — на остальные в случайном порядке.
  function directOptions(item, correctPos, rand) {
    const opts = new Array(4);
    opts[correctPos] = { word: item.direct.correct, role: "correct" };
    const free = [0, 1, 2, 3].filter((p) => p !== correctPos);
    const ds = shuffle(item.direct.distractors.map((w, i) => ({ word: w, role: "distractor" + (i + 1) })), rand);
    free.forEach((p, i) => { opts[p] = ds[i]; });
    return opts;
  }

  // Четыре слова обратной задачи: два правильных — на пару позиций pair, два дистрактора — на остальные.
  function reverseOptions(item, pair, rand) {
    const opts = new Array(4);
    const cs = shuffle(item.reverse.correct.map((w, i) => ({ word: w, role: "correct" + (i + 1) })), rand);
    opts[pair[0]] = cs[0];
    opts[pair[1]] = cs[1];
    const free = [0, 1, 2, 3].filter((p) => p !== pair[0] && p !== pair[1]);
    const ds = shuffle(item.reverse.distractors.map((w, i) => ({ word: w, role: "distractor" + (i + 1) })), rand);
    free.forEach((p, i) => { opts[p] = ds[i]; });
    return opts;
  }

  // Основной блок: случайный порядок изображений; в прямой задаче правильный ответ стоит
  // на каждой из 4 позиций одинаково часто, в обратной два правильных ответа занимают
  // каждую из 6 пар позиций одинаково часто.
  function blockTrials(ids, stimuli, task, seed) {
    const rand = makeRng(seed);
    const order = shuffle(ids, rand);
    const n = order.length;
    const slots = task === "direct"
      ? shuffle(Array.from({ length: n }, (_, i) => i % 4), rand)
      : shuffle(Array.from({ length: n }, (_, i) => PAIRS[i % 6]), rand);
    return order.map((id, i) => ({
      stim: id,
      image: stimuli[id].image,
      options: task === "direct"
        ? directOptions(stimuli[id], slots[i], rand)
        : reverseOptions(stimuli[id], slots[i], rand),
    }));
  }

  // Тренировка: элемент — {stim: "S12"} (изображение из базы) или {image, sex, angle, direct, reverse} со своими словами.
  // Пробы идут в порядке списка. Позиции уравнены, как в основных блоках: в прямой задаче правильный ответ
  // стоит на каждой позиции одинаково часто, в обратной при чётном числе проб каждая позиция
  // занята правильным ответом одинаково часто (пары берутся по две из одной группы MATCHINGS).
  function practiceTrials(items, stimuli, task, seed) {
    const rand = makeRng(seed);
    const list = items || [];
    const ms = task === "direct" ? null : shuffle(MATCHINGS, rand);
    const slots = shuffle(list.map((_, i) => (ms ? ms[Math.floor(i / 2) % 3][i % 2] : i % 4)), rand);
    return list.map((it, k) => {
      const item = it.stim ? stimuli[it.stim] : it;
      if (!item || !item[task]) throw new Error("Тренировочная проба " + (k + 1) + ": нет вариантов для задачи " + task);
      return {
        stim: it.stim || it.id || "practice" + (k + 1),
        image: item.image,
        sex: item.sex,
        angle: item.angle,
        options: task === "direct" ? directOptions(item, slots[k], rand) : reverseOptions(item, slots[k], rand),
      };
    });
  }

  // Полное расписание участника: 4 сессии × 2 блока; тренировка — только в сессии 1.
  function buildSchedule(pid, group, stimuli, lists, practice) {
    return groupPlan(group).map((s) => ({
      session: s.session,
      list: s.list,
      blocks: s.tasks.map((task, b) => ({
        block: b + 1,
        task: task,
        practice: s.session === 1 ? practiceTrials((practice || {})[task], stimuli, task, pid + "|practice|" + task) : [],
        trials: blockTrials(lists[String(s.list)], stimuli, task, pid + "|" + group + "|s" + s.session + "|" + task),
      })),
    }));
  }

  const api = { LIST_ORDERS, PAIRS, groupPlan, blockTrials, practiceTrials, buildSchedule, makeRng, shuffle };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Design = api;
})(typeof window !== "undefined" ? window : this);
