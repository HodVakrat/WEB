/* ============================================================
   navigation.js
   ------------------------------------------------------------
   Owns all screen visibility. The app has 8 screens, all of
   them <section id="screen-{name}"> elements. At any moment
   exactly one screen is visible; the others carry the Tailwind
   "hidden" class.

   Public API:
     showScreen(name)   Hide every screen and reveal the target.
                        After revealing, calls a render hook if
                        the matching feature module defines one
                        (see "Render hooks" below).

   Render hooks:
     If a top-level function called "renderXxx" exists where
     "Xxx" matches the screen name (capitalized), it is called
     after the screen becomes visible. Examples:
        showScreen('home')    → renderHome()    if defined
        showScreen('quiz')    → renderQuiz()    if defined
        showScreen('history') → renderHistory() if defined

     This lets each feature file (home.js, quiz.js, ...) own
     its own rendering logic without navigation.js needing to
     know about any of them. Loose coupling.
   ============================================================ */

const SCREENS = [
  'login',
  'register',
  'home',
  'quiz',
  'results',
  'bot',
  'store',
  'history',
];

function showScreen(name) {
  if (!SCREENS.includes(name)) {
    console.warn('showScreen: unknown screen name "' + name + '"');
    return;
  }

  SCREENS.forEach(function (s) {
    const el = document.getElementById('screen-' + s);
    if (!el) return;
    if (s === name) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Call the matching render hook if the feature module defined one.
  // Top-level function declarations in browsers become properties of
  // the global "window" object, which lets us look them up by name.
  const hookName = 'render' + name.charAt(0).toUpperCase() + name.slice(1);
  if (typeof window[hookName] === 'function') {
    window[hookName]();
  }
}
