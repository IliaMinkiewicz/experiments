(function (root) {
  "use strict";

  // Порядок листов по сессиям: сбалансированный латинский квадрат 4×4.
  const LIST_ORDERS = [[1, 2, 4, 3], [2, 3, 1, 4], [3, 4, 2, 1], [4, 1, 3, 2]];
  // Позиции вариантов: 0 — слева сверху (клавиша 1), 1 — справа сверху (2), 2 — слева снизу (3), 3 — справа снизу (4).
  const PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

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

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

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

  function directOptions(item, correctPos, rand) {
    const opts = new Array(4);
    opts[correctPos] = { word: item.direct.correct, role: "correct" };
    const free = [0, 1, 2, 3].filter((p) => p !== correctPos);
    const ds = shuffle(item.direct.distractors.map((w, i) => ({ word: w, role: "distractor" + (i + 1) })), rand);
    free.forEach((p, i) => { opts[p] = ds[i]; });
    return opts;
  }

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

  // Тренировка: элемент — {stim: "S12"} (изображение из базы) или {image, direct, reverse} со своими словами.
  function practiceTrials(items, stimuli, task, seed) {
    const rand = makeRng(seed);
    return (items || []).map((it, k) => {
      const item = it.stim ? stimuli[it.stim] : it;
      if (!item || !item[task]) throw new Error("Тренировочная проба " + (k + 1) + ": нет вариантов для задачи " + task);
      return {
        stim: it.stim || "practice" + (k + 1),
        image: item.image,
        options: task === "direct"
          ? directOptions(item, Math.floor(rand() * 4), rand)
          : reverseOptions(item, PAIRS[Math.floor(rand() * 6)], rand),
      };
    });
  }

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
