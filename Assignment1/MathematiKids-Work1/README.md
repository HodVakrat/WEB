# MathematiKids

A web layout for an interactive math learning app for children aged 6-12.
The kid logs in, picks a math subject and a difficulty level, takes a short
quiz, can ask an in-quiz AI bot for help, earns points, and spends them
on cosmetic skins in the store.
---

## Tech Stack

- **HTML5** — single page, eight `<section>` screens
- **Tailwind CSS** (loaded via CDN) — utility-first styling
- **Vanilla JavaScript** — no framework
- **localStorage** — fake-data persistence for users, points, and history

No build step. No `npm install`. Open `index.html` and it runs.

---

## File Structure

```
MathematiKids-Layout/
├── index.html              # Single HTML, all 8 screens as <section>
├── README.md               # This file
│
├── css/
│   └── style.css           # Custom CSS extras (animations, gradients)
│
└── js/
    ├── data.js             # Fake data: subjects, questions, skins, bot replies
    ├── storage.js          # localStorage helpers
    ├── navigation.js       # showScreen(name) + boot routing
    ├── auth.js             # Login + Register handlers
    ├── home.js             # Home dashboard rendering
    ├── quiz.js             # Quiz state, timer, scoring
    ├── results.js          # Results screen rendering
    ├── bot.js              # AI bot chat widget
    ├── store.js            # Store grid + buy logic
    ├── history.js          # History table rendering
    └── app.js              # Entry point, DOMContentLoaded init
```

Each JavaScript file owns one feature (high cohesion). Files share state
through the global `localStorage` and a small set of named functions, never
through direct imports (low coupling).

---

## Navigation Architecture

Every arrow is a user action. Every box is a screen.

```
[LOGIN] ───── login success ─────────────────────────→ [HOME]
   │
   └── "Don't have account?" ──→ [REGISTER] ── register success ──→ [LOGIN]


[HOME] ──── "Start Quiz" (after picking subject + level) ───→ [QUIZ]
[HOME] ──── "Store"   ──→ [STORE]   ── "Back" ──→ [HOME]
[HOME] ──── "History" ──→ [HISTORY] ── "Back" ──→ [HOME]
[HOME] ──── "Logout"  ──→ [LOGIN]


[QUIZ] ──── answer question  (auto-advance to next) ──→ [QUIZ]
[QUIZ] ──── last question / timer reaches 0          ──→ [RESULTS]
[QUIZ] ──── "Need help?" button                      ──→ [AI BOT CHAT]


[AI BOT CHAT] ──── "Back to question" ──→ [QUIZ]   (state preserved)


[RESULTS] ──── "Play Again" (same subject + level) ──→ [QUIZ]
[RESULTS] ──── "Back to Home"                      ──→ [HOME]
```

**Implementation rule.**
Every screen is a `<section id="screen-{name}">` inside `<body>`. All
screens carry `class="hidden"` by default. The function `showScreen(name)`
removes `hidden` from the target screen and adds it to all others.

**Quiz state preservation.**
While a quiz is in progress, its current question index, score, and
remaining time are kept in a `quizState` object in JavaScript memory.
Navigating from Quiz to AI Bot Chat and back simply hides and reveals
sections, so `quizState` is untouched and the question resumes exactly
where it was.

---

## How to Run

**Quick option.** Double-click `index.html`. It opens in your default
browser.

---

## Milestones

The project is built in 8 incremental milestones. After each one, the
app is openable in a browser and demonstrates real, working progress.

> Status: `[x]` complete · `[ ]` planned for future work

- [x] **Milestone 1 — Skeleton.** Folder structure, `index.html` with
      Tailwind CDN, all eight screens as empty `<section>` tags,
      `showScreen()` navigation function, and a render-hook system
      that lets each feature module register its own renderer without
      `navigation.js` knowing about it.

- [x] **Milestone 2 — Authentication.** Real Login and Register forms,
      avatar picker (10 emoji choices), validation (unique username,
      age 6-12, matching passwords), persistence to `localStorage`,
      auto-login after register, and logout that clears the session.

- [x] **Milestone 3 — Home Dashboard.** Greeting header with avatar,
      username, and current points. Subject grid (six topics:
      addition, subtraction, multiplication, division, fractions,
      percentages). Level picker (Beginner, Intermediate, Advanced).
      Start Quiz button enabled only when both are selected.
      Navigation tiles to Store, History, and Logout.

- [x] **Milestone 4 — Quiz Engine.** Five questions per quiz session.
      Arithmetic questions generated at runtime within
      level-appropriate number ranges; fractions and percentages
      drawn from a hand-written pool. Each question shows four
      options (one correct, three distractors near the answer), a
      60-second timer that turns red below 10 seconds, a running
      score, and a "Need help?" button that pauses the timer and
      opens the bot.

- [x] **Milestone 5 — Results Screen.** Adaptive headline (Perfect /
      Great / Good / Don't give up), large X/Y score, star row, and
      info card with subject, level, time, and points earned. The
      result is appended to the user's history and points are added
      to the total in `localStorage`. Play Again restarts the same
      subject and level with fresh questions.

- [ ] **Milestone 6 — AI Bot Chat.** Static chat widget reachable
      from the Quiz screen. Pre-canned bot messages, quick-reply
      buttons (ask for a hint, see the solution, return to the
      question). No real AI — illustrative UI only. Returning to
      the quiz preserves the in-flight question state.

- [ ] **Milestone 7 — Store and History.** Store: a grid of skin
      items with cost in points and a Buy button (deducts points,
      marks an item as owned). History: a table of past quizzes
      with date, subject, level, score, and time, sourced from
      `localStorage`.

- [ ] **Milestone 8 — Polish.**