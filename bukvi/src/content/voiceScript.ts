import { letterLessons } from "@/data/alphabet";
import { numberLessons } from "@/data/numbers";
import { WORD_ITEMS } from "@/data/wordsIsland";
import { COLORS, shapeLessons } from "@/data/shapes";
import { STORIES } from "./stories";
import { SOUND_WORDS } from "@/data/soundWords";
import { READING_WORDS } from "@/data/readingWords";
import { FEATURES } from "@/data/unlocks";
import { PATH } from "@/data/path";
import { numberName } from "@/data/math";
import { WEAR_FUN } from "./phrases";
import { SHOP_ITEMS } from "@/data/shop";
import { LEVELS } from "@/data/lessons";
import { CHALLENGES } from "@/config/challenges";
import { MASCOTS } from "@/config/mascot";
import { ENCOURAGE, PRAISE, phrases } from "./phrases";

// Пълният сценарий за записан глас: всяка фраза, която приложението изговаря,
// с постоянно id. Файлът `public/audio/<id>.mp3` (или .m4a/.ogg) заменя синтезатора
// за точно този текст — останалите фрази продължават с браузърния глас.

export type VoiceLine = { id: string; text: string; group: string };

export function voiceLines(): VoiceLine[] {
  const out: VoiceLine[] = [];
  const add = (group: string, id: string, text: string) => out.push({ id, text, group });

  for (const l of letterLessons) {
    const g = `Буква ${l.character}`;
    const s = l.spokenName;
    add(g, `letter-${l.id}-sound`, s);
    add(g, `letter-${l.id}-intro`, l.spokenText);
    add(g, `letter-${l.id}-trace`, phrases.traceLetter(s));
    add(g, `letter-${l.id}-write`, phrases.writeLetter(s));
    add(g, `letter-${l.id}-bravo`, phrases.correctFor("letter", s));
    add(g, `letter-${l.id}-find`, phrases.findLetter(s));
    add(g, `letter-${l.id}-balloon`, phrases.popBalloon(s));
    add(g, `letter-${l.id}-today`, phrases.adventureToday(s));
    add(g, `letter-${l.id}-alone`, phrases.adventureWriteAlone(s));
    add(g, `letter-${l.id}-picture`, (l.inWord ? phrases.adventurePictureIn : phrases.adventurePicture)(s));
    add(g, `letter-${l.id}-next`, phrases.wordNextLetter(s));
    if (l.exampleWord) add(g, `letter-${l.id}-startswith`, phrases.startsWith(l.exampleWord));
    add(g, `letter-${l.id}-listen-write`, phrases.listenWrite(s));
    add(g, `letter-${l.id}-review`, phrases.reviewWrite(s));
    add(g, `letter-${l.id}-small-today`, phrases.adventureTodaySmall(s));
    add(g, `letter-${l.id}-story-end`, phrases.storyEnd(s));
    if (l.exampleWord) {
      add(g, `letter-${l.id}-word`, l.exampleWord);
      add(g, `letter-${l.id}-memory`, phrases.memoryPair(s, l.exampleWord.toLowerCase()));
    }
    add(g, `letter-${l.id}-small-trace`, phrases.traceSmallLetter(s));
    add(g, `letter-${l.id}-small-write`, phrases.writeSmallLetter(s));
  }

  for (const n of numberLessons) {
    const g = `Цифра ${n.character}`;
    add(g, `number-${n.id}-intro`, n.spokenText);
    add(g, `number-${n.id}-trace`, phrases.traceNumber(n.spokenName));
    add(g, `number-${n.id}-write`, phrases.writeNumber(n.spokenName));
    add(g, `number-${n.id}-bravo`, phrases.correctFor("number", n.spokenName));
    add(g, `number-${n.id}-sound`, n.spokenName);
    add(g, `number-${n.id}-today`, phrases.adventureTodayNumber(n.spokenName.toLowerCase()));
    add(g, `number-${n.id}-find`, phrases.findNumber(n.spokenName.toLowerCase()));
    add(g, `number-${n.id}-alone`, phrases.adventureWriteAlone(n.spokenName));
    add(g, `number-${n.id}-review`, phrases.reviewWrite(n.spokenName));
  }

  for (const w of WORD_ITEMS) {
    const g = `Остров: ${w.text}`;
    add(g, `word-${w.id}`, w.spoken);
    add(g, `word-${w.id}-intro`, phrases.wordIntro(w.spoken, w.kind === "syllable"));
    add(g, `word-${w.id}-bravo`, phrases.wordDone(w.spoken));
  }

  for (const sh of shapeLessons) {
    add("Форми", `${sh.id}-draw`, sh.spokenText);
    add("Форми", `${sh.id}-intro`, phrases.shapeIntro(sh.spokenName));
    add("Форми", `${sh.id}-bravo`, phrases.correctFor("shape", sh.spokenName));
  }
  for (const c of COLORS) add("Цветове", `color-${c.id}`, phrases.touchColor(c.name));

  for (const st of STORIES) st.pages.forEach((pg, i) => add(`Приказка: ${st.title}`, `story-${st.id}-${i + 1}`, pg.text));

  // Пътят на обучение
  add("Пътят", "path-hello", phrases.pathHello);
  add("Пътят", "sound-works", phrases.soundWorks);
  add("Пътят", "path-locked", phrases.pathLocked);
  add("Пътят", "path-done", phrases.pathDone);
  for (const f of FEATURES) add("Пътят", `new-game-${f.id}`, phrases.newGameIntro(f.title));
  for (const st of STORIES) add("Пътят", `new-story-${st.id}`, phrases.newStoryIntro(st.title));
  for (let n = 1; n <= PATH.length; n++) add("Пътят", `locked-steps-${n}`, phrases.lockedFeature(phrases.stepsAway(n)));

  // Числа: всички задачи до 10
  for (let a = 1; a <= 9; a++)
    for (let b = 1; a + b <= 10; b++) add("Сметки", `add-${a}-${b}`, phrases.addQuestion(numberName(a), numberName(b)));
  for (let a = 2; a <= 10; a++)
    for (let b = 1; b < a; b++) add("Сметки", `sub-${a}-${b}`, phrases.subQuestion(numberName(a), numberName(b)));

  // Звуци, срички и четене
  SOUND_WORDS.forEach((w, i) => {
    add("Звуци", `sound-first-${i + 1}`, phrases.firstSound(w.word));
    add("Звуци", `sound-last-${i + 1}`, phrases.lastSound(w.word));
  });
  for (const w of READING_WORDS) {
    const word = w.word.toLowerCase();
    add("Четене", `read-${w.image}`, word);
    add("Четене", `build-${w.image}`, phrases.buildWord(word));
    add("Четене", `built-${w.image}`, phrases.wordBuilt(w.syllables.map((x) => x.toLowerCase()).join(" - "), word));
    w.syllables.forEach((x) => add("Четене", `syl-${x}`, x.toLowerCase()));
  }
  add("Четене", "read-word", phrases.readWord);

  // Магазин
  add("Магазин", "shop-hello", phrases.shopHello);
  add("Магазин", "take-off", phrases.takeOff);
  add("Магазин", "take-off-all", phrases.takeOffAll);
  WEAR_FUN.forEach((t, i) => add("Магазин", `wear-fun-${i + 1}`, t));
  for (const item of SHOP_ITEMS) add("Магазин", `try-${item.id}`, item.category === "friend" ? phrases.tryFriend(item.name) : phrases.tryOn(item.name));
  for (let n = 1; n <= Math.max(...SHOP_ITEMS.map((i) => i.price)); n++) add("Магазин", `need-coins-${n}`, phrases.needCoins(n));

  const g = "Общи фрази";
  PRAISE.forEach((t, i) => add(g, `praise-${i + 1}`, t));
  ENCOURAGE.forEach((t, i) => add(g, `encourage-${i + 1}`, t));
  add(g, "almost", phrases.almost);
  add(g, "hint-follow", phrases.hintFollow);
  add(g, "hint-watch", phrases.hintWatch);
  add(g, "wrong-choice", phrases.wrongChoice);
  add(g, "game-over", phrases.gameOver);
  add(g, "count-them", phrases.countThem);
  add(g, "star-earned", phrases.starEarned);
  add(g, "sticker-earned", phrases.stickerEarned);
  add(g, "locked-node", phrases.lockedNode);
  add(g, "locked-world", phrases.lockedWorld);
  add(g, "small-hello", phrases.smallHello);
  add(g, "name-task", phrases.nameTask);
  add(g, "memory-start", phrases.memoryStart);
  add(g, "memory-no", phrases.memoryNo);
  add(g, "story-pick", phrases.storyPick);
  add(g, "story-question", phrases.storyQuestion);
  add(g, "compare-more", phrases.compareMore);
  add(g, "compare-fewer", phrases.compareFewer);
  add(g, "name-not-set", phrases.nameNotSet);
  add(g, "adventure-listen", phrases.adventureListen);
  add(g, "adventure-done", phrases.adventureDone);
  for (let lvl = 2; lvl <= LEVELS.length + 1; lvl++) add(g, `level-${lvl}`, phrases.levelUp(lvl));
  for (let d = 1; d <= 7; d++) add(g, `challenge-done-${d}`, phrases.challengeDone(d));
  for (const c of CHALLENGES) add(g, `challenge-${c.id}`, c.text);
  for (const [key, m] of Object.entries(MASCOTS)) add(g, `greeting-${key}`, phrases.greeting(m.name));
  for (const item of SHOP_ITEMS) add("Магазин", `bought-${item.id}`, phrases.bought(item.name));

  // Един и същ текст се записва веднъж (напр. „Напиши буквата …“ в различни игри).
  const seen = new Set<string>();
  return out.filter((l) => (seen.has(l.text) ? false : (seen.add(l.text), true)));
}
