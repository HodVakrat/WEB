/* ============================================================
   data.js
   ------------------------------------------------------------
   Read-only fake data and tunable constants. Used to populate
   the UI without a backend.

   Milestone 2: AVATARS for the avatar picker on registration.
   Milestone 3: SUBJECTS and LEVELS for the Home dashboard.
   Milestone 4: QUESTIONS_PER_QUIZ, QUESTION_TIME_LIMIT,
                ARITHMETIC_RANGES, FRACTION_POOL, PERCENTAGE_POOL.
   ============================================================ */

const AVATARS = [
  '🐱', '🐶', '🦁', '🐼', '🐸',
  '🦄', '🤖', '👑', '🐲', '🦊',
];

const SUBJECTS = [
  { id: 'addition',       name: 'Addition',       icon: '➕'  },
  { id: 'subtraction',    name: 'Subtraction',    icon: '➖'  },
  { id: 'multiplication', name: 'Multiplication', icon: '✖️' },
  { id: 'division',       name: 'Division',       icon: '➗'  },
  { id: 'fractions',      name: 'Fractions',      icon: '🍕' },
  { id: 'percentages',    name: 'Percentages',    icon: '💯' },
];

const LEVELS = [
  { id: 'beginner',     name: 'Beginner',     emoji: '🌱' },
  { id: 'intermediate', name: 'Intermediate', emoji: '🌿' },
  { id: 'advanced',     name: 'Advanced',     emoji: '🌳' },
];


/* ----- Quiz tuning constants (Milestone 4) ----- */

const QUESTIONS_PER_QUIZ  = 5;   // total questions per quiz session
const QUESTION_TIME_LIMIT = 60;  // seconds allowed for each question


/* ----- Number ranges for arithmetic question generation -----
   Used by quiz.js generateArithmetic() to pick operands inside
   the right difficulty band.
*/
const ARITHMETIC_RANGES = {
  addition: {
    beginner:     { min: 1,  max: 10  },
    intermediate: { min: 10, max: 50  },
    advanced:     { min: 50, max: 100 },
  },
  subtraction: {
    beginner:     { min: 1,  max: 10  },
    intermediate: { min: 10, max: 50  },
    advanced:     { min: 50, max: 100 },
  },
  multiplication: {
    beginner:     { min: 1, max: 5  },
    intermediate: { min: 2, max: 10 },
    advanced:     { min: 5, max: 12 },
  },
  division: {
    beginner:     { min: 1, max: 5  },
    intermediate: { min: 2, max: 10 },
    advanced:     { min: 3, max: 12 },
  },
};


/* ----- Hand-written question pools for fractions/percentages -----
   Arithmetic ops can be generated; these need real word-problems.
   quiz.js pickFromPool() chooses one at random per question slot.
*/

const FRACTION_POOL = {
  beginner: [
    { q: '1/2 of 10 = ?',  correct: 5  },
    { q: '1/2 of 6 = ?',   correct: 3  },
    { q: '1/3 of 9 = ?',   correct: 3  },
    { q: '1/4 of 8 = ?',   correct: 2  },
    { q: '1/5 of 10 = ?',  correct: 2  },
    { q: '1/2 of 4 = ?',   correct: 2  },
    { q: '1/3 of 12 = ?',  correct: 4  },
    { q: '1/4 of 12 = ?',  correct: 3  },
  ],
  intermediate: [
    { q: '1/2 of 24 = ?',  correct: 12 },
    { q: '2/3 of 9 = ?',   correct: 6  },
    { q: '3/4 of 8 = ?',   correct: 6  },
    { q: '2/5 of 15 = ?',  correct: 6  },
    { q: '1/6 of 24 = ?',  correct: 4  },
    { q: '3/5 of 10 = ?',  correct: 6  },
    { q: '2/4 of 16 = ?',  correct: 8  },
    { q: '3/6 of 18 = ?',  correct: 9  },
  ],
  advanced: [
    { q: '2/3 of 27 = ?',  correct: 18 },
    { q: '3/4 of 32 = ?',  correct: 24 },
    { q: '5/6 of 18 = ?',  correct: 15 },
    { q: '4/5 of 25 = ?',  correct: 20 },
    { q: '3/7 of 21 = ?',  correct: 9  },
    { q: '5/8 of 40 = ?',  correct: 25 },
    { q: '7/9 of 27 = ?',  correct: 21 },
    { q: '3/8 of 40 = ?',  correct: 15 },
  ],
};

const PERCENTAGE_POOL = {
  beginner: [
    { q: '10% of 100 = ?', correct: 10 },
    { q: '50% of 10 = ?',  correct: 5  },
    { q: '50% of 20 = ?',  correct: 10 },
    { q: '25% of 100 = ?', correct: 25 },
    { q: '100% of 50 = ?', correct: 50 },
    { q: '50% of 4 = ?',   correct: 2  },
    { q: '10% of 50 = ?',  correct: 5  },
    { q: '100% of 35 = ?', correct: 35 },
  ],
  intermediate: [
    { q: '20% of 50 = ?',  correct: 10 },
    { q: '25% of 60 = ?',  correct: 15 },
    { q: '40% of 30 = ?',  correct: 12 },
    { q: '75% of 20 = ?',  correct: 15 },
    { q: '10% of 250 = ?', correct: 25 },
    { q: '60% of 50 = ?',  correct: 30 },
    { q: '30% of 40 = ?',  correct: 12 },
    { q: '5% of 100 = ?',  correct: 5  },
  ],
  advanced: [
    { q: '15% of 80 = ?',  correct: 12 },
    { q: '35% of 60 = ?',  correct: 21 },
    { q: '12% of 200 = ?', correct: 24 },
    { q: '85% of 40 = ?',  correct: 34 },
    { q: '23% of 100 = ?', correct: 23 },
    { q: '5% of 320 = ?',  correct: 16 },
    { q: '65% of 80 = ?',  correct: 52 },
    { q: '18% of 50 = ?',  correct: 9  },
  ],
};
