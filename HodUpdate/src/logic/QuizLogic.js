/*
 * QuizLogic.js
 * ------------------------------------------------------------------
 * Pure quiz logic (NO React here). Generates math questions for every
 * subject + difficulty level and checks answers. QuizPage imports from
 * this file and only handles display + state. If the rules for building
 * questions need to change, change them ONLY here.
 * ------------------------------------------------------------------
 */

// Number of questions served in a single quiz session.
export const QUESTIONS_PER_QUIZ = 5;

/*
 * Difficulty ranges per subject (the "recipe book").
 * Addition/Subtraction/Multiplication use a [min, max] operand range.
 * Division stores the maximum dividend (the value is built backwards).
 * Percentages have their own rules inside their generator.
 */
const RANGES = {
  addition:       { beginner: [1, 10], intermediate: [10, 1000], advanced: [1000, 1000000] },
  subtraction:    { beginner: [1, 10], intermediate: [10, 1000], advanced: [1000, 1000000] },
  multiplication: { beginner: [1, 10], intermediate: [10, 20],   advanced: [20, 100] },
  division:       { beginner: 10,      intermediate: 100,        advanced: 1000 }, // max dividend
};

/*
 * Small generic helpers shared by all generators.
 */
function randomInt(min, max) {
  // Inclusive random integer in [min, max].
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  // Fisher-Yates shuffle; returns a new array, leaves the input untouched.
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function gcd(a, b) {
  // Greatest common divisor, used to simplify fractions.
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(numerator, denominator) {
  // Reduce a fraction and return it as an "n/d" string.
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator)) || 1;
  return `${numerator / divisor}/${denominator / divisor}`;
}

/*
 * Answer-option builders.
 * Numeric: the correct value + 3 unique nearby distractors, shuffled.
 * List:    the correct string + distractor strings filled in, shuffled.
 */
function buildNumericOptions(correct) {
  const options = new Set([correct]);
  // Distractor spread grows a little with the size of the answer.
  const spread = Math.max(5, Math.round(Math.abs(correct) * 0.1));
  while (options.size < 4) {
    const offset = randomInt(1, spread);
    const candidate = Math.random() < 0.5 ? correct - offset : correct + offset;
    if (candidate >= 0 && candidate !== correct) options.add(candidate);
  }
  return shuffle([...options]);
}

function buildListOptions(correct, candidates) {
  const options = new Set([correct]);
  for (const candidate of shuffle(candidates)) {
    if (options.size >= 4) break;
    if (candidate && candidate !== correct) options.add(candidate);
  }
  return shuffle([...options]);
}

/*
 * Addition / Subtraction / Multiplication.
 * Two operands from the level range. Subtraction orders the operands so
 * the result is never negative (kid-friendly).
 */
function genAddition(level) {
  const [min, max] = RANGES.addition[level];
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  const correct = a + b;
  return { question: `${a} + ${b} = ?`, correctAnswer: correct, options: buildNumericOptions(correct) };
}

function genSubtraction(level) {
  const [min, max] = RANGES.subtraction[level];
  let a = randomInt(min, max);
  let b = randomInt(min, max);
  if (b > a) [a, b] = [b, a]; // keep a >= b so the answer stays non-negative
  const correct = a - b;
  return { question: `${a} - ${b} = ?`, correctAnswer: correct, options: buildNumericOptions(correct) };
}

function genMultiplication(level) {
  const [min, max] = RANGES.multiplication[level];
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  const correct = a * b;
  return { question: `${a} × ${b} = ?`, correctAnswer: correct, options: buildNumericOptions(correct) };
}

/*
 * Division built "backwards" so the answer is ALWAYS a whole number:
 * pick the divisor and the quotient first, then dividend = divisor * quotient,
 * keeping the dividend under the level's maximum.
 */
function genDivision(level) {
  const maxDividend = RANGES.division[level];
  const divisor = randomInt(2, 10);
  const maxQuotient = Math.max(2, Math.floor(maxDividend / divisor));
  const quotient = randomInt(2, maxQuotient);
  const dividend = divisor * quotient;
  return { question: `${dividend} ÷ ${divisor} = ?`, correctAnswer: quotient, options: buildNumericOptions(quotient) };
}

/*
 * Percentages — operands chosen so the answer is always whole:
 * beginner     -> 10% / 50% / 100% of a multiple of 10
 * intermediate -> a multiple of 10% of a multiple of 10
 * advanced     -> any percent of a multiple of 100 (base up to 1000)
 */
function genPercentage(level) {
  let percent;
  let base;
  if (level === 'beginner') {
    percent = [10, 50, 100][randomInt(0, 2)];
    base = randomInt(1, 10) * 10;
  } else if (level === 'intermediate') {
    percent = randomInt(1, 9) * 10;
    base = randomInt(1, 20) * 10;
  } else {
    percent = randomInt(1, 100);
    base = randomInt(1, 10) * 100;
  }
  const correct = (percent * base) / 100;
  return { question: `${percent}% of ${base} = ?`, correctAnswer: correct, options: buildNumericOptions(correct) };
}

/*
 * Fractions (answers/options are fraction strings like "3/4").
 * beginner     -> choose the largest of 4 proper fractions (comparison)
 * intermediate -> add two fractions with the SAME denominator
 * advanced     -> add two fractions with DIFFERENT denominators
 */
function genFractionCompare() {
  const fractions = [];
  const seenValues = new Set();
  // Collect 4 proper fractions with distinct values (denominator up to 5).
  while (fractions.length < 4) {
    const d = randomInt(2, 5);
    const n = randomInt(1, d - 1);
    const value = n / d;
    if (!seenValues.has(value)) {
      seenValues.add(value);
      fractions.push({ label: `${n}/${d}`, value });
    }
  }
  const largest = fractions.reduce((a, b) => (b.value > a.value ? b : a));
  return {
    question: 'Which fraction is the largest?',
    correctAnswer: largest.label,
    options: shuffle(fractions.map((f) => f.label)),
  };
}

function genFractionSameDen() {
  const d = randomInt(2, 8);
  const a = randomInt(1, d - 1);
  const b = randomInt(1, d - 1);
  const correct = simplifyFraction(a + b, d);
  // Distractors: common mistakes (added denominators, off-by-one, unsimplified).
  const candidates = [
    `${a + b}/${d + d}`,
    simplifyFraction(a + b + 1, d),
    simplifyFraction(Math.max(1, a + b - 1), d),
    `${a + b}/${d}`,
  ];
  return { question: `${a}/${d} + ${b}/${d} = ?`, correctAnswer: correct, options: buildListOptions(correct, candidates) };
}

function genFractionDiffDen() {
  let d1 = randomInt(2, 6);
  let d2 = randomInt(2, 6);
  while (d2 === d1) d2 = randomInt(2, 6);
  const a = randomInt(1, d1 - 1);
  const b = randomInt(1, d2 - 1);
  const correct = simplifyFraction(a * d2 + b * d1, d1 * d2);
  // Distractors: the classic "add tops and bottoms" mistake plus near misses.
  const candidates = [
    `${a + b}/${d1 + d2}`,
    simplifyFraction(a * d2 + b * d1 + 1, d1 * d2),
    simplifyFraction(a * d2, d1 * d2),
    simplifyFraction(b * d1, d1 * d2),
  ];
  return { question: `${a}/${d1} + ${b}/${d2} = ?`, correctAnswer: correct, options: buildListOptions(correct, candidates) };
}

function genFraction(level) {
  if (level === 'beginner') return genFractionCompare();
  if (level === 'intermediate') return genFractionSameDen();
  return genFractionDiffDen();
}

/*
 * Dispatcher: route a (subject, level) pair to the right generator.
 * Inputs may arrive as labels ("Addition", "Beginner"), so normalize to
 * lowercase keys first. Unknown subjects fall back to addition.
 */
function generateQuestion(subject, level) {
  const s = String(subject).toLowerCase();
  const l = String(level).toLowerCase();
  switch (s) {
    case 'subtraction':    return genSubtraction(l);
    case 'multiplication': return genMultiplication(l);
    case 'division':       return genDivision(l);
    case 'percentages':    return genPercentage(l);
    case 'fractions':      return genFraction(l);
    case 'addition':
    default:               return genAddition(l);
  }
}

/*
 * Public API used by QuizPage.
 */

// Build a quiz: an array of `count` questions for the chosen subject/level.
// A signature (question text + options) de-duplicates so the same question
// isn't served twice in one session.
export function generateQuestions(subject, level, count = QUESTIONS_PER_QUIZ) {
  const questions = [];
  const seen = new Set();
  let safety = 0;
  while (questions.length < count && safety < count * 20) {
    safety++;
    const q = generateQuestion(subject, level);
    const signature = `${q.question}|${q.options.join(',')}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    questions.push(q);
  }
  return questions;
}

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

// Generate a single question for a given subject and level.
export function generateOneQuestion(subject, level) {
  return generateQuestion(subject, level);
}

// Check whether a chosen answer matches the question's correct answer.
export function isCorrect(question, answer) {
  return question.correctAnswer === answer;
}
