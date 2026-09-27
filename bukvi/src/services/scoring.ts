import type { Difficulty, Point, ScoreGrade, Stroke, StrokeTemplate } from "@/lib/types";
import { GRADE_THRESHOLDS, SCORING, TOLERANCE, type ToleranceConfig } from "@/config/scoring";

// Локално оценяване на изписването — без OCR и без мрежа.
//
// Идеята: и движенията на детето, и шаблонът се превръщат в гъсти, равномерно
// разположени точки. После броим:
//   • покритие — колко от всяко движение на шаблона е „минато“ от детето;
//   • точност — колко от мастилото на детето лежи върху шаблона;
//   • посока — движи ли се детето по посоката на шаблона;
//   • брой движения — близо ли е до очаквания.
// Липсващо движение (напр. чертичката на А) или много драскане извън буквата
// свалят оценката рязко, дори останалото да е чудесно.

export type ScoreBreakdown = {
  score: number;
  coverage: number;
  precision: number;
  direction: number;
  strokeCountScore: number;
  minStrokeCoverage: number;
  strokeCoverage: number[];
  strokeCount: number;
  templateIndex: number;
  aligned: boolean;
};

type Sample = Point & { stroke: number; t: number };

// ───────────────────────── геометрия ─────────────────────────

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function pathLength(stroke: Stroke): number {
  let len = 0;
  for (let i = 1; i < stroke.length; i++) len += dist(stroke[i - 1], stroke[i]);
  return len;
}

/** Премахва точки, които са твърде близо до предходната. */
export function dedupe(stroke: Stroke, gap: number = SCORING.minPointGap): Stroke {
  const out: Stroke = [];
  for (const pt of stroke) {
    const last = out[out.length - 1];
    if (!last || dist(last, pt) >= gap) out.push(pt);
  }
  const tail = stroke[stroke.length - 1];
  if (tail && out.length > 0 && out[out.length - 1] !== tail && dist(out[out.length - 1], tail) > 0) out.push(tail);
  return out;
}

/** Равномерно разполага точки по линията през `step` единици. */
export function resample(stroke: Stroke, step: number = SCORING.sampleStep): Stroke {
  if (stroke.length < 2) return stroke.slice();
  const out: Stroke = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const seg = dist(a, b);
    if (seg === 0) continue;
    let d = step - carry;
    while (d <= seg) {
      const k = d / seg;
      out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
      d += step;
    }
    carry = seg - (d - step);
  }
  const last = stroke[stroke.length - 1];
  if (dist(out[out.length - 1], last) > step * 0.25) out.push(last);
  return out;
}

type Box = { minX: number; minY: number; maxX: number; maxY: number };

export function boundingBox(strokes: Stroke[]): Box {
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const s of strokes)
    for (const pt of s) {
      box.minX = Math.min(box.minX, pt.x);
      box.minY = Math.min(box.minY, pt.y);
      box.maxX = Math.max(box.maxX, pt.x);
      box.maxY = Math.max(box.maxY, pt.y);
    }
  return box;
}

/**
 * Мащабира рисунката на детето равномерно, за да заеме мястото на шаблона
 * (нормализиране спрямо bounding box, без да се разваля пропорцията).
 */
export function alignTo(user: Stroke[], template: Stroke[]): Stroke[] {
  const u = boundingBox(user);
  const t = boundingBox(template);
  const uSize = Math.max(u.maxX - u.minX, u.maxY - u.minY, 1e-6);
  const tSize = Math.max(t.maxX - t.minX, t.maxY - t.minY);
  const s = tSize / uSize;
  const ucx = (u.minX + u.maxX) / 2;
  const ucy = (u.minY + u.maxY) / 2;
  const tcx = (t.minX + t.maxX) / 2;
  const tcy = (t.minY + t.maxY) / 2;
  return user.map((st) => st.map((pt) => ({ x: tcx + (pt.x - ucx) * s, y: tcy + (pt.y - ucy) * s })));
}

// ───────────────────────── оценяване ─────────────────────────

/** Подготвя движенията на детето: чисти, пропуска случайни точки и ги сгъстява. */
export function prepareUserStrokes(strokes: Stroke[]): Stroke[] {
  return strokes
    .map((s) => dedupe(s))
    .filter((s) => s.length > 0 && (s.length > 1 ? pathLength(s) >= 3 : false))
    .map((s) => resample(s));
}

function sampleTemplate(template: StrokeTemplate): { samples: Sample[]; lengths: number[] } {
  const samples: Sample[] = [];
  const lengths: number[] = [];
  template.strokes.forEach((stroke, i) => {
    const pts = resample(stroke);
    let t = 0;
    pts.forEach((pt, j) => {
      if (j > 0) t += dist(pts[j - 1], pt);
      samples.push({ ...pt, stroke: i, t });
    });
    lengths.push(pathLength(stroke));
  });
  return { samples, lengths };
}

const credit = (d: number, tol: ToleranceConfig) =>
  d <= tol.near ? 1 : d >= tol.far ? 0 : 1 - (d - tol.near) / (tol.far - tol.near);

/** Без наказание над „коляното“ k, под него — бързо нарастващо. */
const knee = (x: number, k: number) => (x >= k ? 1 : 0.45 + 0.55 * Math.pow(Math.max(0, x) / k, 2));

/** Средният кредит на последователни парчета от всяко движение (на шаблона или на детето). */
function partCoverage(samples: { stroke: number }[], credits: number[]): number[] {
  const perPart = Math.max(2, Math.round(SCORING.partLength / SCORING.sampleStep));
  const parts: number[] = [];
  let sum = 0;
  let n = 0;
  samples.forEach((s, i) => {
    sum += credits[i];
    n += 1;
    const next = samples[i + 1];
    if (n === perPart || !next || next.stroke !== s.stroke) {
      // Твърде късо остатъчно парче се слива с предишното, за да не е шумно.
      if (n < perPart / 2 && parts.length && (!next || next.stroke !== s.stroke)) {
        const prev = parts.pop() as number;
        parts.push((prev * perPart + sum) / (perPart + n));
      } else parts.push(sum / n);
      sum = 0;
      n = 0;
    }
  });
  return parts.length ? parts : [0];
}

function scoreAligned(user: Stroke[], template: StrokeTemplate, tol: ToleranceConfig): Omit<ScoreBreakdown, "templateIndex" | "aligned"> {
  const { samples, lengths } = sampleTemplate(template);
  const userPts: { pt: Point; stroke: number }[] = [];
  user.forEach((s, i) => s.forEach((pt) => userPts.push({ pt, stroke: i })));

  // Покритие на всяко движение от шаблона.
  const covSum = new Array(template.strokes.length).fill(0);
  const covCnt = new Array(template.strokes.length).fill(0);
  const covCredits: number[] = [];
  for (const s of samples) {
    let best = Infinity;
    for (const u of userPts) best = Math.min(best, dist(s, u.pt));
    const c = credit(best, tol);
    covCredits.push(c);
    covSum[s.stroke] += c;
    covCnt[s.stroke] += 1;
  }
  const strokeCoverage = covSum.map((v, i) => (covCnt[i] ? v / covCnt[i] : 0));
  const totalLen = lengths.reduce((a, b) => a + b, 0) || 1;
  const coverage = strokeCoverage.reduce((acc, c, i) => acc + c * lengths[i], 0) / totalLen;
  // Най-слабо покритото парче (~partLength единици) от шаблона: хваща липсваща
  // чертичка или половин осмица, които средното покритие би скрило.
  const minStrokeCoverage = Math.min(...partCoverage(samples, covCredits));

  // Точност + към кое място от шаблона „пада“ всяка точка на детето.
  let precSum = 0;
  const precCredits: number[] = [];
  const nearest: (Sample | null)[] = [];
  for (const u of userPts) {
    let best = Infinity;
    let bestS: Sample | null = null;
    for (const s of samples) {
      const d = dist(s, u.pt);
      if (d < best) {
        best = d;
        bestS = s;
      }
    }
    const c = credit(best, tol);
    precCredits.push(c);
    precSum += c;
    nearest.push(best < tol.far ? bestS : null);
  }
  const precision = userPts.length ? precSum / userPts.length : 0;
  // Най-отдалеченото парче мастило: излишна примка или черта извън буквата.
  const minInkPart = Math.min(...partCoverage(userPts, precCredits));

  // Посока: в рамките на едно движение на детето, расте ли позицията по шаблона?
  const inc = new Array(template.strokes.length).fill(0);
  const dec = new Array(template.strokes.length).fill(0);
  for (let i = 1; i < userPts.length; i++) {
    const a = nearest[i - 1];
    const b = nearest[i];
    if (!a || !b || a.stroke !== b.stroke || userPts[i].stroke !== userPts[i - 1].stroke) continue;
    const delta = b.t - a.t;
    // Големите скокове са „шевът“ на затворена форма (О, 0, 8) — пропускаме ги.
    if (Math.abs(delta) < 1 || Math.abs(delta) > lengths[a.stroke] / 2) continue;
    if (delta > 0) inc[a.stroke] += 1;
    else dec[a.stroke] += 1;
  }
  let dirW = 0;
  let dirSum = 0;
  inc.forEach((n, i) => {
    const total = n + dec[i];
    if (total === 0) return;
    dirW += lengths[i];
    dirSum += (n / total) * lengths[i];
  });
  const direction = dirW ? dirSum / dirW : 1;

  const expected = template.strokes.length;
  const strokeCountScore = Math.max(0, Math.min(1, 1 - 0.25 * Math.max(0, Math.abs(user.length - expected) - 1)));

  const countWeight = 0.08;
  const shapeWeight = (1 - tol.directionWeight - countWeight) / 2;
  let score =
    shapeWeight * coverage + shapeWeight * precision + tol.directionWeight * direction + countWeight * strokeCountScore;
  score *= knee(minStrokeCoverage, SCORING.strokeCoverageKnee) * knee(precision, SCORING.precisionKnee);
  if (minInkPart < SCORING.inkPartKnee) score *= 0.55 + 0.45 * Math.pow(minInkPart / SCORING.inkPartKnee, 2);

  // Твърде малко мастило (само точка или чертичка) — не може да е вярно.
  const inkLen = user.reduce((a, s) => a + pathLength(s), 0);
  const inkRatio = inkLen / totalLen;
  if (inkRatio < SCORING.minInkRatio) score *= 0.5 * (inkRatio / SCORING.minInkRatio);
  // Много повече мастило от буквата = драскане.
  if (inkRatio > SCORING.maxInkRatio) score *= SCORING.maxInkRatio / inkRatio;

  return {
    score: Math.round(Math.max(0, Math.min(1, score)) * 100),
    coverage,
    precision,
    direction,
    strokeCountScore,
    minStrokeCoverage,
    strokeCoverage,
    strokeCount: user.length,
  };
}

/**
 * Оценява изписването спрямо всички допустими шаблони и връща най-добрия резултат.
 * `strokes` са в координатите на шаблона (0..100).
 */
export function scoreDrawing(strokes: Stroke[], templates: StrokeTemplate[], difficulty: Difficulty): ScoreBreakdown {
  const tol = TOLERANCE[difficulty];
  const user = prepareUserStrokes(strokes);
  const empty: ScoreBreakdown = {
    score: 0,
    coverage: 0,
    precision: 0,
    direction: 0,
    strokeCountScore: 0,
    minStrokeCoverage: 0,
    strokeCoverage: [],
    strokeCount: user.length,
    templateIndex: 0,
    aligned: false,
  };
  if (user.length === 0) return empty;

  const box = boundingBox(user);
  const tooSmall = Math.max(box.maxX - box.minX, box.maxY - box.minY) < SCORING.minDrawingSize;

  let best = empty;
  templates.forEach((template, templateIndex) => {
    const candidates: ScoreBreakdown[] = [];
    if (tol.usePosition) candidates.push({ ...scoreAligned(user, template, tol), templateIndex, aligned: false });
    // Сравнение само по форма: прощава буква, написана малко встрани или по-малка.
    const shaped = scoreAligned(alignTo(user, template.strokes), template, tol);
    const penalty = tol.usePosition ? 5 : 0;
    candidates.push({ ...shaped, score: Math.max(0, shaped.score - penalty), templateIndex, aligned: true });
    for (const c of candidates) if (c.score > best.score) best = c;
  });

  if (tooSmall) best = { ...best, score: Math.min(best.score, 20) };
  return best;
}

export function gradeFor(score: number): ScoreGrade {
  if (score >= GRADE_THRESHOLDS.excellent) return "excellent";
  if (score >= GRADE_THRESHOLDS.correct) return "correct";
  if (score >= GRADE_THRESHOLDS.almost) return "almost";
  return "retry";
}

export const isPassing = (score: number, difficulty: Difficulty) => score >= TOLERANCE[difficulty].passScore;
