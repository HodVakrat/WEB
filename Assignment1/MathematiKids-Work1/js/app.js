/* ============================================================
   app.js
   ------------------------------------------------------------
   Entry point. Runs once the DOM is ready.

   Boot flow:
     1. Wire up auth handlers (login, register, avatar picker).
     2. Wire up the Home dashboard button bindings.
     3. Decide initial screen:
          - logged-in user in localStorage  →  Home
          - otherwise                       →  Login

   showScreen() automatically calls the matching renderXxx()
   hook, so the destination screen is filled with fresh
   content without us having to do it explicitly here.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initAuth();
  initHome();

  if (getCurrentUser()) {
    showScreen('home');
  } else {
    showScreen('login');
  }
});
