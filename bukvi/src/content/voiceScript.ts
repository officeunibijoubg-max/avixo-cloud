import { letterLessons } from "@/data/alphabet";
import { numberLessons } from "@/data/numbers";
import { WORD_ITEMS } from "@/data/wordsIsland";
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
    add(g, `letter-${l.id}-small-trace`, phrases.traceSmallLetter(s));
    add(g, `letter-${l.id}-small-write`, phrases.writeSmallLetter(s));
  }

  for (const n of numberLessons) {
    const g = `Цифра ${n.character}`;
    add(g, `number-${n.id}-intro`, n.spokenText);
    add(g, `number-${n.id}-trace`, phrases.traceNumber(n.spokenName));
    add(g, `number-${n.id}-write`, phrases.writeNumber(n.spokenName));
    add(g, `number-${n.id}-bravo`, phrases.correctFor("number", n.spokenName));
  }

  for (const w of WORD_ITEMS) {
    const g = `Остров: ${w.text}`;
    add(g, `word-${w.id}`, w.spoken);
    add(g, `word-${w.id}-intro`, phrases.wordIntro(w.spoken, w.kind === "syllable"));
    add(g, `word-${w.id}-bravo`, phrases.wordDone(w.spoken));
  }

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
