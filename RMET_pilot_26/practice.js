// Тренировочные пробы: по четыре для каждой задачи, перед первым блоком этой задачи в первой сессии.
// Изображения из McGill Face Database с эмоциями, которых нет среди 144 основных; в каждой задаче
// по одному изображению актрисы и актёра в анфас и в три четверти. Порядок проб одинаковый для всех,
// позиции вариантов задаются в design.js.
// Изображение из базы: {stim: "S12"}.
// Своё изображение: {id, image, sex, angle,
//   direct: {correct: "...", distractors: ["...", "...", "..."]}
//   или reverse: {correct: ["...", "..."], distractors: ["...", "..."]}}.
const PRACTICE = {
  direct: [
    { id: "P1", image: "STIMULI/practice/P1.png", sex: "Женский", angle: "анфас",
      direct: { correct: "заигрывающий", distractors: ["испуганный", "раздраженный", "подавленный"] } },
    { id: "P2", image: "STIMULI/practice/P2.png", sex: "Мужской", angle: "три четверти",
      direct: { correct: "нервный", distractors: ["довольный", "игривый", "злой"] } },
    { id: "P5", image: "STIMULI/practice/P5.png", sex: "Женский", angle: "три четверти",
      direct: { correct: "растерянный", distractors: ["веселый", "уверенный", "благодарный"] } },
    { id: "P6", image: "STIMULI/practice/P6.png", sex: "Мужской", angle: "анфас",
      direct: { correct: "восхищенный", distractors: ["безразличный", "виноватый", "раздосадованный"] } },
  ],
  reverse: [
    { id: "P3", image: "STIMULI/practice/P3.png", sex: "Женский", angle: "три четверти",
      reverse: { correct: ["тревога", "сочувствие"], distractors: ["веселье", "раздражение"] } },
    { id: "P4", image: "STIMULI/practice/P4.png", sex: "Мужской", angle: "анфас",
      reverse: { correct: ["симпатия", "смущение"], distractors: ["грусть", "обида"] } },
    { id: "P7", image: "STIMULI/practice/P7.png", sex: "Женский", angle: "анфас",
      reverse: { correct: ["спокойствие", "дружелюбие"], distractors: ["отвращение", "зависть"] } },
    { id: "P8", image: "STIMULI/practice/P8.png", sex: "Мужской", angle: "три четверти",
      reverse: { correct: ["возмущение", "настороженность"], distractors: ["радость", "умиление"] } },
  ],
};
