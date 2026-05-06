/* ============================================================
   quiz.js
   ------------------------------------------------------------
   The quiz engine. Reads the chosen subject and level from
   home.js (selectedSubject, selectedLevel), generates a small
   batch of questions, runs a 60-second timer per question,
   tracks score, and finally hands off to Results.

   Public API:
     renderQuiz()   Render hook — auto-called by navigation.js
                    when the Quiz screen becomes visible.
                    Two paths:
                      - quiz already in progress  →  resume timer
                      - no quiz in progress       →  start fresh
     goToBot()      Pause the timer, then navigate to the AI
                    Bot Chat screen. Bound to the "Need help?"
                    button in index.html.

   Module state (read by results.js in Milestone 5):
     quizState      Plain object, full snapshot of the current
                    or just-finished quiz: questions, answers,
                    score, subject, level, total time.
   ============================================================ */

const quizState = {
  inProgress:    false,
  questions:     [],
  currentIdx:    0,
  score:         0,
  timeLeft:      0,
  timerInterval: null,
  subject:       null,
  level:         null,
  startTime:     null,
  answers:       [],
};


/* ----- Render hook ----- */

function renderQuiz() {
  // Resume path: a quiz is mid-flight (e.g. came back from bot).
  // The DOM still holds the current question — we only need to
  // restart the per-second timer interval.
  if (quizState.inProgress) {
    startQuestionTimer();
    return;
  }

  // Fresh-start path: needs a subject and level chosen on Home.
  if (!selectedSubject || !selectedLevel) {
    showScreen('home');
    return;
  }

  startNewQuiz();
  refreshQuizUI();
  startQuestionTimer();
}


/* ----- Lifecycle ----- */

function startNewQuiz() {
  quizState.subject    = selectedSubject;
  quizState.level      = selectedLevel;
  quizState.questions  = generateQuestions(selectedSubject, selectedLevel);
  quizState.currentIdx = 0;
  quizState.score      = 0;
  quizState.timeLeft   = QUESTION_TIME_LIMIT;
  quizState.startTime  = Date.now();
  quizState.answers    = [];
  quizState.inProgress = true;
}

function finishQuiz() {
  pauseQuestionTimer();
  quizState.inProgress = false;
  quizState.timeUsed = Math.round((Date.now() - quizState.startTime) / 1000);

  saveQuizResult();
  showScreen('results');
}

function saveQuizResult() {
  const user = getCurrentUser();
  if (!user) return;

  if (!Array.isArray(user.history))    user.history = [];
  if (typeof user.points !== 'number') user.points  = 0;

  const record = {
    date:     new Date().toISOString(),
    subject:  quizState.subject,
    level:    quizState.level,
    score:    quizState.score,
    total:    quizState.questions.length,
    timeUsed: quizState.timeUsed,
  };

  user.points += quizState.score;
  user.history.unshift(record);  // newest first

  updateUser(user);
}

function goToBot() {
  pauseQuestionTimer();
  showScreen('bot');
}


/* ----- Question generation ----- */

function generateQuestions(subjectId, levelId) {
  const out = [];
  for (let i = 0; i < QUESTIONS_PER_QUIZ; i++) {
    out.push(generateQuestion(subjectId, levelId));
  }
  return out;
}

function generateQuestion(subjectId, levelId) {
  switch (subjectId) {
    case 'addition':       return generateArithmetic(subjectId, levelId, '+');
    case 'subtraction':    return generateArithmetic(subjectId, levelId, '−');
    case 'multiplication': return generateArithmetic(subjectId, levelId, '×');
    case 'division':       return generateArithmetic(subjectId, levelId, '÷');
    case 'fractions':      return pickFromPool(FRACTION_POOL[levelId]);
    case 'percentages':    return pickFromPool(PERCENTAGE_POOL[levelId]);
  }
}

function generateArithmetic(subjectId, levelId, opSymbol) {
  const range = ARITHMETIC_RANGES[subjectId][levelId];
  let a = randInt(range.min, range.max);
  let b = randInt(range.min, range.max);
  let answer;

  switch (opSymbol) {
    case '+':
      answer = a + b;
      break;

    case '−':
      // Ensure non-negative: keep larger first.
      if (b > a) { const t = a; a = b; b = t; }
      answer = a - b;
      break;

    case '×':
      answer = a * b;
      break;

    case '÷':
      // Build a clean division: pick result and divisor, multiply.
      const result  = randInt(range.min, range.max);
      const divisor = randInt(range.min, range.max);
      a      = result * divisor;
      b      = divisor;
      answer = result;
      break;
  }

  return makeQuestion(a + ' ' + opSymbol + ' ' + b + ' = ?', answer);
}

function pickFromPool(pool) {
  const item = pool[randInt(0, pool.length - 1)];
  return makeQuestion(item.q, item.correct);
}

function makeQuestion(qText, correctAnswer) {
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const off  = randInt(1, 5) * sign;
    const candidate = correctAnswer + off;
    if (candidate !== correctAnswer && candidate >= 0) {
      wrongs.add(candidate);
    }
  }
  const options = [correctAnswer].concat(Array.from(wrongs));
  shuffle(options);
  return {
    q:          qText,
    options:    options,
    correctIdx: options.indexOf(correctAnswer),
  };
}


/* ----- UI rendering ----- */

function refreshQuizUI() {
  const q = quizState.questions[quizState.currentIdx];
  const subject = SUBJECTS.find(function (s) { return s.id === quizState.subject; });
  const level   = LEVELS.find(function (l)   { return l.id === quizState.level;   });

  document.getElementById('quiz-subject-label').textContent =
    subject.icon + ' ' + subject.name;
  document.getElementById('quiz-level-label').textContent =
    level.emoji + ' ' + level.name;

  document.getElementById('quiz-question-num').textContent   = quizState.currentIdx + 1;
  document.getElementById('quiz-question-total').textContent = quizState.questions.length;
  document.getElementById('quiz-question').textContent       = q.q;
  document.getElementById('quiz-score').textContent          = quizState.score;

  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';
  q.options.forEach(function (opt, idx) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = opt;
    btn.className =
      'py-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 ' +
      'rounded-xl text-2xl font-bold text-slate-700 transition-all';
    btn.addEventListener('click', function () {
      handleAnswer(idx);
    });
    optsContainer.appendChild(btn);
  });

  updateTimerDisplay();
}

function highlightAnswer(chosenIdx, correctIdx) {
  const buttons = document.querySelectorAll('#quiz-options button');
  buttons.forEach(function (btn, idx) {
    btn.disabled = true;
    btn.classList.remove(
      'hover:bg-indigo-50', 'bg-slate-50', 'border-slate-200', 'text-slate-700'
    );
    if (idx === correctIdx) {
      btn.classList.add('bg-green-500', 'text-white', 'border-green-600');
    } else if (idx === chosenIdx) {
      btn.classList.add('bg-red-500', 'text-white', 'border-red-600');
    } else {
      btn.classList.add('opacity-40');
    }
  });
}


/* ----- Timer ----- */

function startQuestionTimer() {
  pauseQuestionTimer();  // never let two intervals run at once
  quizState.timerInterval = setInterval(function () {
    quizState.timeLeft--;
    updateTimerDisplay();
    if (quizState.timeLeft <= 0) {
      handleAnswer(-1);  // -1 means "no answer chosen"
    }
  }, 1000);
}

function pauseQuestionTimer() {
  if (quizState.timerInterval !== null) {
    clearInterval(quizState.timerInterval);
    quizState.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const el = document.getElementById('quiz-timer');
  el.textContent = quizState.timeLeft;
  if (quizState.timeLeft <= 10) {
    el.classList.add('text-red-500');
    el.classList.remove('text-indigo-600');
  } else {
    el.classList.remove('text-red-500');
    el.classList.add('text-indigo-600');
  }
}


/* ----- Answering ----- */

function handleAnswer(chosenIdx) {
  pauseQuestionTimer();

  const q = quizState.questions[quizState.currentIdx];
  const isCorrect = (chosenIdx === q.correctIdx);

  quizState.answers.push({
    chosenIdx: chosenIdx,
    isCorrect: isCorrect,
  });
  if (isCorrect) {
    quizState.score++;
  }

  highlightAnswer(chosenIdx, q.correctIdx);

  setTimeout(function () {
    quizState.currentIdx++;
    if (quizState.currentIdx >= quizState.questions.length) {
      finishQuiz();
    } else {
      quizState.timeLeft = QUESTION_TIME_LIMIT;
      refreshQuizUI();
      startQuestionTimer();
    }
  }, 1200);
}


/* ----- Helpers ----- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
