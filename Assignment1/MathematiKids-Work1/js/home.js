/* ============================================================
   home.js
   ------------------------------------------------------------
   Renders the Home dashboard from the current user. Lets the
   kid pick a subject and a level, and launches the quiz.

   Public API:
     initHome()        Bind the Start Quiz button. Called once
                       from app.js at boot.
     renderHome()      Read currentUser, fill the header
                       (avatar, name, points), render subject
                       grid + level picker, reset selections.
                       Auto-called by navigation.js whenever
                       Home becomes visible (render hook).

   Module state (read by quiz.js in Milestone 4):
     selectedSubject   id of the chosen subject, or null
     selectedLevel     id of the chosen level,   or null
   ============================================================ */

let selectedSubject = null;
let selectedLevel   = null;

function initHome() {
  document.getElementById('home-start-quiz')
    .addEventListener('click', function () {
      if (!selectedSubject || !selectedLevel) return;
      showScreen('quiz');
    });
}

function renderHome() {
  const user = getCurrentUser();
  if (!user) {
    showScreen('login');
    return;
  }

  document.getElementById('home-avatar').textContent   = user.avatar;
  document.getElementById('home-username').textContent = user.username;
  document.getElementById('home-points').textContent   = user.points;

  // Reset subject/level selections every time Home becomes visible.
  selectedSubject = null;
  selectedLevel   = null;
  updateStartQuizButton();

  renderSubjectGrid();
  renderLevelGrid();
}

function renderSubjectGrid() {
  const container = document.getElementById('home-subjects');
  container.innerHTML = '';

  SUBJECTS.forEach(function (s) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.subject = s.id;
    btn.className =
      'bg-slate-50 hover:bg-indigo-50 border-2 border-transparent ' +
      'rounded-xl p-4 flex flex-col items-center transition-all';
    btn.innerHTML =
      '<span class="text-5xl">' + s.icon + '</span>' +
      '<span class="font-semibold text-slate-700 mt-2">' + s.name + '</span>';

    btn.addEventListener('click', function () {
      clearGridSelection(container);
      btn.classList.remove('border-transparent');
      btn.classList.add('border-indigo-500', 'bg-indigo-50');
      selectedSubject = s.id;
      updateStartQuizButton();
    });

    container.appendChild(btn);
  });
}

function renderLevelGrid() {
  const container = document.getElementById('home-levels');
  container.innerHTML = '';

  LEVELS.forEach(function (l) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.level = l.id;
    btn.className =
      'bg-slate-50 hover:bg-indigo-50 border-2 border-transparent ' +
      'rounded-xl p-3 flex flex-col items-center transition-all';
    btn.innerHTML =
      '<span class="text-3xl">' + l.emoji + '</span>' +
      '<span class="font-semibold text-slate-700 mt-1">' + l.name + '</span>';

    btn.addEventListener('click', function () {
      clearGridSelection(container);
      btn.classList.remove('border-transparent');
      btn.classList.add('border-indigo-500', 'bg-indigo-50');
      selectedLevel = l.id;
      updateStartQuizButton();
    });

    container.appendChild(btn);
  });
}

function clearGridSelection(container) {
  container.querySelectorAll('button').forEach(function (b) {
    b.classList.remove('border-indigo-500', 'bg-indigo-50');
    b.classList.add('border-transparent');
  });
}

function updateStartQuizButton() {
  const btn = document.getElementById('home-start-quiz');
  btn.disabled = !(selectedSubject && selectedLevel);
}
