/* ============================================================
   results.js
   ------------------------------------------------------------
   Renders the Results screen at the end of a quiz. Reads the
   final state from quizState (in quiz.js) and shows score,
   stars, subject, level, time, and points earned.

   Public API:
     renderResults()   Render hook — auto-called by
                       navigation.js when the Results screen
                       becomes visible.

   Notes:
     - Save-to-history happens in quiz.js saveQuizResult()
       BEFORE this render runs. So when the user lands on
       Results, points and history are already persisted.
     - The "Play Again" and "Back to Home" buttons use plain
       onclick handlers in index.html.
   ============================================================ */

function renderResults() {
  const subject = SUBJECTS.find(function (s) { return s.id === quizState.subject; });
  const level   = LEVELS.find(function (l)   { return l.id === quizState.level;   });
  const total   = quizState.questions.length;
  const score   = quizState.score;

  document.getElementById('results-score').textContent   = score;
  document.getElementById('results-total').textContent   = total;
  document.getElementById('results-subject').textContent =
    subject ? (subject.icon + ' ' + subject.name) : '—';
  document.getElementById('results-level').textContent   =
    level ? (level.emoji + ' ' + level.name) : '—';
  document.getElementById('results-time').textContent    = formatTime(quizState.timeUsed);
  document.getElementById('results-points').textContent  = score;

  renderHeadline(score, total);
  renderStars(score, total);
}

function renderHeadline(score, total) {
  const el = document.getElementById('results-headline');
  if (score === total) {
    el.textContent = 'Perfect! 🎉';
  } else if (score >= total * 0.6) {
    el.textContent = 'Great job!';
  } else if (score > 0) {
    el.textContent = 'Good try!';
  } else {
    el.textContent = "Don't give up — try again!";
  }
}

function renderStars(score, total) {
  const container = document.getElementById('results-stars');
  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const span = document.createElement('span');
    span.textContent = i < score ? '⭐' : '☆';
    container.appendChild(span);
  }
}

function formatTime(secs) {
  if (secs < 60) return secs + 's';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + 'm ' + s + 's';
}
